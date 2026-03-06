import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// --- Contact form (public) ---

export async function submitContactForm(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  headache: string;
}) {
  return addDoc(collection(db, "contacts"), {
    ...data,
    status: "new",
    notes: "",
    createdAt: serverTimestamp(),
  });
}

// --- CRM (admin) ---

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  headache: string;
  status: string;
  notes: string;
  createdAt: Date | null;
}

export async function getContacts(): Promise<Contact[]> {
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || "",
      company: data.company || "",
      email: data.email || "",
      phone: data.phone || "",
      headache: data.headache || "",
      status: data.status || "new",
      notes: data.notes || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

export async function updateContact(
  id: string,
  fields: { status?: string; notes?: string }
) {
  return updateDoc(doc(db, "contacts", id), fields);
}

// --- Auth ---

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export { auth, db, onAuthStateChanged, type User };
