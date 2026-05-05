/**
 * Seeds test notifications for all users
 * Run with: node scripts/seed-notifications.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

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

await signInWithEmailAndPassword(auth, 'admin@blmc.local', 'admin123');
console.log('✅ Signed in\n');

// Get all users
const usersSnap = await getDocs(collection(db, 'users'));
const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

const notificationsPerUser = [
  {
    title: 'Welcome to BLMC Connect!',
    message: 'Your account has been set up successfully. Explore your dashboard to get started.',
    type: 'system',
    read: false,
    link: '/dashboard',
  },
  {
    title: 'New Announcement: General Assembly 2026',
    message: 'Join us for the annual general assembly this coming Sunday at the Municipal Hall.',
    type: 'announcement',
    read: false,
    link: '/announcements',
  },
  {
    title: 'New Loan Program Available',
    message: 'We are launching a new agricultural loan program with lower interest rates.',
    type: 'announcement',
    read: true,
    link: '/loans',
  },
];

for (const user of users) {
  for (const notif of notificationsPerUser) {
    await addDoc(collection(db, 'users', user.id, 'notifications'), {
      ...notif,
      userId: user.id,
      createdAt: serverTimestamp(),
    });
  }
  console.log(`✅ Seeded notifications for: ${user.name || user.email}`);
}

console.log('\n✨ Notification seeding complete!\n');
process.exit(0);
