'use client';

import { ArrowRight, Truck } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 text-pretty">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={onShopNow} className="gap-2">
                {t('shopNow')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              <span>{t('freeDelivery')}</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 to-accent/20 rounded-3xl transform -rotate-3" />
              <div className="relative bg-card rounded-3xl p-8 shadow-xl border border-border">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: '🥬', label: 'Fresh Vegetables' },
                    { emoji: '🍎', label: 'Fruits' },
                    { emoji: '🥛', label: 'Dairy' },
                    { emoji: '🍞', label: 'Bakery' },
                    { emoji: '🧴', label: 'Personal Care' },
                    { emoji: '🏠', label: 'Household' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-secondary/50 rounded-xl p-4 text-center hover:bg-secondary transition-colors"
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
