/**
 * MTN Mobile Money (Rwanda) — Collections API
 * Docs: https://momodeveloper.mtn.com/docs/services/collection
 */
import { config } from '../config.js';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const BASE = config.MTN_MOMO_BASE_URL;
const ENV  = config.MTN_MOMO_ENVIRONMENT;

/**
 * Get an OAuth2 access token for the Collections product.
 */
async function getAccessToken() {
  const credentials = Buffer.from(
    `${config.MTN_MOMO_API_USER}:${config.MTN_MOMO_API_KEY}`
  ).toString('base64');

  const res = await fetch(`${BASE}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': config.MTN_MOMO_PRIMARY_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MoMo token error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Request a payment from the customer's MoMo wallet.
 * Returns the externalId (our reference) used to poll the status.
 */
export async function requestPayment({ orderId, phone, amount, note }) {
  const externalId = uuidv4();
  const token = await getAccessToken();

  // Store initial record
  await query(
    `INSERT INTO momo_transactions
       (order_id, external_id, status, amount, payer_msisdn)
     VALUES ($1,$2,'PENDING',$3,$4)`,
    [orderId, externalId, amount, phone]
  );

  const body = {
    amount: String(Math.round(amount)),
    currency: config.MTN_MOMO_CURRENCY,
    externalId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phone.replace(/\D/g, ''),  // digits only
    },
    payerMessage: `Simba Supermarket order ${orderId}`,
    payeeNote: note || `Order ${orderId}`,
  };

  const res = await fetch(`${BASE}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': externalId,
      'X-Target-Environment': ENV,
      'X-Callback-Url': config.MTN_MOMO_CALLBACK_URL,
      'Ocp-Apim-Subscription-Key': config.MTN_MOMO_PRIMARY_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status !== 202) {
    const text = await res.text();
    throw new Error(`MoMo requesttopay error: ${res.status} ${text}`);
  }

  return externalId;
}

/**
 * Poll transaction status for a given externalId.
 * Returns: 'PENDING' | 'SUCCESSFUL' | 'FAILED'
 */
export async function getPaymentStatus(externalId) {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE}/collection/v1_0/requesttopay/${externalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': ENV,
        'Ocp-Apim-Subscription-Key': config.MTN_MOMO_PRIMARY_KEY,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MoMo status error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const status = data.status; // 'PENDING' | 'SUCCESSFUL' | 'FAILED'

  // Update our transaction record
  await query(
    `UPDATE momo_transactions
     SET status = $1, financial_txn = $2, raw_response = $3, updated_at = NOW()
     WHERE external_id = $4`,
    [status, data.financialTransactionId || null, JSON.stringify(data), externalId]
  );

  return { status, financialTransactionId: data.financialTransactionId, raw: data };
}
