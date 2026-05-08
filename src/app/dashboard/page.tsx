"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROLES } from '@/lib/mock-data';
import {
  subscribeUsers, subscribeProducts, subscribeTransactions,
  subscribeApplications, type Transaction, type Product,
} from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import {
  Users, UserCheck, ShoppingCart, TrendingUp, CalendarDays,
  BarChart3, Inbox, AlertTriangle, CheckCircle2,
  ClipboardList, Megaphone, Wallet, BookOpen,
  CreditCard, Package, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Build monthly chart data from real transactions
function buildMonthlyData(transactions: Transaction[]) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((month, i) => {
    const m = String(i + 1).padStart(2, '0');
    const year = new Date().getFullYear();
    const sales = transactions
      .filter(t => t.date.startsWith(`${year}-${m}`))
      .reduce((s, t) => s + t.amount, 0);
    return { month, sales, requests: 0 };
  });
}

// ─── Admin Dashboard ────────────────────────────────────────────────────────

function AdminDashboard() {
  const { currentUser: _currentUser } = useAppContext();
  // REDESIGNED BELOW
  const [now, setNow] = useState(new Date());
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingApps, setPendingApps] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const u1 = subscribeUsers(u => setAllUsers(u));
    const u2 = subscribeProducts(p => setProducts(p));
    const u3 = subscribeTransactions(t => setTransactions(t));
    const u4 = subscribeApplications(a => setPendingApps(a.filter(x => x.status === 'pending').length));
    return () => { u1(); u2(); u3(); u4(); };
  }, []);
  const totalMembers = allUsers.filter(u => u.role === ROLES.MEMBER).length;
  const activeMembers = allUsers.filter(u => u.role === ROLES.MEMBER && (u.status === 'active' || u.status === 'approved')).length;
  const pendingApplicants = pendingApps;
  const supplyRequests = 1; // mock

  const today = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);
  const thisYear = now.getFullYear().toString();

  const dailySales = transactions
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlySales = transactions
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const annualSales = transactions
    .filter(t => t.date.startsWith(thisYear))
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...transactions].slice(0, 10);
  const lowStockProducts = products.filter(p => p.stock < 10);
  const monthlyChartData = buildMonthlyData(transactions);

  // Stat bar items with Google-style hex icon colors
  const statItems = [
    {
      label: 'Total Members',
      value: totalMembers,
      icon: Users,
      iconBg: '#e8f0fe',
      iconColor: '#1a73e8',
      href: '/members',
    },
    {
      label: 'Active Members',
      value: activeMembers,
      icon: UserCheck,
      iconBg: '#e6f4ea',
      iconColor: '#1e8e3e',
      href: '/members',
    },
    {
      label: 'Applicants',
      value: pendingApplicants,
      icon: ClipboardList,
      iconBg: '#fce8e6',
      iconColor: '#d93025',
      href: '/applicants',
    },
    {
      label: 'Supply Requests',
      value: supplyRequests,
      icon: ShoppingCart,
      iconBg: '#fef7e0',
      iconColor: '#f9ab00',
      href: '/inventory',
    },
    {
      label: 'Daily Sales',
      value: `₱${dailySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: CalendarDays,
      iconBg: '#e8f0fe',
      iconColor: '#1a73e8',
    },
    {
      label: 'Monthly Sales',
      value: `₱${monthlySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: BarChart3,
      iconBg: '#e6f4ea',
      iconColor: '#1e8e3e',
    },
    {
      label: 'Annual Sales',
      value: `₱${annualSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: '#fce8e6',
      iconColor: '#d93025',
    },
  ];

  const quickActions = [
    { label: 'Review Applicants', href: '/applicants', iconBg: '#fce8e6', iconColor: '#d93025', icon: ClipboardList },
    { label: 'Manage Loans', href: '/loans', iconBg: '#e8f0fe', iconColor: '#1a73e8', icon: CreditCard },
    { label: 'Programs', href: '/programs', iconBg: '#fef7e0', iconColor: '#f9ab00', icon: Megaphone },
    { label: 'Financial Reports', href: '/financials', iconBg: '#e6f4ea', iconColor: '#1e8e3e', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">

      {/* ── Top stat bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {statItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex-1 min-w-[130px] ${i < statItems.length - 1 ? 'border-r border-gray-100' : ''}`}
              onClick={() => item.href && (window.location.href = item.href)}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: item.iconBg }}>
                <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 leading-none truncate">{item.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Sales */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Monthly Sales</p>
              <p className="text-xs text-gray-400">Revenue per month — {thisYear}</p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyChartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b4fa8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5b4fa8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#bbb' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#bbb' }} tickLine={false} axisLine={false} tickFormatter={v => v === 0 ? '0' : `₱${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '11px' }}
                formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#5b4fa8" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Supply Requests */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Supply Requests</p>
              <p className="text-xs text-gray-400">Requests per month — {thisYear}</p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyChartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#bbb' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#bbb' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '11px' }}
                formatter={(v: number) => [v, 'Requests']}
              />
              <Bar dataKey="requests" fill="#e53935" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Recent Transactions — takes 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-800">Recent Transactions</p>
            <Link href="/financials" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300 gap-2">
                <Inbox className="w-8 h-8" />
                <p className="text-xs">No transactions yet.</p>
              </div>
            ) : recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'deposit' ? 'bg-emerald-50' : tx.type === 'payment' ? 'bg-blue-50' : 'bg-red-50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      tx.type === 'deposit' ? 'bg-emerald-400' : tx.type === 'payment' ? 'bg-blue-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{tx.memberName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={`text-xs font-semibold ${tx.type === 'debt_charge' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {tx.type === 'debt_charge' ? '-' : '+'}₱{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Low Stock + Quick Actions */}
        <div className="space-y-4">
          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-800">Low Stock Alerts</p>
              <Link href="/inventory" className="text-xs text-blue-500 hover:underline">Inventory</Link>
            </div>
            <div className="p-3">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium">All items in stock</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {lowStockProducts.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs bg-red-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="text-gray-700 truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <span className="text-red-500 font-semibold shrink-0">{p.stock} left</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-800">Quick Actions</p>
            </div>
            <div className="p-2 space-y-0.5">
              {quickActions.map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: action.iconBg }}>
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.iconColor }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Dashboard ────────────────────────────────────────────────────────

function MemberDashboard() {
  const { currentUser } = useAppContext();
  const [memberTransactions, setMemberTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const { subscribeMemberTransactions } = require('@/lib/firestore-service');
    const unsub = subscribeMemberTransactions(currentUser.id, (txs: Transaction[]) => setMemberTransactions(txs));
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return null;

  const quickActions = [
    { label: 'View Ledger', desc: 'Check your transaction history', href: '/ledger', icon: BookOpen },
    { label: 'View Payments', desc: 'See your payment records', href: '/payments', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>
          Hello, {currentUser.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Welcome back to your BLMC dashboard.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Savings Balance</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                ₱{(currentUser.savings ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </CardContent>
          <div className="h-1 bg-emerald-500 opacity-60" />
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Debt</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600">
                ₱{(currentUser.debt ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </CardContent>
          <div className="h-1 bg-amber-500 opacity-60" />
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transactions</p>
              <p className="text-xl sm:text-2xl font-extrabold text-primary">{memberTransactions.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </CardContent>
          <div className="h-1 opacity-60" style={{ background: '#5b4fa8' }} />
        </Card>
      </div>

      {/* Transactions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <BookOpen className="w-4 h-4 text-primary" /> Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/ledger" className="flex items-center gap-1 text-xs">
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {memberTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <Inbox className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No transactions yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {memberTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'deposit' ? 'bg-emerald-50' :
                            tx.type === 'payment' ? 'bg-blue-50' : 'bg-red-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            tx.type === 'deposit' ? 'bg-emerald-500' :
                            tx.type === 'payment' ? 'bg-blue-500' : 'bg-red-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.type === 'debt_charge' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {tx.type === 'debt_charge' ? '-' : '+'}₱{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Quick Actions</h3>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Staff Dashboard ──────────────────────────────────────────────────────────

function StaffDashboard() {
  const { currentUser } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const u1 = subscribeProducts(p => setProducts(p));
    const u2 = subscribeTransactions(t => setTransactions(t));
    return () => { u1(); u2(); };
  }, []);

  if (!currentUser) return null;

  const lowStockProducts = products.filter(p => p.stock < 10);

  const quickActions = [
    { label: 'Manage Inventory', desc: 'Update stock and products', href: '/inventory', icon: Package },
    { label: 'Post Announcement', desc: 'Notify all members', href: '/announcements', icon: Megaphone },
    { label: 'View Financials', desc: 'Check financial overview', href: '/financials', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hello, {currentUser.name}!</h1>
        <p className="text-muted-foreground mt-1">Staff overview — BLMC Connect.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock Items</p>
              <p className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {lowStockProducts.length}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${lowStockProducts.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <Package className={`w-6 h-6 ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-emerald-600'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-bold text-primary">{products.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Transactions</p>
            <p className="text-2xl font-bold text-amber-600">{transactions.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/inventory">View all <ChevronRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>All items are in stock.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm bg-red-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <Badge variant="destructive" className="text-[10px]">{p.stock} left</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 group"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser } = useAppContext();
  if (!currentUser) return null;

  return (
    <AppLayout>
      {currentUser.role === ROLES.ADMIN && <AdminDashboard />}
      {currentUser.role === ROLES.STAFF && <StaffDashboard />}
      {currentUser.role === ROLES.MEMBER && <MemberDashboard />}
    </AppLayout>
  );
}
