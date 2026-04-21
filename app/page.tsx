'use client';

import { useState, useMemo, useRef } from 'react';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { CategoryFilter } from '@/components/category-filter';
import { Footer } from '@/components/footer';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import productData from '@/data/products.json';
import type { Product } from '@/lib/types';

const products = productData.products as Product[];

export default function HomePage() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const productsRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price)), []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep original order (by id)
        result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="flex-1">
        <Hero onShopNow={scrollToProducts} />

        {/* Products Section */}
        <section ref={productsRef} id="products" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t('allProducts')}</h2>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onPriceRangeChange={setPriceRange}
            productCount={filteredProducts.length}
          />

          {filteredProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center py-12">
              <p className="text-lg text-muted-foreground">{t('noProducts')}</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
