'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
  productCount: number;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  maxPrice,
  onPriceRangeChange,
  productCount,
}: CategoryFilterProps) {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1], replacements?: Record<string, string | number>) =>
    getTranslation(locale, key, replacements);

  const sortOptions = [
    { value: 'default', label: t('newest') },
    { value: 'price-asc', label: t('priceLowHigh') },
    { value: 'price-desc', label: t('priceHighLow') },
    { value: 'name-asc', label: t('nameAZ') },
    { value: 'name-desc', label: t('nameZA') },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < maxPrice || sortBy !== 'default';

  const clearFilters = () => {
    onCategoryChange(null);
    onPriceRangeChange([0, maxPrice]);
    onSortChange('default');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">{t('categories')}</h4>
        <div className="flex flex-col gap-1">
          <Button
            variant={selectedCategory === null ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="justify-start font-normal"
          >
            {t('allCategories')}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="justify-start font-normal"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">{t('priceRange')}</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={maxPrice}
            step={1000}
            className="mb-4 mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">{t('sortBy')}</h4>
        <div className="flex flex-col gap-1">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSortChange(option.value)}
              className="justify-start font-normal"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile Top Bar */}
      <div className="flex lg:hidden items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">
          {t('showingProducts', { count: productCount })}
        </p>
        
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1">
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">{t('clearFilters')}</span>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <SlidersHorizontal className="h-4 w-4" />
                {t('filter')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle>{t('filter')}</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <p className="text-sm text-muted-foreground font-medium">
            {t('showingProducts', { count: productCount })}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1 px-2 -mr-2">
              <X className="h-3 w-3" />
              {t('clearFilters')}
            </Button>
          )}
        </div>
        <FilterContent />
      </div>
    </div>
  );
}
