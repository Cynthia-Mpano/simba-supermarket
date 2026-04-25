'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useStore } from '@/lib/store-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (authError) { setError(authError.message); setIsLoading(false); return; }
      signIn({ name: form.name, email: data.user?.email ?? form.email });
    } else {
      await new Promise(r => setTimeout(r, 600));
      signIn({ name: form.name, email: form.email });
    }

    router.push('/');
  };

  const ps = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const psColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const psLabel = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4">
        <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Shop</Button></Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-foreground font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground text-sm mt-1">Join Simba Supermarket today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jean Baptiste" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-1">{[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= ps ? psColor[ps] : 'bg-secondary'}`} />)}</div>
                  <span className="text-xs text-muted-foreground">{psLabel[ps]}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm" type="password" placeholder="••••••••" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="pr-10" />
                {form.confirm && form.password === form.confirm && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
              </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create Account'}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}<Link href="/sign-in" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
