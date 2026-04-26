'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useStore } from '@/lib/store-context';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }
      const name = data.user?.user_metadata?.full_name
        || form.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      signIn({ name, email: data.user?.email ?? form.email });
    } else {
      // Demo mode — no Supabase configured yet
      await new Promise(r => setTimeout(r, 600));
      if (!form.email || form.password.length < 6) {
        setError('Invalid email or password (min 6 characters).');
        setIsLoading(false);
        return;
      }
      const name = form.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      signIn({ name, email: form.email });
    }

    router.push('/');
  };

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
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your Simba account</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-4 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
              Demo mode — Supabase not configured. Any email + 6-char password works.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}<Link href="/sign-up" className="text-primary font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
