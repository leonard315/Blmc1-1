"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Plus, Calendar, Loader2, Trash2, X } from 'lucide-react';
import { ROLES } from '@/lib/mock-data';
import {
  subscribeAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';

const typeBadge: Record<string, string> = {
  event:  'bg-blue-100 text-blue-700',
  info:   'bg-green-100 text-green-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function AnnouncementsPage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'event'|'info'|'urgent'>('all');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'event'|'info'|'urgent'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeAnnouncements(items => {
      setAnnouncements(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (!currentUser) return null;

  const isStaff = currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.STAFF;
  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.type === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await addAnnouncement({ title, content, date, type, createdBy: currentUser.id });

    // Notify all users about the new announcement
    try {
      const { subscribeUsers, addNotification } = await import('@/lib/firestore-service');
      const { getUsers } = await import('@/lib/firestore-service');
      const allUsers = await getUsers();
      await Promise.all(allUsers.map(u =>
        addNotification(u.id, {
          title: `New Announcement: ${title}`,
          message: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
          type: 'announcement',
          read: false,
          link: '/announcements',
        })
      ));
    } catch {}

    toast({ title: 'Announcement Posted', description: title });
    setTitle(''); setContent(''); setDate(new Date().toISOString().slice(0, 10)); setType('info');
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    await deleteAnnouncement(id);
    toast({ title: 'Deleted', description: title });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-sm text-muted-foreground">Stay updated with the latest cooperative news and events.</p>
          </div>
          {isStaff && (
            <Button size="sm" className="shadow-md" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Post Announcement
            </Button>
          )}
        </div>

        {/* Post form */}
        {showForm && isStaff && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">New Announcement</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Title <span className="text-red-500">*</span></Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required className="h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Type</Label>
                      <select value={type} onChange={e => setType(e.target.value as any)} className="w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="info">Info</option>
                        <option value="event">Event</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Date</Label>
                      <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Content <span className="text-red-500">*</span></Label>
                  <Textarea value={content} onChange={e => setContent(e.target.value)} required className="min-h-[80px]" />
                </div>
                <Button type="submit" disabled={saving} className="h-9">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Post
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all','event','info','urgent'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize ${filter === f ? 'bg-[#5b4fa8] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Megaphone className="w-10 h-10 opacity-30" />
                <p className="text-sm">No announcements found.</p>
              </div>
            ) : filtered.map(a => (
              <Card key={a.id} className="border-l-4 border-l-[#5b4fa8] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeBadge[a.type]}`}>
                      {a.type.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{a.date}
                      </span>
                      {isStaff && (
                        <button onClick={() => handleDelete(a.id, a.title)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
