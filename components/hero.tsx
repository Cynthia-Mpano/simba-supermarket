'use client';

import Image from 'next/image';
import { ArrowRight, Truck, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';

interface HeroProps {
  onShopNow: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/supermarket-aisle.jpg"
          alt="Simba Supermarket Aisle"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 dark:from-background/98 dark:via-background/90 dark:to-background/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t('heroTagline')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-pretty">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={onShopNow} className="gap-2 text-base">
              {t('shopNow')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onShopNow} className="gap-2 text-base">
              {t('browseCategories')}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('freeDeliveryBadge')}</p>
                <p className="text-xs text-muted-foreground">{t('freeDeliveryDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('fastDeliveryBadge')}</p>
                <p className="text-xs text-muted-foreground">{t('fastDeliveryDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('qualityBadge')}</p>
                <p className="text-xs text-muted-foreground">{t('qualityDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
