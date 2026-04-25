import { config } from '../config.js';

/**
 * Send an email using Resend (https://resend.com) or fallback to SMTP via nodemailer.
 * Install: npm install resend   OR   npm install nodemailer
 */

function formatPrice(n) {
  return new Intl.NumberFormat('en-RW').format(n) + ' RWF';
}

function orderConfirmationHtml(order) {
  const rows = order.items.map(i => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(i.unit_price)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(i.line_total)}</td>
    </tr>`).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family:sans-serif;background:#f5f5f5;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#16a34a;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0">🛒 Simba Supermarket</h1>
      <p style="color:#bbf7d0;margin:4px 0 0">Rwanda's Online Supermarket</p>
    </div>

    <div style="padding:32px">
      <h2 style="margin:0 0 8px">Order Confirmed! 🎉</h2>
      <p style="color:#666">Hi ${order.full_name}, your order has been received.</p>

      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#666">Order Number</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#16a34a;font-family:monospace">${order.id}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="border-top:2px solid #eee;padding-top:12px;text-align:right">
        <p style="margin:4px 0;color:#666">Subtotal: <strong>${formatPrice(order.subtotal)}</strong></p>
        <p style="margin:4px 0;color:#666">Delivery: <strong>${order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}</strong></p>
        <p style="margin:8px 0 0;font-size:18px">Total: <strong style="color:#16a34a">${formatPrice(order.total)}</strong></p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">

      <h3 style="margin:0 0 8px">Delivery Details</h3>
      <p style="margin:4px 0;color:#444">${order.address}, ${order.district}, ${order.city}</p>
      <p style="margin:4px 0;color:#444">📞 ${order.phone}</p>
      <p style="margin:4px 0;color:#444">💳 Payment: <strong>${order.payment_method === 'momo' ? 'MTN MoMo' : 'Cash on Delivery'}</strong></p>
    </div>

    <div style="background:#f9fafb;padding:16px;text-align:center;color:#999;font-size:12px">
      <p style="margin:0">Simba Supermarket • Kigali, Rwanda</p>
      <p style="margin:4px 0">Questions? Call us or reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main send function. Uses Resend by default.
 * Falls back gracefully if no API key configured (logs in dev).
 */
export async function sendOrderConfirmation(order) {
  if (!order.email) return; // no email provided

  const subject = `Order Confirmed: ${order.id} — Simba Supermarket`;
  const html = orderConfirmationHtml(order);

  if (config.EMAIL_PROVIDER === 'resend' && config.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: order.email,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
    }
    return;
  }

  // Dev fallback — just log
  if (config.NODE_ENV === 'development') {
    console.log(`📧 [DEV] Would send confirmation to ${order.email} for order ${order.id}`);
  }
}

/**
 * Send status update notification to customer
 */
export async function sendStatusUpdate(order, newStatus) {
  if (!order.email) return;

  const statusLabels = {
    confirmed:         'Your order has been confirmed ✅',
    processing:        'We are packing your order 📦',
    out_for_delivery:  'Your order is on the way 🚚',
    delivered:         'Your order has been delivered 🎉',
    cancelled:         'Your order has been cancelled',
  };

  const label = statusLabels[newStatus] || `Order status updated to: ${newStatus}`;

  if (config.EMAIL_PROVIDER === 'resend' && config.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: order.email,
        subject: `${label} — Order ${order.id}`,
        html: `<p>Hi ${order.full_name},</p><p>${label}</p><p>Order: <strong>${order.id}</strong></p><p>— Simba Supermarket Team</p>`,
      }),
    });
  }
}
