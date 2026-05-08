"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Loader2, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/NotificationBell';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading, logout } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-w-0">
        {/* ── Top header ── */}
        <header className="flex h-14 shrink-0 items-center justify-between px-3 sm:px-5 border-b bg-white sticky top-0 z-10 shadow-sm">
          {/* Left: sidebar trigger + title */}
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm"
                style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
              >
                B
              </div>
              <h2 className="text-sm font-bold text-gray-800 truncate">BLMC Connect</h2>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Notification bell */}
            <NotificationBell />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-9 w-9 shadow-sm border-2 border-white ring-1 ring-gray-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=5b4fa8&textColor=ffffff`} />
                    <AvatarFallback
                      className="text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-2xl shadow-xl border border-gray-100 p-1" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}&backgroundColor=5b4fa8&textColor=ffffff`} />
                      <AvatarFallback className="text-white font-bold" style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}>
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-semibold leading-none truncate">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentUser.email}</p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize w-fit mt-1.5 text-white"
                        style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer rounded-xl mx-1 px-3 py-2.5">
                  <User className="w-4 h-4 mr-2.5 text-gray-500" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer rounded-xl mx-1 px-3 py-2.5">
                  <Settings className="w-4 h-4 mr-2.5 text-gray-500" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={async () => { await logout(); router.push('/login'); }}
                  className="text-red-500 focus:text-red-500 cursor-pointer rounded-xl mx-1 px-3 py-2.5 mb-1"
                >
                  <LogOut className="w-4 h-4 mr-2.5" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="p-4 sm:p-6 md:p-8 animate-in fade-in duration-300 min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
