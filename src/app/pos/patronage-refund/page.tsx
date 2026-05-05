"use client";

import React, { useState, useEffect } from 'react';
import { subscribeUsers, subscribeSales, type PosSale } from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REFUND_RATE = 0.01;
const YEAR = new Date().getFullYear();

export default function PatronageRefundPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [sales, setSales] = useState<PosSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [computed, setComputed] = useState(false);

  useEffect(() => {
    const u1 = subscribeUsers(u => setUsers(u));
    const u2 = subscribeSales(s => { setSales(s); setLoading(false); });
    return () => { u1(); u2(); };
  }, []);

  const memberRefunds = users.map(m => {
    const annualPurchases = sales
      .filter(s => s.customerId === m.id || s.customerName === m.name)
      .reduce((a, s) => a + s.total, 0);
    const refund = annualPurchases * REFUND_RATE;
    return { ...m, annualPurchases, refund };
  });

  const handleCompute = () => {
    setComputed(true);
    toast({ title: 'Refunds Computed', description: `Patronage refunds for ${YEAR} have been calculated.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Patronage Refund</h1>
          <p className="text-xs text-muted-foreground">Calculate and distribute annual patronage refunds to members.</p>
        </div>
        <Button onClick={handleCompute} size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Compute {YEAR}
        </Button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-green-600 font-bold text-sm">%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">How Patronage Refund Works</p>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
            Each member earns <strong>1%</strong> of their <strong>total purchases</strong> within the year as a patronage refund.
            Example: ₱1,000 in purchases → <strong>₱10.00 refund</strong>. Click "Compute" to calculate and credit all members for the selected year.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold">Member Patronage Refunds — {YEAR}</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['MEMBER', 'ANNUAL PURCHASES', 'REFUND (1%)', 'ACCRUED REFUND'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberRefunds.map(m => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.email} · {m.role}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">₱{m.annualPurchases.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 font-semibold text-green-600">₱{m.refund.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 font-bold text-blue-600">
                      ₱{(computed ? m.refund + (m.savings ?? 0) * 0.005 : (m.savings ?? 0) * 0.005).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
