"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCheck, Inbox, Loader2, Megaphone, UserPlus, CreditCard } from 'lucide-react';
import { subscribeAnnouncements, subscribeApplications, subscribeTransactions } from '@/lib/firestore-service';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/mock-data';

interface Notification {
  id: string;
  type: 'announcement' | 'application' | 'transaction';
  title: string;
  description: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { currentUser } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) return;
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const notifs: Notification[] = [];

    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= (isAdmin ? 3 : 2)) { setNotifications([...notifs].sort((a,b) => b.date.localeCompare(a.date))); setLoading(false); } };

    // Announcements for all
    const u1 = subscribeAnnouncements(items => {
      const existing = notifs.filter(n => n.type !== 'announcement');
      items.slice(0, 10).forEach(a => existing.push({ id: `ann-${a.id}`, type: 'announcement', title: `New Announcement: ${a.title}`, description: a.content.slice(0, 80) + (a.content.length > 80 ? '...' : ''), date: a.date, read: false }));
      notifs.splice(0, notifs.length, ...existing);
      checkDone();
    });

    // Transactions for member
    const u2 = subscribeTransactions(txs => {
      const myTxs = currentUser.role === ROLES.MEMBER ? txs.filter(t => t.memberId === currentUser.id) : txs;
      const existing = notifs.filter(n => n.type !== 'transaction');
      myTxs.slice(0, 10).forEach(t => existing.push({ id: `tx-${t.id}`, type: 'transaction', title: `Transaction: ${t.type.replace('_',' ')}`, description: `₱${t.amount.toLocaleString()} — ${t.description}`, date: t.date, read: false }));
      notifs.splice(0, notifs.length, ...existing);
      checkDone();
    });

    // Applications for admin
    let u3: (() => void) | undefined;
    if (isAdmin) {
      u3 = subscribeApplications(apps => {
        const pending = apps.filter(a => a.status === 'pending');
        const existing = notifs.filter(n => n.type !== 'application');
        pending.slice(0, 10).forEach(a => existing.push({ id: `app-${a.id}`, type: 'application', title: `New Application: ${a.firstName} ${a.lastName}`, description: `${a.membershipType} membership application pending review.`, date: new Date().toISOString().slice(0,10), read: false }));
        notifs.splice(0, notifs.length, ...existing);
        checkDone();
      });
    } else {
      checkDone();
    }

    return () => { u1(); u2(); u3?.(); };
  }, [currentUser]);

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const iconMap = { announcement: Megaphone, application: UserPlus, transaction: CreditCard };
  const colorMap = { announcement: 'bg-violet-100 text-violet-600', application: 'bg-orange-100 text-orange-500', transaction: 'bg-green-100 text-green-600' };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> Notifications
              {unreadCount > 0 && <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-semibold">{unreadCount}</span>}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Stay updated with the latest activity.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="h-8 text-xs">
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div>
                {notifications.map(n => {
                  const Icon = iconMap[n.type];
                  const isRead = readIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                      className={`flex items-start gap-4 px-5 py-4 border-b last:border-0 cursor-pointer transition-colors ${isRead ? 'bg-white' : 'bg-blue-50/40 hover:bg-blue-50'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium ${isRead ? 'text-foreground' : 'text-foreground font-semibold'}`}>{n.title}</p>
                          {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
