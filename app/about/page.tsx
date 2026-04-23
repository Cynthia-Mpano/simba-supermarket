'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AboutSection } from '@/components/about-section';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-base text-foreground leading-tight">Simba</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Supermarket</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
