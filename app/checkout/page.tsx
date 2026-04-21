'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash'>('momo');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kigali',
    district: '',
  });

  const deliveryFee = cartTotal >= 50000 ? 0 : 2000;
  const total = cartTotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate order ID
    const orderId = `SIM-${Date.now().toString(36).toUpperCase()}`;

    // Clear cart and redirect to confirmation
    clearCart();
    router.push(`/order-confirmation?id=${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('emptyCart')}</h1>
          <Link href="/">
            <Button>{t('continueShopping')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg text-foreground">{t('checkoutTitle')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('deliveryInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('fullName')}</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Jean Baptiste"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phoneNumber')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+250 788 123 456"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="KG 123 St, Kacyiru"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('city')}</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{t('district')}</Label>
                      <Input
                        id="district"
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Gasabo"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('paymentMethod')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left',
                      paymentMethod === 'momo'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t('mobileMoney')}</p>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'en' && 'Pay securely with your MTN MoMo account'}
                        {locale === 'fr' && 'Payez en toute sécurité avec votre compte MTN MoMo'}
                        {locale === 'rw' && 'Ishyura neza ukoresheje konti yawe ya MTN MoMo'}
                      </p>
                    </div>
                    {paymentMethod === 'momo' && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left',
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t('cashOnDelivery')}</p>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'en' && 'Pay with cash when your order arrives'}
                        {locale === 'fr' && 'Payez en espèces à la livraison'}
                        {locale === 'rw' && "Ishyura mu mafaranga igihe ibyo watumije bigeze"}
                      </p>
                    </div>
                    {paymentMethod === 'cash' && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-14 h-14 bg-secondary rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price * item.quantity)} RWF
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subtotal')}</span>
                      <span>{formatPrice(cartTotal)} RWF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('deliveryFee')}</span>
                      <span>{deliveryFee === 0 ? t('free') : `${formatPrice(deliveryFee)} RWF`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                      <span>{t('total')}</span>
                      <span className="text-primary">{formatPrice(total)} RWF</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? t('processing') : t('placeOrder')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
