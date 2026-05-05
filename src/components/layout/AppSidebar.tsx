"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Zap, CreditCard, Archive,
  Mail, LogOut, BookOpen, MessageSquare, Megaphone,
  Package, Wallet, Settings,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupContent, useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
  { label: 'Members',    href: '/members',    icon: Users,           iconBg: 'bg-green-100',  iconColor: 'text-green-600' },
  { label: 'Programs',   href: '/programs',   icon: Zap,             iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
  { label: 'Loans',      href: '/loans',      icon: CreditCard,      iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { label: 'Reserve',    href: '/reserve',    icon: Archive,         iconBg: 'bg-orange-100', iconColor: 'text-orange-400' },
  { label: 'Applicants', href: '/applicants', icon: Mail,            iconBg: 'bg-red-100',    iconColor: 'text-red-500' },
  { label: 'Settings',   href: '/settings',   icon: Settings,        iconBg: 'bg-gray-100',   iconColor: 'text-gray-600' },
];

const STAFF_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, iconBg: 'bg-blue-100',    iconColor: 'text-blue-600' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone,       iconBg: 'bg-violet-100',  iconColor: 'text-violet-600' },
  { label: 'Inventory',     href: '/inventory',     icon: Package,         iconBg: 'bg-orange-100',  iconColor: 'text-orange-500' },
  { label: 'Financials',    href: '/financials',    icon: Wallet,          iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'My Ledger',     href: '/ledger',        icon: BookOpen,        iconBg: 'bg-sky-100',     iconColor: 'text-sky-600' },
  { label: 'AI Assistant',  href: '/assistant',     icon: MessageSquare,   iconBg: 'bg-primary/10',  iconColor: 'text-primary' },
  { label: 'Settings',      href: '/settings',      icon: Settings,        iconBg: 'bg-gray-100',    iconColor: 'text-gray-600' },
];

const MEMBER_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone,       iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { label: 'My Ledger',     href: '/ledger',        icon: BookOpen,        iconBg: 'bg-sky-100',    iconColor: 'text-sky-600' },
  { label: 'Payments',      href: '/payments',      icon: CreditCard,      iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { label: 'AI Assistant',  href: '/assistant',     icon: MessageSquare,   iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Settings',      href: '/settings',      icon: Settings,        iconBg: 'bg-gray-100',   iconColor: 'text-gray-600' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAppContext();
  const { setOpenMobile } = useSidebar();

  if (!currentUser) return null;

  const navItems =
    currentUser.role === ROLES.ADMIN ? ADMIN_NAV :
    currentUser.role === ROLES.STAFF ? STAFF_NAV : MEMBER_NAV;

  const roleLabel =
    currentUser.role === ROLES.ADMIN ? 'Admin Portal' :
    currentUser.role === ROLES.STAFF ? 'Staff Portal' : 'Member Portal';

  const handleNavClick = () => {
    // Close mobile sidebar on nav item click
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
          >
            B
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-extrabold text-sm leading-tight truncate text-sidebar-foreground">BLMC Connect</span>
            <span className="text-[10px] text-sidebar-foreground/50 truncate">{roleLabel}</span>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="opacity-30" />

      {/* Nav Items */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`rounded-xl h-10 transition-all ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' } : {}}
                    >
                      <Link href={item.href} onClick={handleNavClick} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white/20' : item.iconBg}`}>
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor}`} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — Logout */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <Button
          onClick={() => { logout(); setOpenMobile(false); }}
          variant="ghost"
          className="w-full rounded-xl h-10 font-semibold gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
