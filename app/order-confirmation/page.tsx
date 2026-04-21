'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('orderConfirmed')}</h1>
        <p className="text-muted-foreground mb-6">{t('thankYou')}</p>

        {/* Order ID */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">{t('orderNumber')}</p>
          <p className="text-xl font-mono font-bold text-primary">{orderId}</p>
        </div>

        {/* Status Steps */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === 'en' && 'Confirmed'}
              {locale === 'fr' && 'Confirmé'}
              {locale === 'rw' && 'Byemejwe'}
            </p>
          </div>
          <div className="w-12 h-0.5 bg-border self-center mt-[-1rem]" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-2">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === 'en' && 'Packing'}
              {locale === 'fr' && 'Emballage'}
              {locale === 'rw' && 'Gupakira'}
            </p>
          </div>
          <div className="w-12 h-0.5 bg-border self-center mt-[-1rem]" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === 'en' && 'Delivery'}
              {locale === 'fr' && 'Livraison'}
              {locale === 'rw' && 'Kuzana'}
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-muted-foreground mb-8">{t('orderDetails')}</p>

        {/* Actions */}
        <Link href="/">
          <Button size="lg" className="gap-2">
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
