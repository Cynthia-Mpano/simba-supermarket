/**
 * SMS Service via Africa's Talking
 * Popular in Rwanda — https://africastalking.com
 * Install: npm install africastalking
 */
import { config } from '../config.js';

function formatPrice(n) {
  return new Intl.NumberFormat('en-RW').format(n) + ' RWF';
}

/**
 * Send an SMS to the customer's phone number.
 * Uses Africa's Talking REST API directly (no SDK needed).
 */
async function sendSMS(phone, message) {
  if (!config.AT_API_KEY || config.AT_USERNAME === 'sandbox') {
    if (config.NODE_ENV === 'development') {
      console.log(`📱 [DEV SMS] To: ${phone}\n${message}`);
    }
    return;
  }

  const params = new URLSearchParams({
    username: config.AT_USERNAME,
    to: phone,
    message,
    from: config.AT_SENDER_ID,
  });

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: config.AT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('AT SMS error:', err);
  }
}

export async function sendOrderConfirmationSMS(order) {
  const msg =
    `Simba Supermarket: Order ${order.id} confirmed! ` +
    `Total: ${formatPrice(order.total)}. ` +
    (order.payment_method === 'cash'
      ? 'Pay on delivery.'
      : 'Payment via MoMo.') +
    ' We will deliver soon. Thank you!';

  await sendSMS(order.phone, msg);
}

export async function sendStatusUpdateSMS(order, newStatus) {
  const messages = {
    confirmed:        `Your Simba order ${order.id} is confirmed. We are preparing it now.`,
    processing:       `Your Simba order ${order.id} is being packed. Almost ready!`,
    out_for_delivery: `Your Simba order ${order.id} is on the way! Expect delivery soon.`,
    delivered:        `Your Simba order ${order.id} has been delivered. Enjoy! Thank you for shopping with us.`,
    cancelled:        `Your Simba order ${order.id} has been cancelled. Contact us for help.`,
  };

  const msg = messages[newStatus];
  if (msg) await sendSMS(order.phone, msg);
}
