"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Zap, CreditCard,
  Mail, LogOut, BookOpen, MessageSquare, Megaphone,
  Package, Wallet, Settings, Bell,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem,
  SidebarGroup, SidebarGroupContent, useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard, iconBg: 'bg-blue-100',   iconColor: 'text-blue-500' },
  { label: 'Members',    href: '/members',    icon: Users,           iconBg: 'bg-red-100',    iconColor: 'text-red-400' },
  { label: 'Programs',   href: '/programs',   icon: Zap,             iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
  { label: 'Loans',      href: '/loans',      icon: CreditCard,      iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
  { label: 'Applicants', href: '/applicants', icon: Mail,            iconBg: 'bg-pink-100',   iconColor: 'text-pink-500' },
  { label: 'Inventory',  href: '/inventory',  icon: Package,         iconBg: 'bg-orange-100', iconColor: 'text-orange-400' },
  { label: 'Financials', href: '/financials', icon: Wallet,          iconBg: 'bg-green-100',  iconColor: 'text-green-500' },
  { label: 'Settings',   href: '/settings',   icon: Settings,        iconBg: 'bg-gray-100',   iconColor: 'text-gray-500' },
];

const STAFF_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, iconBg: 'bg-blue-100',    iconColor: 'text-blue-500' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone,       iconBg: 'bg-purple-100',  iconColor: 'text-purple-500' },
  { label: 'Inventory',     href: '/inventory',     icon: Package,         iconBg: 'bg-orange-100',  iconColor: 'text-orange-400' },
  { label: 'Financials',    href: '/financials',    icon: Wallet,          iconBg: 'bg-green-100',   iconColor: 'text-green-500' },
  { label: 'My Ledger',     href: '/ledger',        icon: BookOpen,        iconBg: 'bg-sky-100',     iconColor: 'text-sky-500' },
  { label: 'AI Assistant',  href: '/assistant',     icon: MessageSquare,   iconBg: 'bg-violet-100',  iconColor: 'text-violet-500' },
  { label: 'Settings',      href: '/settings',      icon: Settings,        iconBg: 'bg-gray-100',    iconColor: 'text-gray-500' },
];

const MEMBER_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, iconBg: 'bg-blue-100',   iconColor: 'text-blue-500' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone,       iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
  { label: 'My Ledger',     href: '/ledger',        icon: BookOpen,        iconBg: 'bg-sky-100',    iconColor: 'text-sky-500' },
  { label: 'Payments',      href: '/payments',      icon: CreditCard,      iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
  { label: 'AI Assistant',  href: '/assistant',     icon: MessageSquare,   iconBg: 'bg-violet-100', iconColor: 'text-violet-500' },
  { label: 'Settings',      href: '/settings',      icon: Settings,        iconBg: 'bg-gray-100',   iconColor: 'text-gray-500' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAppContext();
  const { setOpenMobile } = useSidebar();

  if (!currentUser) return null;

  const navItems =
    currentUser.role === ROLES.ADMIN ? ADMIN_NAV :
    currentUser.role === ROLES.STAFF ? STAFF_NAV : MEMBER_NAV;

  const roleLabel =
    currentUser.role === ROLES.ADMIN ? 'Admin Portal' :
    currentUser.role === ROLES.STAFF ? 'Staff Portal' : 'Member Portal';

  const handleNavClick = () => setOpenMobile(false);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-gray-100 bg-white">
      {/* ── Header ── */}
      <SidebarHeader className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
            <div className="w-12 h-12 rounded-full border-2 border-red-200 overflow-hidden shrink-0 bg-white flex items-center justify-center">
              <img
                src="/blmc-logo.png"
                alt="BLMC"
                className="w-full h-full object-contain"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute('style');
                }}
              />
              <span className="text-lg font-extrabold text-red-500 hidden">B</span>
            </div>
            <div>
              <p className="font-extrabold text-base text-red-500 leading-tight">BLMC</p>
              <p className="text-xs text-gray-400 leading-tight">{roleLabel}</p>
            </div>
          </div>
          {/* Collapsed icon */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-full border-2 border-red-200 overflow-hidden bg-white flex items-center justify-center">
              <img src="/blmc-logo.png" alt="BLMC" className="w-full h-full object-contain"
                onError={e => { e.currentTarget.style.display='none'; }} />
            </div>
          </div>
          <Bell className="w-5 h-5 text-gray-300 shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      {/* ── Nav Items ── */}
      <SidebarContent className="px-3 py-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all relative group ${
                        isActive
                          ? 'bg-blue-50/80'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Active left border accent */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500" />
                      )}
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      {/* Label */}
                      <span className={`text-sm font-semibold group-data-[collapsible=icon]:hidden ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer — Logout ── */}
      <SidebarFooter className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={async () => { await logout(); setOpenMobile(false); router.push('/login'); }}
          className="flex items-center gap-4 px-3 py-3 rounded-xl w-full hover:bg-red-50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-100">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-sm font-semibold text-red-400 group-hover:text-red-500 group-data-[collapsible=icon]:hidden">
            Logout
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
