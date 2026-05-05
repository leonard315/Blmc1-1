"use client";

import React, { useState, useEffect } from 'react';
import { subscribeProducts, subscribeUsers, addSale, type Product } from '@/lib/firestore-service';
import type { AppUser } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Package, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem { id: string; name: string; price: number; qty: number; }

export default function NewSalePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<AppUser | null>(null);
  const [walkIn, setWalkIn] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<'cash'|'credit'|'debit'>('cash');
  const [showMemberDrop, setShowMemberDrop] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const u1 = subscribeProducts(p => setProducts(p));
    const u2 = subscribeUsers(u => setMembers(u.filter(m => m.role === ROLES.MEMBER || m.role === ROLES.STAFF || m.role === ROLES.ADMIN)));
    return () => { u1(); u2(); };
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, val: number) => {
    if (val < 1) return;
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: val } : c));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const total    = Math.max(0, subtotal - discount);

  const handleComplete = async () => {
    if (cart.length === 0) { toast({ variant: 'destructive', title: 'Cart is empty' }); return; }
    setCompleting(true);
    const customerName = selectedMember?.name || walkIn || 'Walk-in Customer';
    await addSale({
      date: new Date().toISOString().slice(0, 10),
      customerName,
      customerId: selectedMember?.id,
      items: cart.reduce((s, c) => s + c.qty, 0),
      payment,
      total,
      status: 'paid',
    });
    toast({ title: 'Sale Complete!', description: `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })} — ${payment}` });
    setCart([]); setSelectedMember(null); setMemberSearch(''); setWalkIn(''); setDiscount(0);
    setCompleting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">New Sale</h1>
        <p className="text-xs text-muted-foreground">Select member and add products. Complete the sale below.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 h-9 bg-white" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Products */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Products</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-xl border p-3 text-left hover:border-blue-400 hover:shadow-md transition-all group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-blue-600">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.stock} left</p>
                <p className="text-sm font-bold text-blue-600 mt-1">₱{p.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="text-sm font-semibold">CUSTOMER</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={memberSearch} onChange={e => { setMemberSearch(e.target.value); setShowMemberDrop(true); }} onFocus={() => setShowMemberDrop(true)} placeholder="Search or select member..." className="pl-8 h-8 text-xs" />
              {showMemberDrop && memberSearch && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {filteredMembers.map(m => (
                    <button key={m.id} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50" onClick={() => { setSelectedMember(m); setMemberSearch(m.name); setShowMemberDrop(false); }}>
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input value={walkIn} onChange={e => setWalkIn(e.target.value)} placeholder="Walk-in customer name (optional)" className="h-8 text-xs" />
          </div>

          {/* Cart */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">CART</h3>
              {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear</button>}
            </div>
            {cart.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No items added yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-muted-foreground">₱{item.price.toLocaleString()}</p>
                    </div>
                    <input type="number" min={1} value={item.qty} onChange={e => updateQty(item.id, parseInt(e.target.value) || 1)} className="w-12 h-6 border rounded text-center text-xs" />
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-20 h-6 border rounded text-right text-xs px-2" />
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-2">
                <span>Total</span><span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">PAYMENT METHOD</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['cash','credit','debit'] as const).map(m => (
                <button key={m} onClick={() => setPayment(m)} className={`h-9 rounded-lg text-xs font-semibold border-2 transition-colors capitalize ${payment === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-muted-foreground hover:border-gray-300'}`}>
                  {m === 'cash' ? '💵' : m === 'credit' ? '💳' : '🏦'} {m}
                </button>
              ))}
            </div>
            <Button onClick={handleComplete} disabled={completing} className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-semibold text-sm">
              {completing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
