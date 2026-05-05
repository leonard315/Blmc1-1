/**
 * Reset passwords for all BLMC accounts
 * Run with: node scripts/reset-passwords.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-1251460238-e77fe",
  appId: "1:448163062588:web:f1e6ddef0d455ebb63b439",
  apiKey: "AIzaSyBkXg5WSG_0Bxy2XXXLZJxhmDzZbs5vUtk",
  authDomain: "studio-1251460238-e77fe.firebaseapp.com",
  messagingSenderId: "448163062588"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

const accounts = [
  { email: 'admin@blmc.local',  newPassword: 'admin123' },
  { email: 'staff@blmc.com',    newPassword: 'staff123' },
  { email: 'member@blmc.com',   newPassword: 'member123' },
];

// We need the current password to update — try common ones
const tryPasswords = ['admin123', 'staff123', 'member123', 'password123', 'blmc2024', 'blmc2025'];

console.log('\n🔑 BLMC Password Reset\n');

for (const account of accounts) {
  let signed = false;
  for (const pwd of tryPasswords) {
    try {
      const cred = await signInWithEmailAndPassword(auth, account.email, pwd);
      if (pwd !== account.newPassword) {
        await updatePassword(cred.user, account.newPassword);
        console.log(`✅ Reset password for ${account.email} → ${account.newPassword}`);
      } else {
        console.log(`ℹ️  Password already correct for ${account.email}`);
      }
      signed = true;
      break;
    } catch {}
  }
  if (!signed) {
    console.log(`❌ Could not sign in as ${account.email} — try resetting manually in Firebase Console`);
  }
}

console.log('\n✨ Done!\n');
console.log('Credentials:');
console.log('  Admin:  admin@blmc.local  /  admin123');
console.log('  Staff:  staff@blmc.com    /  staff123');
console.log('  Member: member@blmc.com   /  member123\n');
process.exit(0);
