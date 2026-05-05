"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ROLES } from '@/lib/mock-data';

type Tab = 'profile' | 'security' | 'notifications' | 'appearance';

export default function SettingsPage() {
  const { currentUser, logout } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile
  const [name, setName] = useState(currentUser?.name ?? '');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notifications
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);
  const [notifTransactions, setNotifTransactions] = useState(true);
  const [notifApplications, setNotifApplications] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sidebarColor, setSidebarColor] = useState<'default' | 'dark' | 'purple' | 'blue'>('default');
  const [compactMode, setCompactMode] = useState(false);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [currency, setCurrency] = useState('PHP');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === ROLES.ADMIN;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'security',      label: 'Security',      icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match', description: 'New password and confirmation must match.' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Password must be at least 6 characters.' });
      return;
    }
    toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Notification Preferences Saved' });
  };

  const handleSaveAppearance = () => {
    toast({ title: 'Appearance Settings Saved' });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Sidebar tabs — horizontal scroll on mobile */}
          <div className="md:w-48 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:w-full text-left shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Sign out — hidden on mobile (in tabs area) */}
            <div className="hidden md:block mt-6 pt-4 border-t">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" /> Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize mt-1 inline-block">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Full Name <span className="text-red-500">*</span></Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Email Address</Label>
                        <Input value={currentUser.email} disabled className="h-10 bg-muted/40 cursor-not-allowed" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Contact Number</Label>
                        <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="0912 345 6789" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Address</Label>
                        <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Barangay, Municipality, Province" className="h-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Role</Label>
                        <Input value={currentUser.role} disabled className="h-10 bg-muted/40 cursor-not-allowed capitalize" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Member Since</Label>
                        <Input value={currentUser.joinedDate} disabled className="h-10 bg-muted/40 cursor-not-allowed" />
                      </div>
                    </div>

                    <Button type="submit" className="h-10 bg-[#5b4fa8] hover:bg-[#4a3f96]">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            className="h-10 pr-10"
                            placeholder="Enter current password"
                          />
                          <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            className="h-10 pr-10"
                            placeholder="At least 6 characters"
                          />
                          <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            className="h-10 pr-10"
                            placeholder="Repeat new password"
                          />
                          <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="h-10 bg-[#5b4fa8] hover:bg-[#4a3f96]">
                        <Lock className="w-4 h-4 mr-2" /> Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Email verified', status: true },
                      { label: 'Firebase Authentication enabled', status: true },
                      { label: 'Role-based access control', status: true },
                      { label: 'Session token authentication', status: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'New Announcements', desc: 'Get notified when a new announcement is posted', value: notifAnnouncements, set: setNotifAnnouncements },
                    { label: 'Transaction Updates', desc: 'Get notified when a transaction is recorded on your account', value: notifTransactions, set: setNotifTransactions },
                    ...(isAdmin ? [{ label: 'New Applications', desc: 'Get notified when a new membership application is submitted', value: notifApplications, set: setNotifApplications }] : []),
                    { label: 'Email Notifications', desc: 'Receive notifications via email in addition to in-app', value: notifEmail, set: setNotifEmail },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-[#5b4fa8]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                  <Button onClick={handleSaveNotifications} className="h-10 bg-[#5b4fa8] hover:bg-[#4a3f96]">
                    <Save className="w-4 h-4 mr-2" /> Save Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── Appearance Tab ── */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">

                {/* Theme */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'system'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-colors capitalize text-sm font-medium ${
                            theme === t ? 'border-[#5b4fa8] bg-[#5b4fa8]/5 text-[#5b4fa8]' : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}</span>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Color */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Sidebar Color</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'default', label: 'Default', bg: 'bg-white border-2 border-gray-200', dot: 'bg-gray-400' },
                        { id: 'dark',    label: 'Dark',    bg: 'bg-[#1a1a2e]', dot: 'bg-white' },
                        { id: 'purple',  label: 'Purple',  bg: 'bg-[#5b4fa8]', dot: 'bg-white' },
                        { id: 'blue',    label: 'Blue',    bg: 'bg-[#1e3a5f]', dot: 'bg-white' },
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSidebarColor(c.id as any)}
                          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${c.bg} ${sidebarColor === c.id ? 'ring-2 ring-[#5b4fa8] ring-offset-2' : 'hover:opacity-90'}`}
                        >
                          <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                          <span className={`text-xs font-medium ${c.id === 'default' ? 'text-gray-700' : 'text-white'}`}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Font Size */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Font Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { id: 'small',  label: 'Small',  preview: 'text-xs' },
                        { id: 'medium', label: 'Medium', preview: 'text-sm' },
                        { id: 'large',  label: 'Large',  preview: 'text-base' },
                      ] as const).map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFontSize(f.id)}
                          className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                            fontSize === f.id ? 'border-[#5b4fa8] bg-[#5b4fa8]/5 text-[#5b4fa8]' : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                          }`}
                        >
                          <span className={`font-bold ${f.preview}`}>Aa</span>
                          <span className="text-xs">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Display Options */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Display Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Compact mode */}
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="text-sm font-medium">Compact Mode</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing and padding for a denser layout</p>
                      </div>
                      <button
                        onClick={() => setCompactMode(p => !p)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${compactMode ? 'bg-[#5b4fa8]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${compactMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Date format */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Date Format</Label>
                      <select
                        value={dateFormat}
                        onChange={e => setDateFormat(e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b4fa8]"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY (05/15/2026)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (15/05/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-05-15)</option>
                        <option value="MMM DD, YYYY">MMM DD, YYYY (May 15, 2026)</option>
                      </select>
                    </div>

                    {/* Currency */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Currency Display</Label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b4fa8]"
                      >
                        <option value="PHP">Philippine Peso (₱)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Language & Region */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Language & Region</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Language</Label>
                      <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b4fa8]"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="fil">🇵🇭 Filipino</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Timezone</Label>
                      <select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b4fa8]"
                      >
                        <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                        <option value="UTC">UTC (UTC+0)</option>
                        <option value="America/New_York">America/New_York (UTC-5)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSaveAppearance} className="h-10 bg-[#5b4fa8] hover:bg-[#4a3f96] w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" /> Save Appearance
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
