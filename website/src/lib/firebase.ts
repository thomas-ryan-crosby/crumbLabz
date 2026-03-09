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

// --- Pipeline stages (maps to the 8-phase client process) ---

export const PIPELINE_STAGES = [
  { value: "new_lead", label: "New Lead", color: "bg-accent/10 text-accent" },
  { value: "discovery", label: "Discovery", color: "bg-blue-500/10 text-blue-600" },
  { value: "problem_definition", label: "Problem Definition", color: "bg-indigo-500/10 text-indigo-600" },
  { value: "solution_design", label: "Solution Design", color: "bg-violet-500/10 text-violet-600" },
  { value: "solution_review", label: "Solution Review", color: "bg-purple-500/10 text-purple-600" },
  { value: "development", label: "Development", color: "bg-emerald-500/10 text-emerald-600" },
  { value: "mvp_presentation", label: "MVP Presentation", color: "bg-teal-500/10 text-teal-600" },
  { value: "active_client", label: "Active Client", color: "bg-green-600/10 text-green-700" },
  { value: "closed_lost", label: "Closed / Lost", color: "bg-charcoal/10 text-charcoal" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["value"];

// --- Team members ---

export const TEAM_MEMBERS = [
  { id: "ryan", name: "Ryan Crosby", email: "thomas.ryan.crosby@gmail.com", initials: "RC" },
  { id: "josh", name: "Josh Meister", email: "jpmeister95@gmail.com", initials: "JM" },
] as const;

export type TeamMemberId = (typeof TEAM_MEMBERS)[number]["id"];

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
    stage: "new_lead",
    assignee: "",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// --- CRM (admin) ---

export interface Activity {
  id: string;
  type: "stage_change" | "assignment" | "note" | "created";
  description: string;
  user: string;
  timestamp: Date | null;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  headache: string;
  stage: string;
  assignee: string;
  notes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
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
      stage: data.stage || data.status || "new_lead",
      assignee: data.assignee || "",
      notes: data.notes || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function updateContact(
  id: string,
  fields: { stage?: string; assignee?: string; notes?: string },
  actorName?: string
) {
  const updates: Record<string, unknown> = {
    ...fields,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "contacts", id), updates);

  // Log activity
  if (actorName) {
    if (fields.stage) {
      const stageLabel = PIPELINE_STAGES.find((s) => s.value === fields.stage)?.label || fields.stage;
      await addActivity(id, {
        type: "stage_change",
        description: `Moved to ${stageLabel}`,
        user: actorName,
      });
    }
    if (fields.assignee !== undefined) {
      const memberName = TEAM_MEMBERS.find((m) => m.id === fields.assignee)?.name || "Unassigned";
      await addActivity(id, {
        type: "assignment",
        description: `Assigned to ${memberName}`,
        user: actorName,
      });
    }
    if (fields.notes !== undefined) {
      await addActivity(id, {
        type: "note",
        description: "Updated notes",
        user: actorName,
      });
    }
  }
}

// --- Activity log ---

async function addActivity(
  contactId: string,
  data: { type: string; description: string; user: string }
) {
  return addDoc(collection(db, "contacts", contactId, "activity"), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function getActivities(contactId: string): Promise<Activity[]> {
  const q = query(
    collection(db, "contacts", contactId, "activity"),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type || "note",
      description: data.description || "",
      user: data.user || "",
      timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : null,
    };
  });
}

// --- Auth ---

export function getCurrentTeamMember(user: User | null) {
  if (!user?.email) return null;
  return TEAM_MEMBERS.find((m) => m.email === user.email) || null;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

// --- Client documents ---

export interface ClientDocument {
  id: string;
  title: string;
  type: "problem_definition" | "solution_one_pager" | "development_plan" | "meeting_transcript" | "other";
  content: string;
  status: "draft" | "review" | "approved" | "sent";
  generatedBy: "ai" | "manual";
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function addClientDocument(
  contactId: string,
  data: {
    title: string;
    type: ClientDocument["type"];
    content: string;
    status?: ClientDocument["status"];
    generatedBy?: ClientDocument["generatedBy"];
  }
) {
  return addDoc(collection(db, "contacts", contactId, "documents"), {
    title: data.title,
    type: data.type,
    content: data.content,
    status: data.status || "draft",
    generatedBy: data.generatedBy || "manual",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getClientDocuments(contactId: string): Promise<ClientDocument[]> {
  const q = query(
    collection(db, "contacts", contactId, "documents"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      type: data.type || "other",
      content: data.content || "",
      status: data.status || "draft",
      generatedBy: data.generatedBy || "manual",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function updateClientDocument(
  contactId: string,
  documentId: string,
  fields: { content?: string; status?: string; title?: string }
) {
  return updateDoc(doc(db, "contacts", contactId, "documents", documentId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export { auth, db, onAuthStateChanged, type User };
