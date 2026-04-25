'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Home, Phone, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'SIM-XXXXX';
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Success Banner */}
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-5">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('orderConfirmed')}</h1>
          <p className="text-muted-foreground mt-2">{t('thankYou')}</p>
        </div>

        {/* Order ID */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('orderNumber')}</p>
          <p className="text-2xl font-mono font-bold text-primary">{orderId}</p>
          <p className="text-xs text-muted-foreground mt-2">Save this number for your records</p>
        </div>

        {/* What happens next */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-bold text-foreground text-lg">What happens next?</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Order Received ✓</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your order has been placed and is now in our system. Our team at Simba Supermarket has been notified.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">We'll Call You</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A Simba team member will call you on the phone number you provided to confirm your order and delivery details.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Order Packed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once confirmed, your items will be carefully packed at your nearest Simba branch.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Delivered to Your Door</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your order will be delivered to your address in Kigali. Same-day delivery available on orders placed before 3:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">Need help with your order?</h3>
          <div className="space-y-2">
            <a href="tel:+250788307200" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              +250 788 307 200
            </a>
            <a href="mailto:info@simbasupermarket.rw" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              info@simbasupermarket.rw
            </a>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              Open every day, 8:00 AM – 9:00 PM
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/" className="block">
          <Button size="lg" className="w-full gap-2">
            <Home className="h-4 w-4" />
            {t('backToHome')}
          </Button>
        </Link>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
