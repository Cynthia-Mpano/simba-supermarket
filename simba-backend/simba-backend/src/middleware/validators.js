/**
 * Validates the POST /api/orders request body.
 */
export function validateOrder(req, res, next) {
  const { fullName, phone, address, city, district, paymentMethod, items } = req.body;

  const errors = [];

  if (!fullName || fullName.trim().length < 2) errors.push('Full name is required');
  if (!phone || !/^\+?[\d\s\-()]{8,15}$/.test(phone)) errors.push('Valid phone number is required');
  if (!address || address.trim().length < 5) errors.push('Delivery address is required');
  if (!city) errors.push('City is required');
  if (!district) errors.push('District is required');
  if (!['momo', 'airtel', 'cash'].includes(paymentMethod)) errors.push('Payment method must be "momo", "airtel", or "cash"');

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    for (const item of items) {
      if (!item.id || typeof item.id !== 'number') errors.push(`Invalid product id: ${item.id}`);
      if (!item.quantity || item.quantity < 1) errors.push(`Invalid quantity for product ${item.id}`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}
