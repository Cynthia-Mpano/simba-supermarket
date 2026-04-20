'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { Footer } from '@/components/footer';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import productData from '@/data/products.json';
import type { Product } from '@/lib/types';

const products = productData.products as Product[];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const product = products.find(p => p.id === productId);
  
  const { addToCart, cart, locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  
  const inCart = cart.some(item => item.id === productId);
  const cartQuantity = cart.find(item => item.id === productId)?.quantity || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/">
            <Button>{t('continueShopping')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-secondary/30 rounded-2xl overflow-hidden">
                {!imageError ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
              {inCart && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {cartQuantity} in cart
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-primary font-medium mb-2">{product.category}</p>
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg text-muted-foreground">RWF</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                  {product.inStock ? t('inStock') : t('outOfStock')}
                </span>
              </div>

              {/* Specifications */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">{t('specifications')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('unit')}</p>
                      <p className="font-medium">{product.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('category')}</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity & Add to Cart */}
              {product.inStock && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-5 w-5" />
                    {t('addToCart')} - {formatPrice(product.price * quantity)} RWF
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('relatedProducts')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
