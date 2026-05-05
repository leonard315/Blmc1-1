"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, Users, ChevronRight, Inbox, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { subscribeTransactions, subscribeUsers, addTransaction, type Transaction } from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ROLES } from '@/lib/mock-data';

export default function FinancialsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [memberId, setMemberId] = useState('');
  const [txType, setTxType] = useState<'deposit'|'payment'|'debt_charge'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = subscribeUsers(u => setUsers(u));
    const u2 = subscribeTransactions(txs => { setTransactions(txs); setLoading(false); });
    return () => { u1(); u2(); };
  }, []);

  const members = users.filter(u => u.role === ROLES.MEMBER || u.role === ROLES.STAFF);
  const totalSavings = users.reduce((s, u) => s + (u.savings ?? 0), 0);
  const totalDebt    = users.reduce((s, u) => s + (u.debt ?? 0), 0);
  const activeMembers = users.filter(u => u.status === 'active' || u.status === 'approved').length;
  const recent = transactions.slice(0, 10);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount) return;
    const member = users.find(u => u.id === memberId);
    if (!member) return;
    setSaving(true);
    await addTransaction({
      memberId,
      memberName: member.name,
      type: txType,
      description: description || txType.replace('_', ' '),
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
    });
    toast({ title: 'Transaction Recorded', description: `₱${Number(amount).toLocaleString()} for ${member.name}` });
    setMemberId(''); setAmount(''); setDescription(''); setShowForm(false);
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
            <p className="text-sm text-muted-foreground">Cooperative-wide financial overview.</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)} className="shadow-md">
            <Plus className="w-4 h-4 mr-1" /> Record Transaction
          </Button>
        </div>

        {/* Transaction form */}
        {showForm && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">New Transaction</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Member <span className="text-red-500">*</span></Label>
                  <select value={memberId} onChange={e => setMemberId(e.target.value)} required className="w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select member...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Type</Label>
                  <select value={txType} onChange={e => setTxType(e.target.value as any)} className="w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="deposit">Deposit</option>
                    <option value="payment">Payment</option>
                    <option value="debt_charge">Debt Charge</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Amount ₱ <span className="text-red-500">*</span></Label>
                  <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" className="h-9" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={saving} className="h-9">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Record
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Savings</p><p className="text-2xl font-bold text-emerald-600">₱{totalSavings.toLocaleString()}</p></div>
              <div className="p-3 bg-emerald-50 rounded-xl"><Wallet className="w-5 h-5 text-emerald-600" /></div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Debt</p><p className="text-2xl font-bold text-red-500">₱{totalDebt.toLocaleString()}</p></div>
              <div className="p-3 bg-red-50 rounded-xl"><TrendingUp className="w-5 h-5 text-red-500" /></div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Members</p><p className="text-2xl font-bold text-blue-600">{activeMembers}</p></div>
              <div className="p-3 bg-blue-50 rounded-xl"><Users className="w-5 h-5 text-blue-600" /></div>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link href="/ledger">View all <ChevronRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Member', 'Type', 'Description', 'Amount', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(tx => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{tx.memberName}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${tx.type === 'deposit' ? 'bg-green-100 text-green-700' : tx.type === 'payment' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate">{tx.description}</td>
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${tx.type === 'debt_charge' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.type === 'debt_charge' ? '-' : '+'}₱{tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.date}</td>
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
