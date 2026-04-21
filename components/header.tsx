'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/lib/store-context';
import { getTranslation, type Locale } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const { cartCount, locale, setLocale, isDark, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground leading-tight">Simba</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Supermarket</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 mx-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">{t('home')}</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">{t('aboutUs')}</Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-primary transition-colors">{t('contactUs')}</Link>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase">{locale}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={cn(locale === lang.code && 'bg-primary/10')}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2 border-l border-border pl-2 ml-1">
              <Link href="/api/auth/signin">
                <Button variant="ghost" size="sm">{t('signIn')}</Button>
              </Link>
              <Link href="/api/auth/signup">
                <Button size="sm">{t('signUp')}</Button>
              </Link>
            </div>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('language')}</span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={locale === lang.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setLocale(lang.code);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {lang.flag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{isDark ? t('darkMode') : t('lightMode')}</span>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Navigation Links - Mobile */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">{t('home')}</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">{t('aboutUs')}</Link>
              <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">{t('contactUs')}</Link>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/api/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">{t('signIn')}</Button>
              </Link>
              <Link href="/api/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{t('signUp')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
