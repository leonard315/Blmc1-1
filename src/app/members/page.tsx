"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, UserPlus, Loader2 } from 'lucide-react';
import { subscribeUsers, updateUser } from '@/lib/firestore-service';
import { ROLES } from '@/lib/mock-data';
import type { AppUser } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const statusColor: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  approved:    'bg-blue-100 text-blue-700',
  pending:     'bg-yellow-100 text-yellow-700',
  rejected:    'bg-red-100 text-red-700',
  deactivated: 'bg-gray-100 text-gray-500',
};

export default function MembersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground">Manage all cooperative members.</p>
          </div>
          <Button size="sm" className="shadow-md w-full sm:w-auto">
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
    </AppLayout>
  );
}
