import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { env } from './env.js';

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY,
};

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${env.FIREBASE_PROJECT_ID}.appspot.com`,
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
