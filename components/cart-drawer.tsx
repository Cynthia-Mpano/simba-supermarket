'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { useState } from 'react';

export function CartView() {
  const { cart, removeFromCart, updateQuantity, cartTotal, locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1], replacements?: Record<string, string | number>) =>
    getTranslation(locale, key, replacements);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = cartTotal >= 50000 ? 0 : 2000;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('emptyCart')}</h2>
        <p className="text-muted-foreground text-center mb-6">
          {locale === 'en' && 'Start shopping to add items to your cart'}
          {locale === 'fr' && 'Commencez vos achats pour ajouter des articles'}
          {locale === 'rw' && "Tangira kugura kugira ngo wongere ibintu mu gasanduku"}
        </p>
        <Link href="/">
          <Button>{t('continueShopping')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            formatPrice={formatPrice}
            t={t}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span className="font-medium">{formatPrice(cartTotal)} RWF</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('deliveryFee')}</span>
          <span className="font-medium">
            {deliveryFee === 0 ? t('free') : `${formatPrice(deliveryFee)} RWF`}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
          <span>{t('total')}</span>
          <span className="text-primary">{formatPrice(cartTotal + deliveryFee)} RWF</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/checkout" className="block">
          <Button className="w-full" size="lg">
            {t('checkout')}
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="outline" className="w-full">
            {t('continueShopping')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    unit: string;
  };
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  formatPrice: (price: number) => string;
  t: (key: Parameters<typeof getTranslation>[1]) => string;
}

function CartItem({ item, onUpdateQuantity, onRemove, formatPrice, t }: CartItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-4 p-4 bg-secondary/30 rounded-xl">
      <div className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden shrink-0">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground line-clamp-2 text-sm">{item.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{item.unit}</p>
        <p className="font-bold text-primary mt-1">{formatPrice(item.price)} RWF</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
