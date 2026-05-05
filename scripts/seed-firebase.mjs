/**
 * BLMC Firebase Seed Script
 * Creates default users in Firebase Auth + Firestore
 *
 * Run with: npm run seed
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-1251460238-e77fe",
  appId: "1:448163062588:web:f1e6ddef0d455ebb63b439",
  apiKey: "AIzaSyBkXg5WSG_0Bxy2XXXLZJxhmDzZbs5vUtk",
  authDomain: "studio-1251460238-e77fe.firebaseapp.com",
  messagingSenderId: "448163062588"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SEED_USERS = [
  {
    email: 'admin@blmc.local',
    password: 'admin123',
    profile: {
      name: 'Admin User',
      role: 'administrator',
      status: 'active',
      savings: 50000,
      debt: 0,
      joinedDate: '2023-01-01',
    },
  },
  {
    email: 'staff@blmc.com',
    password: 'staff123',
    profile: {
      name: 'Staff Maria',
      role: 'staff',
      status: 'active',
      savings: 12000,
      debt: 500,
      joinedDate: '2023-03-15',
    },
  },
  {
    email: 'member@blmc.com',
    password: 'member123',
    profile: {
      name: 'Juan Dela Cruz',
      role: 'member',
      status: 'active',
      savings: 8500,
      debt: 2400,
      joinedDate: '2023-06-20',
    },
  },
];

async function seedUser(userData) {
  const { email, password, profile } = userData;
  let uid;

  try {
    // Try to create the user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    console.log(`✅ Created auth user: ${email}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // User exists — sign in to get UID
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        uid = credential.user.uid;
        console.log(`ℹ️  Auth user already exists: ${email}`);
      } catch (signInError) {
        console.error(`❌ Could not sign in as ${email}:`, signInError.message);
        return;
      }
    } else {
      console.error(`❌ Error creating ${email}:`, error.message);
      return;
    }
  }

  // Write Firestore profile
  try {
    const userRef = doc(db, 'users', uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        ...profile,
        email,
        id: uid,
      });
      console.log(`✅ Created Firestore profile for: ${email}`);
    } else {
      console.log(`ℹ️  Firestore profile already exists for: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Firestore error for ${email}:`, error.message);
  }
}

async function main() {
  console.log('\n🌱 BLMC Firebase Seed Script\n');
  console.log('Seeding users...\n');

  for (const user of SEED_USERS) {
    await seedUser(user);
  }

  console.log('\n✨ Seeding complete!\n');
  console.log('Accounts created:');
  console.log('  Admin:  admin@blmc.local  /  admin123');
  console.log('  Staff:  staff@blmc.com    /  staff123');
  console.log('  Member: member@blmc.com   /  member123');
  console.log('\nYou can now log in at http://localhost:9002/login\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
