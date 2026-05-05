"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, Users, BookOpen, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast({ title: 'Welcome back!', description: 'Successfully logged in to BLMC Connect.' });
        router.push('/dashboard');
      } else {
        toast({ variant: 'destructive', title: 'Login failed', description: 'Invalid email or password. Please check your credentials.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: 'View your savings & ledger' },
    { icon: Megaphone, text: 'Stay updated with announcements' },
    { icon: Users, text: 'Access cooperative services' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #c0392b 0%, #e05c97 50%, #5b4fa8 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
            <img src="/blmc-logo.png" alt="BLMC" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display='none'; }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">BLMC Connect</p>
            <p className="text-white/60 text-xs">Member Portal</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Member<br />
              <span className="text-white/80">Portal</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Access your cooperative account, check your savings, view announcements, and manage your membership.
            </p>
          </div>
          <div className="space-y-3">
            {features.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">CDA Reg. No. 9520-04000617 · Poblacion, Bansud, Oriental Mindoro</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl border-2 border-[#c0392b]/20 overflow-hidden bg-white flex items-center justify-center">
              <img src="/blmc-logo.png" alt="BLMC" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display='none'; }} />
            </div>
            <div>
              <p className="font-bold text-gray-900">BLMC Connect</p>
              <p className="text-xs text-[#c0392b]">Member Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Member Login</h2>
            <p className="text-sm font-semibold mt-1" style={{ color: '#c0392b' }}>Access your cooperative account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 sm:p-8 space-y-5">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0392b]" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" required
                    className="pl-10 h-12 rounded-xl bg-[#f8f9fc] border-gray-200 focus-visible:ring-[#c0392b]/30 focus-visible:border-[#c0392b] text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0392b]" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    className="pl-10 pr-11 h-12 rounded-xl border-2 border-[#c0392b]/30 focus-visible:ring-[#c0392b]/30 focus-visible:border-[#c0392b] bg-white text-sm" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #c0392b 0%, #e05c97 50%, #5b4fa8 100%)' }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Login</>}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/" className="px-5 py-2 rounded-full border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Homepage
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/login" className="px-5 py-2 rounded-full border-2 border-[#5b4fa8]/30 text-[#5b4fa8] font-semibold text-sm hover:bg-[#5b4fa8]/5 transition-colors">
              Admin Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/register" className="px-5 py-2 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
              style={{ background: 'linear-gradient(135deg, #c0392b, #5b4fa8)' }}>
              Apply
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">© 2025 BLMC Management System · v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
