/**
 * BLMC Firestore Collections Seed Script
 * Seeds products, announcements, and sample transactions
 *
 * Run with: npm run seed:data
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, getDocs,
  serverTimestamp, query, limit
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-1251460238-e77fe",
  appId: "1:448163062588:web:f1e6ddef0d455ebb63b439",
  apiKey: "AIzaSyBkXg5WSG_0Bxy2XXXLZJxhmDzZbs5vUtk",
  authDomain: "studio-1251460238-e77fe.firebaseapp.com",
  messagingSenderId: "448163062588"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Sign in as admin to get write access
await signInWithEmailAndPassword(auth, 'admin@blmc.local', 'admin123');
console.log('✅ Signed in as admin\n');

async function seedIfEmpty(colName, items) {
  const snap = await getDocs(query(collection(db, colName), limit(1)));
  if (!snap.empty) {
    console.log(`ℹ️  ${colName} already has data — skipping`);
    return;
  }
  for (const item of items) {
    await addDoc(collection(db, colName), { ...item, createdAt: serverTimestamp() });
  }
  console.log(`✅ Seeded ${items.length} records into ${colName}`);
}

// ── Products ──────────────────────────────────────────────────────────────
await seedIfEmpty('products', [
  { name: 'Livestock Feed A (25kg)',      description: 'High-protein feed for swine.',          price: 1250, stock: 45,  category: 'Feeds' },
  { name: 'Broiler Feed (25kg)',           description: 'Complete feed for broiler chickens.',   price: 1180, stock: 80,  category: 'Feeds' },
  { name: 'Layer Feed (11kg)',             description: 'Layer phase complete feed.',             price: 1250, stock: 55,  category: 'Feeds' },
  { name: 'Hog Feed - Grower (25kg)',      description: 'Grower phase hog feed.',                price: 1538, stock: 45,  category: 'Feeds' },
  { name: 'Hog Feed - Finisher (25kg)',    description: 'Finisher phase hog feed.',              price: 1220, stock: 35,  category: 'Feeds' },
  { name: 'Vitamin Supplement (1L)',       description: 'Liquid vitamins for poultry & swine.',  price: 500,  stock: 45,  category: 'Medicine' },
  { name: 'Antibiotic Powder (1kg)',       description: 'Broad-spectrum antibiotic.',            price: 450,  stock: 30,  category: 'Medicine' },
  { name: 'Disinfectant 5L',              description: 'Farm-grade disinfectant solution.',     price: 420,  stock: 25,  category: 'Supplies' },
  { name: 'Egg Trays (10 pcs)',            description: 'Cardboard egg trays.',                  price: 150,  stock: 500, category: 'Supplies' },
  { name: 'Rice (50kg)',                   description: 'Premium white rice sack.',              price: 2293, stock: 20,  category: 'Food' },
  { name: 'Layer Chicks (100 pcs)',        description: 'Day-old layer chicks.',                 price: 998,  stock: 150, category: 'Livestock' },
  { name: 'Broiler Starter Chicks (100)', description: 'Day-old broiler starter chicks.',       price: 820,  stock: 200, category: 'Livestock' },
]);

// ── Announcements ─────────────────────────────────────────────────────────
await seedIfEmpty('announcements', [
  {
    title: 'General Assembly 2026',
    content: 'Join us for the annual general assembly this coming Sunday at the Municipal Hall. All members are required to attend.',
    date: '2026-05-15',
    type: 'event',
  },
  {
    title: 'New Agricultural Loan Program',
    content: 'We are launching a new agricultural loan program with lower interest rates for livestock production. Apply now at the cooperative office.',
    date: '2026-05-10',
    type: 'info',
  },
  {
    title: 'Office Closure — Independence Day',
    content: 'The cooperative office will be closed on June 12 for Independence Day. Regular operations resume on June 13.',
    date: '2026-06-12',
    type: 'urgent',
  },
]);

// ── Programs ──────────────────────────────────────────────────────────────
await seedIfEmpty('programs', [
  {
    title: 'Livestock Management Training',
    description: 'Hands-on training on modern livestock management practices for all members.',
    category: 'Training',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    status: 'upcoming',
  },
  {
    title: 'Feeds & Nutrition Seminar',
    description: 'Learn about proper nutrition and feeding programs for pigs and poultry.',
    category: 'Seminar',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    status: 'active',
  },
]);

console.log('\n✨ Collection seeding complete!\n');
process.exit(0);
