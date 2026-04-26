'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart, locale } = useStore();
  const [imageError, setImageError] = useState(false);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  
  const inCart = cart.some(item => item.id === product.id);
  const cartQuantity = cart.find(item => item.id === product.id)?.quantity || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square bg-secondary/30 overflow-hidden">
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-destructive">{t('outOfStock')}</span>
            </div>
          )}
          {inCart && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full z-10">
              {cartQuantity}x
            </div>
          )}
        </div>
      </Link>

      {/* Quick Add Button - Appears on Hover */}
      <Button
        variant={inCart ? 'secondary' : 'default'}
        size="sm"
        disabled={!product.inStock}
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
        className={cn(
          "absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl",
          inCart && 'bg-secondary/90 hover:bg-secondary'
        )}
      >
        {inCart ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
        {t('addToCart')}
      </Button>

      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{product.unit}</p>
        </Link>
        <div className="mt-3">
          <p className="font-bold text-lg text-foreground">
            {formatPrice(product.price)}
            <span className="text-xs font-normal text-muted-foreground ml-1">RWF</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
