'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartView } from '@/components/cart-drawer';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { Footer } from '@/components/footer';

export default function CartPage() {
  const { locale, cartCount } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1], replacements?: Record<string, string | number>) =>
    getTranslation(locale, key, replacements);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg text-foreground">{t('yourCart')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('itemsInCart', { count: cartCount })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <CartView />
      </main>

      <Footer />
    </div>
  );
}
