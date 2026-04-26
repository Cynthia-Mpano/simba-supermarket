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
import { ProductTrie } from '@/lib/trie';

const products = productData.products as Product[];

const trie = new ProductTrie();
products.forEach(p => {
  trie.insert(p.name, p);
  trie.insert(p.category, p);
});

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
      const trieResults = trie.searchPrefix(searchQuery);
      // Deduplicate by ID
      const seen = new Set();
      result = trieResults.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
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
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
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
            </aside>

            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">{t('noProducts')}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
