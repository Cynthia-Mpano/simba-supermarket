'use client';

import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const clearFilters = () => {
    onCategoryChange(null);
    onPriceRangeChange([0, maxPrice]);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills - Horizontal Scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="shrink-0"
        >
          {t('allCategories')}
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {t('showingProducts', { count: productCount })}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1">
              <X className="h-3 w-3" />
              {t('clearFilters')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t('filter')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>{t('filter')}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-medium mb-3">{t('categories')}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onCategoryChange(null)}
                    >
                      {t('allCategories')}
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onCategoryChange(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">{t('priceRange')}</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                    max={maxPrice}
                    step={1000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])} RWF</span>
                    <span>{formatPrice(priceRange[1])} RWF</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Price Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                {t('priceRange')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                max={maxPrice}
                step={1000}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(priceRange[0])} RWF</span>
                <span>{formatPrice(priceRange[1])} RWF</span>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {t('sortBy')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={cn(sortBy === option.value && 'bg-primary/10')}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
