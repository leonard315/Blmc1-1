"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search, CheckCircle2, XCircle, Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subscribeApplications, updateApplication, type Application } from '@/lib/firestore-service';

export default function ApplicantsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('pending');

  useEffect(() => {
    const unsub = subscribeApplications(apps => { setApplications(apps); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = applications
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    );

  const handleApprove = async (app: Application) => {
    await updateApplication(app.id, { status: 'approved' });
    toast({ title: 'Application Approved', description: `${app.firstName} ${app.lastName}` });
  };

  const handleReject = async (app: Application) => {
    await updateApplication(app.id, { status: 'rejected' });
    toast({ variant: 'destructive', title: 'Application Rejected', description: `${app.firstName} ${app.lastName}` });
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="text-sm text-muted-foreground">Review and process membership applications.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search applicants..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {(['all','pending','approved','rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize ${filter === f ? 'bg-[#5b4fa8] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Applications
              {pendingCount > 0 && <Badge variant="destructive" className="ml-1">{pendingCount} pending</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {['Name', 'Email', 'Type', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(app => (
                      <tr key={app.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{app.firstName} {app.lastName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{app.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{app.membershipType}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-600'
                          }`}>{app.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(app)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleReject(app)}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
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
