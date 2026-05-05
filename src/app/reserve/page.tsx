"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, Inbox } from 'lucide-react';

export default function ReservePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reserve</h1>
          <p className="text-sm text-muted-foreground">Manage cooperative reserve funds and allocations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Reserve Fund', value: '₱0.00', color: 'text-orange-500' },
            { label: 'Allocated', value: '₱0.00', color: 'text-blue-600' },
            { label: 'Available', value: '₱0.00', color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Archive className="w-4 h-4" /> Reserve Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Inbox className="w-10 h-10 opacity-30" />
              <p className="text-sm">No reserve records yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
