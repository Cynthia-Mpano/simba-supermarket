'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Product } from './types';
import type { Locale } from './translations';

export interface AuthUser {
  name: string;
  email: string;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isDark: boolean;
  toggleTheme: () => void;
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('simba-cart');
    const savedLocale = localStorage.getItem('simba-locale') as Locale;
    const savedTheme = localStorage.getItem('simba-theme');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        // Invalid JSON, reset cart
      }
    }
    
    if (savedLocale && ['en', 'fr', 'rw'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const savedUser = localStorage.getItem('simba-user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('simba-cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('simba-locale', newLocale);
  }, []);

  const signIn = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('simba-user', JSON.stringify(newUser));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('simba-user');
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('simba-theme', newValue ? 'dark' : 'light');
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        locale,
        setLocale,
        isDark,
        toggleTheme,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
