'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { AboutSection } from '@/components/about-section';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <main className="flex-1">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
