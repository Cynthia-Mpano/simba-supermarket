'use client';

import { Building2, Award, Users, MapPin, Target, Shield, ShoppingBag, Coffee, Cake, Store } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Company Profile
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">ABOUT SIMBA SUPERMARKET</h1>
          <p className="text-lg text-muted-foreground">
            SIMBA SUPERMARKET LTD offers a variety of products, including food, furniture, clothing, stationary, cosmetics, and toys. We are genuinely a testament of Rwanda's economic resurgence.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Story & History */}
          <div className="space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Origin History</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                SIMBA SUPERMARKET LTD, established on December 3, 2007, as a Limited Liability Company, aims to become the region's largest retail outlet. Importing products from Europe, Egypt, Dubai, China, Turkey, and other countries, the company ensures a diverse product range. The official launch took place on August 8, 2008, creating over 450 jobs for Rwandese.
              </p>
              <br />
              <p className="text-muted-foreground leading-relaxed">
                With branches across Rwanda, including the latest one in Kigali, the company provides services such as a butchery, bakery, and coffee shop, aiming for a one-stop shopping experience. Known for quality products at affordable prices, we serve international organizations, local NGOs, private companies, and government ministries.
              </p>
            </div>

            {/* Beliefs and Values */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Beliefs and Values</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Respect for the Individual</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">We're hardworking, ordinary people who've teamed up to accomplish extraordinary things. We treat each other with dignity. This is the most basic way we show respect.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Service to Customers</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">Our customers are the reason we're in business. We offer quality merchandise at the lowest prices, and we do it with the best customer service possible.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Award className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Striving for Excellence</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">We're proud of our accomplishments but never satisfied. We constantly reach further to bring new ideas and goals to life. We always ask: Is this the best I can do?</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Categories, Services & Achievements */}
          <div className="space-y-8">
            
            {/* Services */}
            <div className="bg-secondary/50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">Our Services</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-background rounded-2xl border border-border text-center">
                  <Store className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold">Supermarket Service</h4>
                  <p className="text-xs text-muted-foreground mt-1">11 Branches in Operation</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-2xl border border-border text-center">
                  <Coffee className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold">Restaurant & Cafe</h4>
                  <p className="text-xs text-muted-foreground mt-1">5 Simba Branches</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-2xl border border-border text-center">
                  <ShoppingBag className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold">Online Sales</h4>
                  <p className="text-xs text-muted-foreground mt-1">Delivery to your door</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-2xl border border-border text-center">
                  <Cake className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold">Bakery Factory</h4>
                  <p className="text-xs text-muted-foreground mt-1">Fresh daily production</p>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-card rounded-3xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Product Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Fruits & Vegetables', 'Meats', 'Frozen', 'Wines & Spirits', 'Furniture', 'Electronic', 'Utensils & Ornaments', 'Homecare', 'Baby Products', 'Gym & Sports', 'Health & Beauty', 'Bakery'].map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Branches */}
            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Our Branches</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Simba Centenary, Simba Gishushu, Simba Kimironko, Simba Kicukiro, Simba Kigali Heights, Simba UTC, Simba Gacuriro, Simba Gikondo, Simba Sonatube, Simba Kisimenti, Simba Rebero.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
