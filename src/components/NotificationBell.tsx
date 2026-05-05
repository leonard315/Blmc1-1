"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Megaphone, TrendingUp, Users, Settings, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  subscribeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from '@/lib/firestore-service';
import { useRouter } from 'next/navigation';

const typeIcon: Record<string, React.ElementType> = {
  announcement: Megaphone,
  transaction:  TrendingUp,
  application:  Users,
  system:       Settings,
};

const typeColor: Record<string, string> = {
  announcement: 'bg-violet-100 text-violet-600',
  transaction:  'bg-emerald-100 text-emerald-600',
  application:  'bg-orange-100 text-orange-500',
  system:       'bg-gray-100 text-gray-500',
};

function timeAgo(ts?: { toMillis?: () => number }): string {
  if (!ts?.toMillis) return 'just now';
  const diff = Date.now() - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const { currentUser } = useAppContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeNotifications(currentUser.id, setNotifications);
    return () => unsub();
  }, [currentUser]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read);
  const unreadCount = unread.length;

  const handleClick = async (n: AppNotification) => {
    if (!currentUser) return;
    if (!n.read) await markNotificationRead(currentUser.id, n.id);
    if (n.link) router.push(n.link);
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!currentUser || unread.length === 0) return;
    await markAllNotificationsRead(currentUser.id, unread.map(n => n.id));
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none px-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-[#5b4fa8] hover:underline font-medium px-2 py-1 rounded-lg hover:bg-[#5b4fa8]/5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => {
                const Icon = typeIcon[n.type] ?? Bell;
                const colorClass = typeColor[n.type] ?? 'bg-gray-100 text-gray-500';
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${!n.read ? 'bg-[#5b4fa8]/[0.02]' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#5b4fa8] shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                onClick={() => { router.push('/notifications'); setOpen(false); }}
                className="flex items-center justify-center gap-1 w-full text-xs font-semibold text-[#5b4fa8] hover:underline py-1"
              >
                View all notifications <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
