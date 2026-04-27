'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Banknote, CheckCircle2, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { placeOrder } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PaymentModal, airtelPaymentSimulator, momoPaymentSimulator } from '@/components/payment-modal';

type PaymentMethod = 'momo' | 'airtel' | 'cash';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentStep, setPaymentStep] = useState<'phone' | 'processing' | 'success' | 'failed'>('phone');
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'momo' || paymentMethod === 'airtel') {
      setPaymentPhone(formData.phone);
      setPaymentModalOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await placeOrder({
        ...formData,
        paymentMethod,
        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
      });
      clearCart();
      router.push(`/order-confirmation?id=${response.orderId}&method=${paymentMethod}`);
    } catch (err) {
      console.warn('Backend unavailable, using local order ID:', err);
      const orderId = `SIM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      clearCart();
      router.push(`/order-confirmation?id=${orderId}&method=${paymentMethod}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirm = () => {
    const simulator = paymentMethod === 'airtel' ? airtelPaymentSimulator : momoPaymentSimulator;
    
    simulator(
      paymentPhone,
      total,
      () => {
        setPaymentStep('success');
        setTimeout(() => {
          const orderId = `SIM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
          clearCart();
          router.push(`/order-confirmation?id=${orderId}&method=${paymentMethod}`);
        }, 1500);
      },
      () => {
        setPaymentStep('failed');
      }
    );
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('emptyCart')}</h1>
          <Link href="/"><Button>{t('continueShopping')}</Button></Link>
        </div>
      </div>
    );
  }

  const paymentOptions: { id: PaymentMethod; label: string; desc: string; color: string; icon: React.ReactNode }[] = [
    {
      id: 'momo',
      label: t('mobileMoney'),
      desc: t('momoDesc'),
      color: 'bg-yellow-400',
      icon: <Smartphone className="h-6 w-6 text-black" />,
    },
    {
      id: 'airtel',
      label: t('airtelMoney'),
      desc: t('airtelMoneyDesc'),
      color: 'bg-red-500',
      icon: <Smartphone className="h-6 w-6 text-white" />,
    },
    {
      id: 'cash',
      label: t('cashOnDelivery'),
      desc: t('cashDesc'),
      color: 'bg-green-500',
      icon: <Banknote className="h-6 w-6 text-white" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="font-bold text-lg text-foreground">{t('checkoutTitle')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

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
                      <Input id="fullName" required value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Jean Baptiste" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phoneNumber')}</Label>
                      <Input id="phone" type="tel" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+250 788 123 456" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Input id="address" required value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="KG 123 St, Kacyiru" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('city')}</Label>
                      <Input id="city" required value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{t('district')}</Label>
                      <Input id="district" required value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Gasabo" />
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
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left',
                        paymentMethod === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', option.color)}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                      {paymentMethod === option.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* MoMo / Airtel phone hint */}
                  {(paymentMethod === 'momo' || paymentMethod === 'airtel') && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        {paymentMethod === 'momo'
                          ? (locale === 'rw' ? 'Uzakira ubutumwa kuri telefoni yawe ya MTN kugira ngo wemeze kwishyura.' : locale === 'fr' ? 'Vous recevrez une notification sur votre téléphone MTN pour approuver le paiement.' : 'You will receive a prompt on your MTN phone to approve the payment.')
                          : (locale === 'rw' ? 'Uzakira ubutumwa kuri telefoni yawe ya Airtel kugira ngo wemeze kwishyura.' : locale === 'fr' ? 'Vous recevrez une notification sur votre téléphone Airtel pour approuver le paiement.' : 'You will receive a prompt on your Airtel phone to approve the payment.')}
                      </p>
                    </div>
                  )}
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
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-14 h-14 bg-secondary rounded-lg overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(item.price * item.quantity)} RWF</p>
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

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        paymentMethod={paymentMethod}
        amount={total}
        phone={paymentPhone}
        onPhoneChange={setPaymentPhone}
        onConfirm={handlePaymentConfirm}
        isProcessing={isSubmitting}
      />
    </div>
  );
}
