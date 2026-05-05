"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Wallet, TrendingUp, Inbox, Loader2 } from 'lucide-react';
import { subscribeMemberTransactions, type Transaction } from '@/lib/firestore-service';

export default function LedgerPage() {
  const { currentUser } = useAppContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'deposit'|'payment'|'debt_charge'>('all');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeMemberTransactions(currentUser.id, txs => {
      setTransactions(txs);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return null;

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Ledger</h1>
          <p className="text-sm text-muted-foreground">Your complete savings and debt transaction history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Savings Balance</p><p className="text-2xl font-bold text-emerald-600">₱{(currentUser.savings ?? 0).toLocaleString()}</p></div>
              <div className="p-3 bg-emerald-50 rounded-xl"><Wallet className="w-5 h-5 text-emerald-600" /></div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Debt Balance</p><p className="text-2xl font-bold text-red-500">₱{(currentUser.debt ?? 0).toLocaleString()}</p></div>
              <div className="p-3 bg-red-50 rounded-xl"><TrendingUp className="w-5 h-5 text-red-500" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all','deposit','payment','debt_charge'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? 'bg-[#5b4fa8] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Date', 'Type', 'Description', 'Amount'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(tx => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${tx.type === 'deposit' ? 'bg-green-100 text-green-700' : tx.type === 'payment' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                            {tx.type.replace('_',' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[150px] truncate">{tx.description}</td>
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${tx.type === 'debt_charge' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.type === 'debt_charge' ? '-' : '+'}₱{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
