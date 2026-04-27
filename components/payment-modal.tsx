'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

type PaymentMethod = 'momo' | 'airtel' | 'cash';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: PaymentMethod;
  amount: number;
  phone: string;
  onPhoneChange: (phone: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentMethod,
  amount,
  phone,
  onPhoneChange,
  onConfirm,
  isProcessing,
}: PaymentModalProps) {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const [step, setStep] = useState<'phone' | 'processing' | 'success' | 'failed'>('phone');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);

  const isAirtel = paymentMethod === 'airtel';
  const isMoMo = paymentMethod === 'momo';

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 9) {
      setStep('processing');
      onConfirm();
    }
  };

  const resetAndClose = () => {
    setStep('phone');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md">
        {step === 'phone' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isAirtel ? 'bg-red-500' : 'bg-yellow-400'
                )}>
                  <Smartphone className={cn('h-5 w-5', isAirtel ? 'text-white' : 'text-black')} />
                </div>
                <div>
                  <DialogTitle>{isAirtel ? t('airtelMoney') : t('mobileMoney')}</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'rw' ? 'Injiza nimero ya telefoni' : isAirtel ? 'Enter your Airtel phone number' : 'Enter your MTN phone number'}
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(amount)} RWF</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="payment-phone">
                  {locale === 'rw' ? 'Nimero ya telefoni' : 'Phone Number'}
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    +250
                  </span>
                  <Input
                    id="payment-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="78X XXX XXX"
                    className="rounded-l-none flex-1"
                    required
                    maxLength={9}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {isAirtel 
                  ? (locale === 'rw' ? 'Uzakira ubutumwa bwo kwemeza kuri Airtel Money yawe.' : 'You will receive a payment request on your Airtel Money.')
                  : (locale === 'rw' ? 'Uzakira ubutumwa bwo kwemeza kuri MTN MoMo yawe.' : 'You will receive a payment request on your MTN MoMo.')
                }
              </p>

              <Button type="submit" className="w-full" disabled={phone.length < 9}>
                {locale === 'rw' ? 'Komeza' : 'Continue'}
              </Button>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">{t('processing')}</h3>
            <p className="text-sm text-muted-foreground">
              {isAirtel 
                ? (locale === 'rw' ? 'Birimo gukorwa kuri Airtel Money...' : 'Processing payment via Airtel Money...')
                : (locale === 'rw' ? 'Birimo gukorwa kuri MTN MoMo...' : 'Processing payment via MTN MoMo...')
              }
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {locale === 'rw' ? 'Rabatangiwe gukira kuri telefoni yawe.' : 'Please check your phone for the payment prompt.'}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'rw' ? 'Ibyishyure byagenze neza!' : 'Payment Successful!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {locale === 'rw' ? 'Itumiza yawe yiyemeje.' : 'Your order has been confirmed.'}
            </p>
          </div>
        )}

        {step === 'failed' && (
          <div className="py-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'rw' ? 'Ibyishyure byagize ikibazo' : 'Payment Failed'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {locale === 'rw' ? 'Mwongere mugerageze.' : 'Please try again or use a different payment method.'}
            </p>
            <Button variant="outline" onClick={() => setStep('phone')} className="w-full">
              {locale === 'rw' ? 'Ongera ugerageze' : 'Try Again'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AirtelPaymentSimulatorProps {
  onSuccess: () => void;
  onFailed: () => void;
  amount: number;
}

export function airtelPaymentSimulator(
  phoneNumber: string,
  amount: number,
  onSuccess: () => void,
  onFailed: () => void,
  delay: number = 3000
) {
  const isValidPhone = phoneNumber.length >= 9;
  
  setTimeout(() => {
    if (isValidPhone && Math.random() > 0.3) {
      onSuccess();
    } else {
      onFailed();
    }
  }, delay);
}

export function momoPaymentSimulator(
  phoneNumber: string,
  amount: number,
  onSuccess: () => void,
  onFailed: () => void,
  delay: number = 3000
) {
  const isValidPhone = phoneNumber.length >= 9;
  
  setTimeout(() => {
    if (isValidPhone && Math.random() > 0.2) {
      onSuccess();
    } else {
      onFailed();
    }
  }, delay);
}