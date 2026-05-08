"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import {
  LayoutDashboard, ShoppingCart, History,
  Wallet, PercentCircle, LogOut, Loader2,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',        href: '/pos',                 icon: LayoutDashboard },
  { label: 'New Sale',         href: '/pos/new-sale',        icon: ShoppingCart },
  { label: 'Sales History',    href: '/pos/sales-history',   icon: History },
  { label: 'Share Balance',    href: '/pos/share-balance',   icon: Wallet },
  { label: 'Patronage Refund', href: '/pos/patronage-refund',icon: PercentCircle },
];

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { currentUser, isLoading, logout } = useAppContext();
  const [now, setNow] = useState(new Date());

  // ALL hooks must be called unconditionally before any early return
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (pathname === '/pos/login') return;
    if (!isLoading && !currentUser) router.push('/pos/login');
  }, [currentUser, isLoading, router, pathname]);

  // POS login page — render without sidebar
  if (pathname === '/pos/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const dateStr = now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="w-[200px] shrink-0 bg-[#1a1a2e] flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">B</div>
            <div>
              <p className="text-white font-bold text-xs leading-none">BLMC POS</p>
              <p className="text-white/50 text-[10px]">Point of Sale</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={async () => { await logout(); router.push('/login'); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 bg-white border-b flex items-center justify-end px-6 shrink-0">
          <span className="text-xs text-muted-foreground">{dateStr}, {timeStr}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
