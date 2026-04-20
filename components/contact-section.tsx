'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';

export function ContactSection() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('contactUsTitle')}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('contactUsSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Address */}
          <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('officeAddress')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KN 34 Street<br />
              Kiyovu, Kigali<br />
              Nyarugenge District<br />
              U.T.C Building, 5th Floor
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              P.O. Box 190
            </p>
          </div>

          {/* Phone */}
          <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('phoneNumber')}</h3>
            <a 
              href="tel:+250788307200" 
              className="text-lg font-medium text-primary hover:underline"
            >
              +250 788 307 200
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              {t('phoneAvailability')}
            </p>
          </div>

          {/* Email */}
          <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('email')}</h3>
            <a 
              href="mailto:info@Simbasupermarket.rw" 
              className="text-primary hover:underline break-all"
            >
              info@Simbasupermarket.rw
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              {t('emailResponse')}
            </p>
          </div>

          {/* Business Hours */}
          <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('businessHours')}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="text-foreground">{t('weekdays')}:</span> 8:00 AM - 9:00 PM</p>
              <p><span className="text-foreground">{t('weekends')}:</span> 8:00 AM - 9:00 PM</p>
              <p className="text-primary font-medium mt-2">{t('openEveryDay')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
