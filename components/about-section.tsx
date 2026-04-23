'use client';

import { Building2, Award, Users, MapPin, Coffee, ShoppingBag, Gamepad2, Truck } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';

const achievements = [
  { year: '2020', title: '1st Merchant of the Year in Rwanda' },
  { year: '2015', title: 'RRA Compliant Taxpayer Award' },
  { year: '2014', title: 'Best Exhibitor Retail & Distribution — EBM Best' },
  { year: '2013', title: '1st Best Exhibitor Retail & Distribution' },
];

const branches = [
  { name: 'Simba Centenary', address: 'KN 4 Ave, UTC Building' },
  { name: 'Simba Gishushu', address: 'KG 541 St, Kigali' },
  { name: 'Simba Kimironko', address: '342F+3V5, Kimironko' },
  { name: 'Simba Kicukiro', address: 'KK 35 Ave, Kigali' },
  { name: 'Simba Kigali Heights', address: '24XF+XVV, KG 192 St' },
  { name: 'Simba UTC', address: '3336+MHV, 1 KN 4 Ave' },
  { name: 'Simba Gacuriro', address: '24G3+MCV, Kigali' },
  { name: 'Simba Gikondo', address: '23H4+26V, Kigali' },
  { name: 'Simba Sonatube', address: '24Q5+R2R, Kigali' },
  { name: 'Simba Kisimenti', address: 'KN 5 Rd, Kigali' },
  { name: 'Simba Rebero', address: '24J3+Q3, Kigali' },
];

const services = [
  { icon: ShoppingBag, title: 'Supermarket', desc: '11 branches across Kigali stocked with food, furniture, clothing, cosmetics, toys and more.' },
  { icon: Coffee, title: 'Restaurant & Coffee Shop', desc: 'Trucillo Café running at Centenary, Gishushu, UTC, Gacuriro and Kisimenti branches.' },
  { icon: Gamepad2, title: 'Simba Arcade', desc: 'Arcade games entertainment at our Gacuriro branch.' },
  { icon: Truck, title: 'Online Delivery', desc: 'We deliver to your door — Simba Supermarket is everywhere.' },
];

const categories = [
  'Fruits & Vegetables', 'Meats', 'Frozen Foods', 'Wines & Spirits',
  'Furniture', 'Electronics', 'Utensils & Ornaments', 'Homecare',
  'Baby Products', 'Gym & Sports', 'Health & Beauty', 'Bakery',
];

export function AboutSection() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">About Simba Supermarket</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Rwanda's most admired supermarket — serving Kigali since 2007 with quality products at affordable prices.
          </p>
        </div>

        {/* Company Profile + Origin */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Company Profile</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">SIMBA SUPERMARKET LTD</strong> is genuinely a testament of Rwanda's economic resurgence whose main goal is to meet people's daily needs in Kigali, Rwanda. It was founded by <strong className="text-foreground">Mr. Teklay Teame</strong> and his partners, who now serves as Chairman and CEO.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We offer a wide variety of products including food, furniture, clothing, stationery, cosmetics, and toys — importing from Europe, Egypt, Dubai, China, Turkey and beyond to ensure a diverse product range.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Origin History</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Established on <strong className="text-foreground">December 3, 2007</strong> as a Limited Liability Company, Simba officially launched on <strong className="text-foreground">August 8, 2008</strong>, creating over <strong className="text-foreground">450 jobs</strong> for Rwandese citizens.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Known for quality products at affordable prices, we serve international organizations, local NGOs, private companies, and government ministries — earning a reputation as one of Rwanda's most admired supermarkets.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: '11+', label: 'Branches' },
            { value: '450+', label: 'Employees' },
            { value: '2007', label: 'Founded' },
            { value: '1M+', label: 'Customers Served' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-5 border border-border text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Beliefs & Values */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Beliefs & Values</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Respect for the Individual',
                desc: "We're hardworking, ordinary people who've teamed up to accomplish extraordinary things. We treat each other with dignity — this is the most basic way we show respect.",
              },
              {
                icon: ShoppingBag,
                title: 'Service to Customers',
                desc: 'Our customers are the reason we\'re in business. We offer quality merchandise at the lowest prices with the best customer service possible, always exceeding expectations.',
              },
              {
                icon: Award,
                title: 'Striving for Excellence',
                desc: "We're proud of our accomplishments but never satisfied. We constantly reach further to bring new ideas and goals to life, always asking: Is this the best I can do?",
              },
            ].map((v) => (
              <div key={v.title} className="bg-card rounded-2xl p-6 border border-border">
                <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{v.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Our Services</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <div key={s.title} className="bg-card rounded-2xl p-5 border border-border">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Categories */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Product Categories</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <span key={cat} className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((a) => (
                <div key={a.year} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border">
                  <span className="shrink-0 h-10 w-16 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                    {a.year}
                  </span>
                  <span className="text-sm text-muted-foreground">{a.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Our 11 Branches</h3>
            </div>
            <div className="space-y-2">
              {branches.map((b) => (
                <div key={b.name} className="flex items-start gap-3 bg-card rounded-xl p-3 border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
