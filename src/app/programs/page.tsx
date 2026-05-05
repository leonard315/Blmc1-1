"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Plus, Inbox, Loader2, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

interface Program {
  id: string; title: string; description: string; category: string;
  startDate: string; endDate: string; status: 'active'|'completed'|'upcoming'; createdAt?: Timestamp;
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', upcoming: 'bg-yellow-100 text-yellow-700',
};

export default function ProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active'|'upcoming'|'completed'>('upcoming');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'programs'), orderBy('createdAt', 'desc')), snap => {
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Program)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await addDoc(collection(db, 'programs'), { title, description, category, startDate, endDate, status, createdAt: serverTimestamp() });
    toast({ title: 'Program Added', description: title });
    setTitle(''); setDescription(''); setCategory(''); setStartDate(''); setEndDate(''); setStatus('upcoming');
    setShowForm(false); setSaving(false);
  };

  const handleDelete = async (id: string, t: string) => {
    await deleteDoc(doc(db, 'programs', id));
    toast({ title: 'Deleted', description: t });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
            <p className="text-sm text-muted-foreground">Manage cooperative programs and services.</p>
          </div>
          <Button size="sm" className="shadow-md" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Program
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Programs', value: programs.length, color: 'text-yellow-600' },
            { label: 'Active', value: programs.filter(p => p.status === 'active').length, color: 'text-green-600' },
            { label: 'Upcoming', value: programs.filter(p => p.status === 'upcoming').length, color: 'text-blue-600' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {showForm && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">New Program</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Title <span className="text-red-500">*</span></Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Category</Label>
                    <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Training, Livelihood" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Start Date</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">End Date</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Status</Label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-[70px]" />
                </div>
                <Button type="submit" disabled={saving} className="h-9">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Program
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4" /> Program List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No programs yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Title', 'Category', 'Start', 'End', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{p.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.startDate || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.endDate || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(p.id, p.title)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
