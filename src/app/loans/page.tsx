"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Inbox, Loader2, X, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  updateDoc, doc, serverTimestamp, type Timestamp
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { subscribeUsers } from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';

const { firestore: db } = initializeFirebase();

interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  appliedDate: string;
  createdAt?: Timestamp;
}

export default function LoansPage() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loansCol = collection(db, 'loans');
    const unsub = onSnapshot(query(loansCol, orderBy('createdAt', 'desc')), snap => {
      setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Loan)));
      setLoading(false);
    });
    const unsub2 = subscribeUsers(u => setMembers(u.filter(m => m.role === ROLES.MEMBER)));
    return () => { unsub(); unsub2(); };
  }, []);

  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'approved').length;
  const pendingLoans = loans.filter(l => l.status === 'pending').length;
  const totalAmount = loans.filter(l => l.status === 'approved').reduce((s, l) => s + l.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount) return;
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    setSaving(true);
    await addDoc(collection(db, 'loans'), {
      memberId,
      memberName: member.name,
      amount: Number(amount),
      purpose,
      status: 'pending',
      appliedDate: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
    });
    toast({ title: 'Loan Application Submitted', description: `₱${Number(amount).toLocaleString()} for ${member.name}` });
    setMemberId(''); setAmount(''); setPurpose(''); setShowForm(false);
    setSaving(false);
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected' | 'paid') => {
    await updateDoc(doc(db, 'loans', id), { status });
    toast({ title: `Loan ${status}` });
  };

  const statusColor: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    paid:     'bg-blue-100 text-blue-700',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
            <p className="text-sm text-muted-foreground">Manage member loan applications and records.</p>
          </div>
          <Button size="sm" className="shadow-md" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Loan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Loans', value: totalLoans, color: 'text-blue-600' },
            { label: 'Active', value: activeLoans, color: 'text-green-600' },
            { label: 'Pending', value: pendingLoans, color: 'text-yellow-600' },
            { label: 'Total Amount', value: `₱${totalAmount.toLocaleString()}`, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">New Loan Application</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Member <span className="text-red-500">*</span></Label>
                  <select value={memberId} onChange={e => setMemberId(e.target.value)} required className="w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select member...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Amount ₱ <span className="text-red-500">*</span></Label>
                  <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Purpose</Label>
                  <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Livestock purchase" className="h-9" />
                </div>
                <div className="md:col-span-3">
                  <Button type="submit" disabled={saving} className="h-9">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Loan Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No loan records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[550px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Member', 'Amount', 'Purpose', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{loan.memberName}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">₱{loan.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{loan.purpose || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{loan.appliedDate}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[loan.status]}`}>{loan.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {loan.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleStatus(loan.id, 'approved')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200" onClick={() => handleStatus(loan.id, 'rejected')}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                          {loan.status === 'approved' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-blue-600 border-blue-200" onClick={() => handleStatus(loan.id, 'paid')}>
                              Mark Paid
                            </Button>
                          )}
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
