'use client';

import { Building2, Award, Users, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';

export function AboutSection() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const achievements = [
    { year: '2020', title: t('achievement1') },
    { year: '2015', title: t('achievement2') },
    { year: '2014', title: t('achievement3') },
    { year: '2013', title: t('achievement4') },
  ];

  const branches = [
    'Simba Rebero', 'Simba Kisimenti', 'Simba Sonatube', 'Simba Gikondo',
    'Simba Gacuriro', 'Simba UTC', 'Simba Kigali Heights', 'Simba Kicukiro',
    'Simba Kimironko', 'Simba Gishushu', 'Simba Centenary'
  ];

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('aboutUsTitle')}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('aboutUsSubtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Company Story */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('ourStory')}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('ourStoryText')}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('ourValues')}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">{t('valueRespect')}</h4>
                  <p className="text-sm text-muted-foreground">{t('valueRespectText')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{t('valueService')}</h4>
                  <p className="text-sm text-muted-foreground">{t('valueServiceText')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{t('valueExcellence')}</h4>
                  <p className="text-sm text-muted-foreground">{t('valueExcellenceText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Branches */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('achievements')}</h3>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-8 w-16 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-medium text-primary">
                      {achievement.year}
                    </span>
                    <span className="text-sm text-muted-foreground">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('ourBranches')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('branchesSubtitle')}</p>
              <div className="flex flex-wrap gap-2">
                {branches.map((branch, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground"
                  >
                    {branch}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">11+</p>
                <p className="text-xs text-muted-foreground">{t('statsBranches')}</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">450+</p>
                <p className="text-xs text-muted-foreground">{t('statsEmployees')}</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">2007</p>
                <p className="text-xs text-muted-foreground">{t('statsFounded')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
