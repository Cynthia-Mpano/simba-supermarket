/**
 * app/checkout/page.tsx — updated handleSubmit
 * 
 * Replace ONLY the handleSubmit function in your existing checkout/page.tsx.
 * Everything else (UI, form state) stays the same.
 */

// Add this import at the top of your checkout page:
// import { placeOrder } from '@/lib/api';
// import { getMomoStatus } from '@/lib/api';

// ── Replace the existing handleSubmit with this ───────────────────────

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const result = await placeOrder({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address,
      city: formData.city,
      district: formData.district,
      paymentMethod,
      items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
    });

    // If MoMo, poll until confirmed or failed
    if (paymentMethod === 'momo' && result.momoReference) {
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes at 5s intervals

      const poll = setInterval(async () => {
        attempts++;
        try {
          const { status } = await getMomoStatus(result.orderId);

          if (status === 'SUCCESSFUL' || attempts >= maxAttempts) {
            clearInterval(poll);
            clearCart();
            router.push(`/order-confirmation?id=${result.orderId}`);
          } else if (status === 'FAILED') {
            clearInterval(poll);
            setIsSubmitting(false);
            alert('MoMo payment was declined. Please try again or choose Cash on Delivery.');
          }
        } catch {
          clearInterval(poll);
          clearCart();
          router.push(`/order-confirmation?id=${result.orderId}`);
        }
      }, 5000);

      return; // Don't redirect immediately — wait for MoMo
    }

    // Cash on delivery — redirect straight away
    clearCart();
    router.push(`/order-confirmation?id=${result.orderId}`);

  } catch (err: unknown) {
    setIsSubmitting(false);
    const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
    alert(message);
  }
};

// ── Also add this to your .env.local in the frontend ─────────────────
// NEXT_PUBLIC_API_URL=http://localhost:4000/api
