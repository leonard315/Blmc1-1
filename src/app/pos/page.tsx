"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeSales, type PosSale } from '@/lib/firestore-service';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PosDashboard() {
  const [now, setNow] = useState(new Date());
  const [sales, setSales] = useState<PosSale[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const unsub = subscribeSales(s => setSales(s));
    return () => unsub();
  }, []);

  const today = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);

  const todaySales   = sales.filter(s => s.date === today).reduce((a, s) => a + s.total, 0);
  const transactions = sales.filter(s => s.date === today).length;
  const monthlySales = sales.filter(s => s.date.startsWith(thisMonth)).reduce((a, s) => a + s.total, 0);
  const recent = sales.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">POS Dashboard</h1>
          <p className="text-xs text-muted-foreground">Sales overview</p>
        </div>
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
          <Link href="/pos/new-sale"><Plus className="w-3.5 h-3.5 mr-1" /> New Sale</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>
            <span className="text-xs text-blue-500 font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold">₱{todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-0.5">TODAY'S SALES</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center"><span className="text-white text-sm font-bold">#</span></div>
            <span className="text-xs text-green-500 font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold">{transactions}</p>
          <p className="text-xs text-muted-foreground mt-0.5">TRANSACTIONS</p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-white" /></div>
            <span className="text-xs text-purple-500 font-medium">Month</span>
          </div>
          <p className="text-2xl font-bold">₱{monthlySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-0.5">MONTHLY SALES</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Recent Sales</h2>
          <Link href="/pos/sales-history" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['DATE', 'CUSTOMER', 'PAYMENT', 'TOTAL', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No recent sales.</td></tr>
              ) : recent.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.date}</td>
                  <td className="px-5 py-3 font-medium">{s.customerName}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{s.payment}</span></td>
                  <td className="px-5 py-3 font-bold text-blue-600">₱{s.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
