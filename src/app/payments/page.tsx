"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Inbox, Loader2 } from 'lucide-react';
import { subscribeMemberTransactions, type Transaction } from '@/lib/firestore-service';

export default function PaymentsPage() {
  const { currentUser } = useAppContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeMemberTransactions(currentUser.id, txs => {
      setTransactions(txs.filter(t => t.type === 'payment' || t.type === 'debt_charge'));
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Your payment and debt charge history.</p>
        </div>
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No payment records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Date', 'Type', 'Description', 'Amount'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.type === 'payment' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                            {tx.type.replace('_',' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">{tx.description}</td>
                        <td className={`px-4 py-3 font-semibold ${tx.type === 'debt_charge' ? 'text-red-500' : 'text-blue-600'}`}>
                          ₱{tx.amount.toLocaleString()}
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
