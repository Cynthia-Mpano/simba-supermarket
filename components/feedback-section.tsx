'use client';

import { useState } from 'react';
import { Send, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';

export function FeedbackSection() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <section id="feedback" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-card rounded-2xl p-8 border border-border">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('feedbackThankYou')}</h3>
            <p className="text-muted-foreground">{t('feedbackReceived')}</p>
            <Button 
              className="mt-6" 
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setRating(0);
              }}
            >
              {t('submitAnother')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="feedback" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('feedbackTitle')}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('feedbackSubtitle')}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border space-y-6">
            {/* Rating */}
            <div className="text-center">
              <Label className="text-base mb-3 block">{t('rateExperience')}</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-name">{t('fullName')}</Label>
                <Input
                  id="feedback-name"
                  name="name"
                  placeholder={t('enterName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-email">{t('email')}</Label>
                <Input
                  id="feedback-email"
                  name="email"
                  type="email"
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-subject">{t('feedbackSubject')}</Label>
              <Input
                id="feedback-subject"
                name="subject"
                placeholder={t('enterSubject')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">{t('feedbackMessage')}</Label>
              <Textarea
                id="feedback-message"
                name="message"
                placeholder={t('enterMessage')}
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                t('submitting')
              ) : (
                <>
                  {t('submitFeedback')}
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
