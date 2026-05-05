'use client';

/**
 * Centralized Firestore service layer for BLMC Connect.
 * All database operations go through this file.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  increment,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { AppUser } from '@/context/AppContext';

const { firestore: db } = initializeFirebase();

// ── Collection refs ────────────────────────────────────────────────────────
export const usersCol       = () => collection(db, 'users');
export const productsCol    = () => collection(db, 'products');
export const transactionsCol= () => collection(db, 'transactions');
export const announcementsCol=() => collection(db, 'announcements');
export const applicationsCol= () => collection(db, 'applications');
export const salesCol       = () => collection(db, 'pos_sales');
export const loansCol       = () => collection(db, 'loans');
export const programsCol    = () => collection(db, 'programs');

// ── Types ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt?: Timestamp;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'deposit' | 'payment' | 'debt_charge';
  description: string;
  amount: number;
  date: string;
  createdAt?: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'event' | 'info' | 'urgent';
  createdBy?: string;
  createdAt?: Timestamp;
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  occupation: string;
  contactNumber: string;
  membershipType: 'Regular' | 'Associate';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: Timestamp;
  rejectionReason?: string;
}

export interface PosSale {
  id: string;
  date: string;
  customerName: string;
  customerId?: string;
  items: number;
  payment: 'cash' | 'credit' | 'debit';
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt?: Timestamp;
}

// ── Users ──────────────────────────────────────────────────────────────────
export async function getUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
}

export function subscribeUsers(cb: (users: AppUser[]) => void): Unsubscribe {
  return onSnapshot(usersCol(), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)));
  });
}

export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

// ── Products ───────────────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(query(productsCol(), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export function subscribeProducts(cb: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(query(productsCol(), orderBy('name')), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  });
}

export async function addProduct(data: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(productsCol(), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// ── Transactions ───────────────────────────────────────────────────────────
export async function getTransactions(): Promise<Transaction[]> {
  const snap = await getDocs(query(transactionsCol(), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getMemberTransactions(memberId: string): Promise<Transaction[]> {
  const snap = await getDocs(
    query(transactionsCol(), where('memberId', '==', memberId))
  );
  const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
  txs.sort((a, b) => b.date.localeCompare(a.date));
  return txs;
}

export function subscribeMemberTransactions(memberId: string, cb: (txs: Transaction[]) => void): Unsubscribe {
  return onSnapshot(
    query(transactionsCol(), where('memberId', '==', memberId)),
    snap => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      // Sort client-side to avoid composite index requirement
      txs.sort((a, b) => b.date.localeCompare(a.date));
      cb(txs);
    }
  );
}

export function subscribeTransactions(cb: (txs: Transaction[]) => void): Unsubscribe {
  return onSnapshot(
    query(transactionsCol(), orderBy('date', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)))
  );
}

export async function addTransaction(data: Omit<Transaction, 'id'>): Promise<void> {
  const userRef = doc(db, 'users', data.memberId);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('Member not found');
    const txRef = doc(transactionsCol());
    tx.set(txRef, { ...data, createdAt: serverTimestamp() });
    if (data.type === 'deposit') {
      tx.update(userRef, { savings: increment(data.amount) });
    } else if (data.type === 'payment') {
      tx.update(userRef, { debt: increment(-data.amount) });
    } else if (data.type === 'debt_charge') {
      tx.update(userRef, { debt: increment(data.amount) });
    }
  });
}

// ── Announcements ──────────────────────────────────────────────────────────
export function subscribeAnnouncements(cb: (items: Announcement[]) => void): Unsubscribe {
  return onSnapshot(
    query(announcementsCol(), orderBy('date', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)))
  );
}

export async function addAnnouncement(data: Omit<Announcement, 'id'>): Promise<void> {
  await addDoc(announcementsCol(), { ...data, createdAt: serverTimestamp() });
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  await updateDoc(doc(db, 'announcements', id), data);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, 'announcements', id));
}

// ── Applications ───────────────────────────────────────────────────────────
export function subscribeApplications(cb: (apps: Application[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'applications') as any,
    snap => {
      const apps = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Application));
      apps.sort((a, b) => {
        const aTime = a.submittedAt?.toMillis?.() ?? 0;
        const bTime = b.submittedAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      });
      cb(apps);
    }
  );
}

export async function addApplication(data: Omit<Application, 'id'>): Promise<void> {
  await addDoc(applicationsCol(), { ...data, submittedAt: serverTimestamp() });
}

export async function updateApplication(id: string, data: Partial<Application>): Promise<void> {
  await updateDoc(doc(db, 'applications', id), data);
}

// ── POS Sales ──────────────────────────────────────────────────────────────
export function subscribeSales(cb: (sales: PosSale[]) => void): Unsubscribe {
  return onSnapshot(
    query(salesCol(), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as PosSale)))
  );
}

export async function addSale(data: Omit<PosSale, 'id'>): Promise<void> {
  await addDoc(salesCol(), { ...data, createdAt: serverTimestamp() });
}

// ── Notifications ──────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'transaction' | 'application' | 'system';
  read: boolean;
  createdAt?: Timestamp;
}

export function subscribeNotifications(userId: string, cb: (notifications: Notification[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', userId, 'notifications'),
    snap => {
      const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      notifications.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      cb(notifications);
    }
  );
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const snap = await getDocs(collection(db, 'users', userId, 'notifications'));
  const unread = snap.docs.filter(d => !d.data().read);
  await Promise.all(unread.map(d => updateDoc(d.ref, { read: true })));
}

export async function addNotification(userId: string, data: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'users', userId, 'notifications'), {
    ...data,
    userId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ── Notifications ──────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'announcement' | 'transaction' | 'application' | 'system';
  read: boolean;
  createdAt?: Timestamp;
  link?: string;
}

export function subscribeNotifications(userId: string, cb: (notifications: AppNotification[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', userId, 'notifications'),
    snap => {
      const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      notifications.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      cb(notifications);
    }
  );
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string, notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map(id =>
    updateDoc(doc(db, 'users', userId, 'notifications', id), { read: true })
  ));
}

export async function addNotification(userId: string, data: Omit<AppNotification, 'id' | 'userId'>): Promise<void> {
  await addDoc(collection(db, 'users', userId, 'notifications'), {
    ...data,
    userId,
    read: false,
    createdAt: serverTimestamp(),
  });
}
