"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { subscribeUsers, updateUser } from '@/lib/firestore-service';
import { ROLES } from '@/lib/mock-data';
import type { AppUser } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const statusColor: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  approved:    'bg-blue-100 text-blue-700',
  pending:     'bg-yellow-100 text-yellow-700',
  rejected:    'bg-red-100 text-red-700',
  deactivated: 'bg-gray-100 text-gray-500',
};

const ROLE_OPTIONS = [
  { label: 'Member', value: ROLES.MEMBER },
  { label: 'Staff', value: ROLES.STAFF },
  { label: 'Administrator', value: ROLES.ADMIN },
] as const;

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Deactivated', value: 'deactivated' },
] as const;

type NewMemberForm = {
  name: string;
  email: string;
  password: string;
  role: AppUser['role'];
  status: AppUser['status'];
  savings: string;
  debt: string;
  joinedDate: string;
};

const defaultForm: NewMemberForm = {
  name: '',
  email: '',
  password: '',
  role: ROLES.MEMBER,
  status: 'active',
  savings: '0',
  debt: '0',
  joinedDate: new Date().toISOString().slice(0, 10),
};

export default function MembersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewMemberForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsub = subscribeUsers(all => { setUsers(all); setLoading(false); });
    return () => unsub();
  }, []);

  const members = users.filter(u => u.role === ROLES.MEMBER);
  const filtered = members.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = async (u: AppUser) => {
    const newStatus = u.status === 'deactivated' ? 'active' : 'deactivated';
    await updateUser(u.id, { status: newStatus });
    toast({ title: newStatus === 'deactivated' ? 'Account Deactivated' : 'Account Reactivated', description: u.name });
  };

  const openDialog = () => {
    setForm(defaultForm);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof NewMemberForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Validation Error', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { auth, firestore } = initializeFirebase();

      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const uid = credential.user.uid;

      // 2. Save Firestore profile using the Auth UID
      const userData: Omit<AppUser, 'id'> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        savings: parseFloat(form.savings) || 0,
        debt: parseFloat(form.debt) || 0,
        joinedDate: form.joinedDate,
      };
      await setDoc(doc(firestore, 'users', uid), userData);

      // 3. Send password reset email so the member can set their own password
      await sendPasswordResetEmail(auth, form.email.trim());

      toast({
        title: 'Member Added',
        description: `${form.name.trim()} has been added. A welcome email with login instructions has been sent to ${form.email.trim()}.`,
      });
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({ title: 'Error Adding Member', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground">Manage all cooperative members.</p>
          </div>
          <Button size="sm" className="shadow-md w-full sm:w-auto" onClick={openDialog}>
            <UserPlus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: members.length, color: 'text-blue-600' },
            { label: 'Active', value: members.filter(u => u.status === 'active' || u.status === 'approved').length, color: 'text-green-600' },
            { label: 'Pending', value: members.filter(u => u.status === 'pending').length, color: 'text-yellow-600' },
            { label: 'Deactivated', value: members.filter(u => u.status === 'deactivated').length, color: 'text-gray-500' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-9 h-9 max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table — desktop */}
        <Card className="border shadow-sm hidden md:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Member List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Name', 'Email', 'Status', 'Savings', 'Debt', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No members found.</td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[u.status] ?? 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
                        </td>
                        <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">₱{(u.savings ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-red-500 font-medium whitespace-nowrap">₱{(u.debt ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.joinedDate}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className={`h-7 text-xs ${u.status === 'deactivated' ? 'text-green-600' : 'text-red-500'}`} onClick={() => handleDeactivate(u)}>
                            {u.status === 'deactivated' ? 'Reactivate' : 'Deactivate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No members found.</p>
          ) : filtered.map(u => (
            <Card key={u.id} className="border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[u.status] ?? 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Savings</p><p className="font-semibold text-emerald-600">₱{(u.savings ?? 0).toLocaleString()}</p></div>
                  <div><p className="text-xs text-muted-foreground">Debt</p><p className="font-semibold text-red-500">₱{(u.debt ?? 0).toLocaleString()}</p></div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Joined: {u.joinedDate}</p>
                  <Button variant="ghost" size="sm" className={`h-7 text-xs ${u.status === 'deactivated' ? 'text-green-600' : 'text-red-500'}`} onClick={() => handleDeactivate(u)}>
                    {u.status === 'deactivated' ? 'Reactivate' : 'Deactivate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="member-name"
                placeholder="Full name"
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="member-email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => handleFormChange('email', e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="member-password">
                Temporary Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="member-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => handleFormChange('password', e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                A password reset email will be sent to the member so they can set their own password.
              </p>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="member-role">Role</Label>
                <Select value={form.role} onValueChange={v => handleFormChange('role', v)}>
                  <SelectTrigger id="member-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-status">Status</Label>
                <Select value={form.status} onValueChange={v => handleFormChange('status', v)}>
                  <SelectTrigger id="member-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Savings & Debt */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="member-savings">Initial Savings (₱)</Label>
                <Input
                  id="member-savings"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.savings}
                  onChange={e => handleFormChange('savings', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-debt">Initial Debt (₱)</Label>
                <Input
                  id="member-debt"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.debt}
                  onChange={e => handleFormChange('debt', e.target.value)}
                />
              </div>
            </div>

            {/* Joined Date */}
            <div className="space-y-1.5">
              <Label htmlFor="member-joined">Joined Date</Label>
              <Input
                id="member-joined"
                type="date"
                value={form.joinedDate}
                onChange={e => handleFormChange('joinedDate', e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving…</> : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
