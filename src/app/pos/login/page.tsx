"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Loader2, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PosLoginPage() {
  const { login } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push('/pos');
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex flex-col items-center justify-center px-4">

      {/* Icon + title */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-20 h-20 rounded-2xl border-2 border-blue-200 bg-white flex items-center justify-center overflow-hidden shadow-xl">
          <img
            src="/blmc-logo.png"
            alt="BLMC Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextElementSibling as HTMLElement;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] items-center justify-center hidden">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">BLMC Point of Sale</h1>
        <p className="text-sm text-gray-400">Sign in to your POS account</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl bg-[#eef2f7] border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 h-11 rounded-xl bg-[#eef2f7] border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </div>

      {/* Footer links */}
      <div className="mt-6 flex items-center gap-3 text-sm text-gray-400">
        <Link href="/login" className="hover:text-gray-600 transition-colors">Admin Login</Link>
        <span>·</span>
        <Link href="/login" className="hover:text-gray-600 transition-colors">Member Login</Link>
        <span>·</span>
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
      </div>

    </div>
  );
}
