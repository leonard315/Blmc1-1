"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Plus, Trash2, Edit2, X, Loader2, Save, ImagePlus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { ROLES } from '@/lib/mock-data';
import {
  subscribeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeProducts(p => { setProducts(p); setLoading(false); });
    return () => unsub();
  }, []);

  const isStaff = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.STAFF;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName(''); setDescription(''); setPrice(''); setStock(''); setCategory(''); setImageUrl('');
    setEditProduct(null); setShowForm(false);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name); setDescription(p.description);
    setPrice(String(p.price)); setStock(String(p.stock)); setCategory(p.category);
    setImageUrl(p.imageUrl ?? '');
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast({ title: 'Image too large', description: 'Please choose an image under 500 KB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { name, description, price: Number(price), stock: Number(stock), category, imageUrl };
    if (editProduct) {
      await updateProduct(editProduct.id, data);
      toast({ title: 'Product Updated', description: name });
    } else {
      await addProduct(data);
      toast({ title: 'Product Added', description: name });
    }
    resetForm();
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteProduct(id);
    toast({ title: 'Product Deleted', description: name });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Inventory</h1>
            <p className="text-muted-foreground">Manage and browse cooperative products.</p>
          </div>
          {isStaff && (
            <Button className="shadow-lg" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          )}
        </div>

        {/* Add/Edit form */}
        {showForm && isStaff && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{editProduct ? 'Edit Product' : 'New Product'}</CardTitle>
              <button onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Category</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Price ₱</Label>
                  <Input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Stock</Label>
                  <Input value={stock} onChange={e => setStock(e.target.value)} type="number" min="0" className="h-9" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm">Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9" />
                </div>

                {/* Image upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm">Product Image <span className="text-muted-foreground text-xs">(max 500 KB)</span></Label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30 shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <ImagePlus className="w-6 h-6 opacity-40" />
                          <span className="text-[10px]">Click to add</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 justify-center pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
                        {imageUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {imageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-500 hover:text-red-600"
                          onClick={() => { setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" /> Remove
                        </Button>
                      )}
                      <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" disabled={saving} className="h-9">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {editProduct ? 'Update' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10 h-11 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Package className="w-10 h-10 opacity-30 mx-auto mb-2" />
                <p className="text-sm">No products found.</p>
              </div>
            ) : filtered.map(product => (
              <Card key={product.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all border-none group bg-white/50">
                <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                  )}
                  <Badge className="absolute top-3 right-3 bg-primary/90">{product.category}</Badge>
                  {product.stock < 10 && (
                    <Badge variant="destructive" className="absolute top-3 left-3 text-[10px]">Low Stock</Badge>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <span className="font-bold text-emerald-600">₱{product.price.toLocaleString()}</span>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Stock: <span className={product.stock < 10 ? 'text-destructive font-bold' : 'text-primary'}>{product.stock} units</span>
                  </div>
                </CardContent>
                {isStaff && (
                  <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(product)}>
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
