"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Wallet, TrendingUp, Save } from 'lucide-react';
import { ROLES } from '@/lib/mock-data';

export default function ProfilePage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">View and update your account information.</p>
        </div>

        {/* Avatar + role */}
        <Card className="border shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={`https://picsum.photos/seed/${currentUser.id}/100`} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize mt-1 inline-block">{currentUser.role}</span>
            </div>
          </CardContent>
        </Card>

        {/* Balances for members */}
        {currentUser.role === ROLES.MEMBER && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">Savings Balance</p><p className="text-xl font-bold text-emerald-600">₱{currentUser.savings.toLocaleString()}</p></div>
                <div className="p-2 bg-emerald-50 rounded-lg"><Wallet className="w-4 h-4 text-emerald-600" /></div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">Debt Balance</p><p className="text-xl font-bold text-red-500">₱{currentUser.debt.toLocaleString()}</p></div>
                <div className="p-2 bg-red-50 rounded-lg"><TrendingUp className="w-4 h-4 text-red-500" /></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit form */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Full Name <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input value={currentUser.email} disabled className="h-10 bg-muted/40 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed from this page.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Contact Number</Label>
                <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="0912 345 6789" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Address</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Barangay, Municipality, Province" className="h-10" />
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
              <Button type="submit" className="w-full h-10 bg-[#5b4fa8] hover:bg-[#4a3f96]">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
