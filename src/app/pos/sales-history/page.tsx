"use client";

import React, { useState, useEffect } from 'react';
import { subscribeSales, type PosSale } from '@/lib/firestore-service';
import { Loader2, Inbox } from 'lucide-react';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<PosSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSales(s => { setSales(s); setLoading(false); });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Sales History</h1>
        <p className="text-xs text-muted-foreground">All completed sales transactions.</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['DATE', 'CUSTOMER', 'ITEMS', 'PAYMENT', 'TOTAL', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                  <Inbox className="w-8 h-8 opacity-30 mx-auto mb-2" />No sales records yet.
                </td></tr>
              ) : sales.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.date}</td>
                  <td className="px-5 py-3 font-medium">{s.customerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.items} item{s.items !== 1 ? 's' : ''}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{s.payment}</span></td>
                  <td className="px-5 py-3 font-bold text-blue-600">₱{s.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.status === 'paid' ? 'bg-green-100 text-green-700' : s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
