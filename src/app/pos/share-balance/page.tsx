"use client";

import React, { useState, useEffect } from 'react';
import { subscribeUsers, addTransaction, type Transaction } from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareTx { id: string; memberName: string; type: 'deposit'|'withdraw'; amount: number; note: string; date: string; }

export default function ShareBalancePage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<AppUser | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [txType, setTxType] = useState<'deposit'|'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState<ShareTx[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeUsers(u => setMembers(u.filter(m => m.role === ROLES.MEMBER)));
    return () => unsub();
  }, []);

  const filtered = members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const handleProcess = async () => {
    if (!selectedMember || !amount || Number(amount) <= 0) {
      toast({ variant: 'destructive', title: 'Invalid input', description: 'Select a member and enter a valid amount.' });
      return;
    }
    setSaving(true);
    // Record as transaction in Firestore
    await addTransaction({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      type: txType === 'deposit' ? 'deposit' : 'payment',
      description: note || `Share capital ${txType}`,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
    });
    const tx: ShareTx = {
      id: Date.now().toString(),
      memberName: selectedMember.name,
      type: txType,
      amount: Number(amount),
      note,
      date: new Date().toLocaleDateString('en-PH'),
    };
    setTransactions(prev => [tx, ...prev]);
    toast({ title: 'Transaction Processed', description: `${txType === 'deposit' ? 'Deposited' : 'Withdrew'} ₱${Number(amount).toLocaleString()} for ${selectedMember.name}.` });
    setAmount(''); setNote('');
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Share Balance</h1>
        <p className="text-xs text-muted-foreground">Record share capital deposits and withdrawals.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SELECT MEMBER</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={memberSearch} onChange={e => { setMemberSearch(e.target.value); setShowDrop(true); }} onFocus={() => setShowDrop(true)} placeholder="Search member..." className="pl-8 h-9 text-sm" />
              {showDrop && memberSearch && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {filtered.map(m => (
                    <button key={m.id} className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" onClick={() => { setSelectedMember(m); setMemberSearch(m.name); setShowDrop(false); }}>
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">₱{(m.savings ?? 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">TRANSACTION TYPE</label>
            <div className="grid grid-cols-2 gap-2">
              {(['deposit','withdraw'] as const).map(t => (
                <button key={t} onClick={() => setTxType(t)} className={`h-9 rounded-lg text-sm font-semibold border-2 transition-colors capitalize flex items-center justify-center gap-1.5 ${txType === t ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-200 text-muted-foreground hover:border-gray-300'}`}>
                  {t === 'deposit' ? '⬆' : '⬇'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AMOUNT ₱</label>
            <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">NOTES (OPTIONAL)</label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Monthly deposit" className="h-9 text-sm" />
          </div>
          <Button onClick={handleProcess} disabled={saving} className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Process Transaction
          </Button>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Recent Share Transactions</h3>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Inbox className="w-10 h-10 opacity-30" />
              <p className="text-sm">No share transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{tx.memberName}</p>
                    <p className="text-xs text-muted-foreground">{tx.note || tx.type} · {tx.date}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
