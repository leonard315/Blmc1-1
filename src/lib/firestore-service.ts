'use client';

import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  runTransaction, increment, Timestamp, type Unsubscribe,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { AppUser } from '@/context/AppContext';

// Lazy db getter — safe for SSR
function db() {
  return initializeFirebase().firestore;
}

// ── Collection helpers ─────────────────────────────────────────────────────
const usersCol        = () => collection(db(), 'users');
const productsCol     = () => collection(db(), 'products');
const transactionsCol = () => collection(db(), 'transactions');
const announcementsCol= () => collection(db(), 'announcements');
const applicationsCol = () => collection(db(), 'applications');
const salesCol        = () => collection(db(), 'pos_sales');

// ── Types ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string; name: string; description: string;
  price: number; stock: number; category: string; createdAt?: Timestamp;
}
export interface Transaction {
  id: string; memberId: string; memberName: string;
  type: 'deposit' | 'payment' | 'debt_charge';
  description: string; amount: number; date: string; createdAt?: Timestamp;
}
export interface Announcement {
  id: string; title: string; content: string; date: string;
  type: 'event' | 'info' | 'urgent'; createdBy?: string; createdAt?: Timestamp;
}
export interface Application {
  id: string; firstName: string; lastName: string; email: string;
  address: string; occupation: string; contactNumber: string;
  membershipType: 'Regular' | 'Associate';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: Timestamp; rejectionReason?: string;
}
export interface PosSale {
  id: string; date: string; customerName: string; customerId?: string;
  items: number; payment: 'cash' | 'credit' | 'debit';
  total: number; status: 'paid' | 'pending' | 'cancelled'; createdAt?: Timestamp;
}
export interface AppNotification {
  id: string; userId: string; title: string; message: string;
  type: 'announcement' | 'transaction' | 'application' | 'system';
  read: boolean; createdAt?: Timestamp; link?: string;
}

// ── Users ──────────────────────────────────────────────────────────────────
export async function getUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
}
export function subscribeUsers(cb: (users: AppUser[]) => void): Unsubscribe {
  return onSnapshot(usersCol(), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))));
}
export async function addUser(data: Omit<AppUser, 'id'>): Promise<string> {
  const ref = await addDoc(usersCol(), { ...data });
  return ref.id;
}
export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db(), 'users', uid), data as Record<string, unknown>);
}

// ── Products ───────────────────────────────────────────────────────────────
export function subscribeProducts(cb: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(query(productsCol(), orderBy('name')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))));
}
export async function addProduct(data: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(productsCol(), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}
export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db(), 'products', id), data as Record<string, unknown>);
}
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db(), 'products', id));
}

// ── Transactions ───────────────────────────────────────────────────────────
export function subscribeMemberTransactions(memberId: string, cb: (txs: Transaction[]) => void): Unsubscribe {
  return onSnapshot(query(transactionsCol(), where('memberId', '==', memberId)), snap => {
    const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    txs.sort((a, b) => b.date.localeCompare(a.date));
    cb(txs);
  });
}
export function subscribeTransactions(cb: (txs: Transaction[]) => void): Unsubscribe {
  return onSnapshot(query(transactionsCol(), orderBy('date', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction))));
}
export async function addTransaction(data: Omit<Transaction, 'id'>): Promise<void> {
  const userRef = doc(db(), 'users', data.memberId);
  await runTransaction(db(), async tx => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('Member not found');
    const txRef = doc(transactionsCol());
    tx.set(txRef, { ...data, createdAt: serverTimestamp() });
    if (data.type === 'deposit') tx.update(userRef, { savings: increment(data.amount) });
    else if (data.type === 'payment') tx.update(userRef, { debt: increment(-data.amount) });
    else if (data.type === 'debt_charge') tx.update(userRef, { debt: increment(data.amount) });
  });
}

// ── Announcements ──────────────────────────────────────────────────────────
export function subscribeAnnouncements(cb: (items: Announcement[]) => void): Unsubscribe {
  return onSnapshot(query(announcementsCol(), orderBy('date', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement))));
}
export async function addAnnouncement(data: Omit<Announcement, 'id'>): Promise<void> {
  await addDoc(announcementsCol(), { ...data, createdAt: serverTimestamp() });
}
export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  await updateDoc(doc(db(), 'announcements', id), data as Record<string, unknown>);
}
export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db(), 'announcements', id));
}

// ── Applications ───────────────────────────────────────────────────────────
export function subscribeApplications(cb: (apps: Application[]) => void): Unsubscribe {
  return onSnapshot(applicationsCol(), snap => {
    const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
    apps.sort((a, b) => (a.submittedAt?.toMillis?.() ?? 0) - (b.submittedAt?.toMillis?.() ?? 0));
    cb(apps);
  });
}
export async function addApplication(data: Omit<Application, 'id'>): Promise<void> {
  await addDoc(applicationsCol(), { ...data, submittedAt: serverTimestamp() });
}
export async function updateApplication(id: string, data: Partial<Application>): Promise<void> {
  await updateDoc(doc(db(), 'applications', id), data as Record<string, unknown>);
}

// ── POS Sales ──────────────────────────────────────────────────────────────
export function subscribeSales(cb: (sales: PosSale[]) => void): Unsubscribe {
  return onSnapshot(query(salesCol(), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as PosSale))));
}
export async function addSale(data: Omit<PosSale, 'id'>): Promise<void> {
  await addDoc(salesCol(), { ...data, createdAt: serverTimestamp() });
}

// ── Notifications ──────────────────────────────────────────────────────────
export function subscribeNotifications(userId: string, cb: (notifications: AppNotification[]) => void): Unsubscribe {
  return onSnapshot(collection(db(), 'users', userId, 'notifications'), snap => {
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
    notifications.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    cb(notifications);
  });
}
export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db(), 'users', userId, 'notifications', notificationId), { read: true });
}
export async function markAllNotificationsRead(userId: string, notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map(id =>
    updateDoc(doc(db(), 'users', userId, 'notifications', id), { read: true })
  ));
}
export async function addNotification(userId: string, data: Omit<AppNotification, 'id' | 'userId'>): Promise<void> {
  await addDoc(collection(db(), 'users', userId, 'notifications'), {
    ...data, userId, read: false, createdAt: serverTimestamp(),
  });
}
