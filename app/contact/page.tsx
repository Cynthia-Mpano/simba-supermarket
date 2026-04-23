'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Footer } from '@/components/footer';

const branches = [
  { name: 'Simba UTC (HQ)', address: '3336+MHV, 1 KN 4 Ave, Kigali', phone: '+250 788 307 200' },
  { name: 'Simba Centenary', address: 'KN 4 Ave, UTC Building, Kigali', phone: null },
  { name: 'Simba Gishushu', address: 'KG 541 St, Kigali', phone: null },
  { name: 'Simba Kimironko', address: '342F+3V5, Kimironko, Kigali', phone: null },
  { name: 'Simba Kicukiro', address: 'KK 35 Ave, Kigali', phone: null },
  { name: 'Simba Kigali Heights', address: '24XF+XVV, KG 192 St, Kigali', phone: null },
  { name: 'Simba Gacuriro', address: '24G3+MCV, Kigali', phone: null },
  { name: 'Simba Gikondo', address: '23H4+26V, Kigali', phone: null },
  { name: 'Simba Sonatube', address: '24Q5+R2R, Kigali', phone: null },
  { name: 'Simba Kisimenti', address: 'KN 5 Rd, Kigali', phone: null },
  { name: 'Simba Rebero', address: '24J3+Q3, Kigali', phone: null },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Contact Us</h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              We're here to help. Reach out to us through any of the channels below or visit one of our 11 branches across Kigali.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Head Office</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                KN 4 Ave, UTC Building<br />
                Kiyovu, Kigali<br />
                Nyarugenge District<br />
                P.O. Box 190
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <a href="tel:+250788307200" className="text-lg font-semibold text-primary hover:underline block">
                +250 788 307 200
              </a>
              <p className="text-sm text-muted-foreground mt-2">Available 7 days a week</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <a href="mailto:info@simbasupermarket.rw" className="text-primary hover:underline text-sm break-all">
                info@simbasupermarket.rw
              </a>
              <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Opening Hours</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="text-foreground font-medium">Mon – Fri:</span> 8:00 AM – 9:00 PM</p>
                <p><span className="text-foreground font-medium">Sat – Sun:</span> 8:00 AM – 9:00 PM</p>
                <p className="text-primary font-semibold mt-2">Open Every Day</p>
              </div>
            </div>
          </div>

          {/* Contact Form + Branch List */}
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              {submitted ? (
                <div className="bg-card rounded-2xl p-8 border border-border text-center">
                  <div className="h-14 w-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    Send Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Jean Baptiste" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us more..." rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? 'Sending...' : <><Send className="h-4 w-4" /> Send Message</>}
                  </Button>
                </form>
              )}
            </div>

            {/* All Branches */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Our 11 Branches</h2>
              <div className="space-y-2">
                {branches.map((b) => (
                  <div key={b.name} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-colors">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.address}</p>
                      {b.phone && (
                        <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="text-xs text-primary hover:underline">{b.phone}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
