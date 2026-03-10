import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

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
const storage = getStorage(app);

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
  githubRepoUrl: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

function mapContact(d: { id: string; data: () => Record<string, unknown> }): Contact {
  const data = d.data();
  return {
    id: d.id,
    name: (data.name as string) || "",
    company: (data.company as string) || "",
    email: (data.email as string) || "",
    phone: (data.phone as string) || "",
    headache: (data.headache as string) || "",
    stage: (data.stage as string) || (data.status as string) || "new_lead",
    assignee: (data.assignee as string) || "",
    notes: (data.notes as string) || "",
    githubRepoUrl: (data.githubRepoUrl as string) || "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    deletedAt: data.deletedAt instanceof Timestamp ? data.deletedAt.toDate() : null,
  };
}

export async function getContacts(): Promise<Contact[]> {
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(mapContact)
    .filter((c) => !c.deletedAt);
}

export async function getDeletedContacts(): Promise<Contact[]> {
  const q = query(
    collection(db, "contacts"),
    where("deletedAt", "!=", null),
    orderBy("deletedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapContact);
}

export async function softDeleteContact(id: string, actorName?: string) {
  await updateDoc(doc(db, "contacts", id), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (actorName) {
    await addActivity(id, {
      type: "stage_change",
      description: "Moved to Deleted",
      user: actorName,
    });
  }
}

export async function restoreContact(id: string, actorName?: string) {
  await updateDoc(doc(db, "contacts", id), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
  if (actorName) {
    await addActivity(id, {
      type: "stage_change",
      description: "Restored from Deleted",
      user: actorName,
    });
  }
}

export async function permanentlyDeleteContact(id: string) {
  // Delete subcollections first
  const activitySnap = await getDocs(collection(db, "contacts", id, "activity"));
  for (const d of activitySnap.docs) {
    await deleteDoc(d.ref);
  }
  const docsSnap = await getDocs(collection(db, "contacts", id, "documents"));
  for (const d of docsSnap.docs) {
    await deleteDoc(d.ref);
  }
  await deleteDoc(doc(db, "contacts", id));
}

export async function updateContact(
  id: string,
  fields: { stage?: string; assignee?: string; notes?: string; githubRepoUrl?: string },
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
  type: "problem_definition" | "solution_one_pager" | "development_plan" | "meeting_transcript" | "solution_overview" | "getting_started" | "other";
  content: string;
  fileUrl: string;
  fileName: string;
  status: "draft" | "review" | "approved" | "revision_requested" | "sent";
  generatedBy: "ai" | "manual";
  version: number;
  projectId: string;
  adminNotes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface DocumentRevision {
  id: string;
  version: number;
  content: string;
  title: string;
  status: string;
  editedBy: string;
  createdAt: Date | null;
}

export async function addClientDocument(
  contactId: string,
  data: {
    title: string;
    type: ClientDocument["type"];
    content?: string;
    fileUrl?: string;
    fileName?: string;
    status?: ClientDocument["status"];
    generatedBy?: ClientDocument["generatedBy"];
    projectId?: string;
  }
) {
  return addDoc(collection(db, "contacts", contactId, "documents"), {
    title: data.title,
    type: data.type,
    content: data.content || "",
    fileUrl: data.fileUrl || "",
    fileName: data.fileName || "",
    status: data.status || "draft",
    generatedBy: data.generatedBy || "manual",
    projectId: data.projectId || "",
    version: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function uploadDocumentFile(
  contactId: string,
  file: File
): Promise<{ url: string; name: string }> {
  const path = `contacts/${contactId}/documents/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, name: file.name };
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
      fileUrl: data.fileUrl || "",
      fileName: data.fileName || "",
      status: data.status || "draft",
      generatedBy: data.generatedBy || "manual",
      version: (data.version as number) || 1,
      projectId: (data.projectId as string) || "",
      adminNotes: (data.adminNotes as string) || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function updateClientDocument(
  contactId: string,
  documentId: string,
  fields: { content?: string; status?: string; title?: string; adminNotes?: string }
) {
  return updateDoc(doc(db, "contacts", contactId, "documents", documentId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// --- Document revisions ---

export async function saveRevisionAndUpdate(
  contactId: string,
  documentId: string,
  currentDoc: { content: string; title: string; status: string; version: number },
  newFields: { content?: string; title?: string; status?: string },
  actorName: string
) {
  // Save the current state as a revision
  await addDoc(
    collection(db, "contacts", contactId, "documents", documentId, "revisions"),
    {
      version: currentDoc.version,
      content: currentDoc.content,
      title: currentDoc.title,
      status: currentDoc.status,
      editedBy: actorName,
      createdAt: serverTimestamp(),
    }
  );

  // Update the document with new content and bump version
  const nextVersion = currentDoc.version + 1;
  await updateDoc(doc(db, "contacts", contactId, "documents", documentId), {
    ...newFields,
    version: nextVersion,
    updatedAt: serverTimestamp(),
  });

  return nextVersion;
}

export async function getDocumentRevisions(
  contactId: string,
  documentId: string
): Promise<DocumentRevision[]> {
  const q = query(
    collection(db, "contacts", contactId, "documents", documentId, "revisions"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      version: (data.version as number) || 1,
      content: (data.content as string) || "",
      title: (data.title as string) || "",
      status: (data.status as string) || "",
      editedBy: (data.editedBy as string) || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

// --- Review tokens ---

export interface ReviewToken {
  id: string;
  contactId: string;
  contactName: string;
  companyName: string;
  contactEmail: string;
  projectId: string;
  reviewType: "project_docs" | "solution_assets";
  createdAt: Date | null;
  expiresAt: Date | null;
  createdBy: string;
  status: "active" | "completed" | "expired";
}

export interface ChangeRequest {
  id: string;
  contactId: string;
  projectId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  author: string;
  reviewTokenId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface DocumentComment {
  id: string;
  author: string;
  content: string;
  reviewTokenId: string;
  createdAt: Date | null;
}

function mapReviewToken(d: { id: string; data: () => Record<string, unknown> }): ReviewToken {
  const data = d.data();
  return {
    id: d.id,
    contactId: (data.contactId as string) || "",
    contactName: (data.contactName as string) || "",
    companyName: (data.companyName as string) || "",
    contactEmail: (data.contactEmail as string) || "",
    projectId: (data.projectId as string) || "",
    reviewType: (data.reviewType as ReviewToken["reviewType"]) || "project_docs",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : null,
    createdBy: (data.createdBy as string) || "",
    status: (data.status as ReviewToken["status"]) || "active",
  };
}

export async function createReviewToken(data: {
  contactId: string;
  contactName: string;
  companyName: string;
  contactEmail: string;
  createdBy: string;
  projectId?: string;
  reviewType?: "project_docs" | "solution_assets";
}): Promise<string> {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const { setDoc } = await import("firebase/firestore");
  await setDoc(doc(db, "reviewTokens", tokenId), {
    contactId: data.contactId,
    contactName: data.contactName,
    companyName: data.companyName,
    contactEmail: data.contactEmail,
    createdBy: data.createdBy,
    projectId: data.projectId || "",
    reviewType: data.reviewType || "project_docs",
    status: "active",
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return tokenId;
}

export async function getReviewToken(tokenId: string): Promise<ReviewToken | null> {
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "reviewTokens", tokenId));
  if (!snap.exists()) return null;

  const token = mapReviewToken({ id: snap.id, data: () => snap.data() as Record<string, unknown> });

  // Check expiry
  if (token.expiresAt && token.expiresAt < new Date()) return null;
  if (token.status !== "active") return null;

  return token;
}

export async function completeReviewToken(tokenId: string) {
  return updateDoc(doc(db, "reviewTokens", tokenId), {
    status: "completed",
  });
}

export async function addDocumentComment(
  contactId: string,
  docId: string,
  data: { author: string; content: string; reviewTokenId: string }
) {
  return addDoc(
    collection(db, "contacts", contactId, "documents", docId, "comments"),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );
}

export async function getDocumentComments(
  contactId: string,
  docId: string
): Promise<DocumentComment[]> {
  const q = query(
    collection(db, "contacts", contactId, "documents", docId, "comments"),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      author: (data.author as string) || "",
      content: (data.content as string) || "",
      reviewTokenId: (data.reviewTokenId as string) || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

// --- Change Requests ---

export async function addChangeRequest(
  contactId: string,
  projectId: string,
  data: {
    title: string;
    description: string;
    priority: ChangeRequest["priority"];
    author: string;
    reviewTokenId: string;
  }
) {
  return addDoc(collection(db, "contacts", contactId, "changeRequests"), {
    ...data,
    projectId,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getChangeRequests(
  contactId: string,
  projectId?: string
): Promise<ChangeRequest[]> {
  let q;
  if (projectId) {
    q = query(
      collection(db, "contacts", contactId, "changeRequests"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      collection(db, "contacts", contactId, "changeRequests"),
      orderBy("createdAt", "desc")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      contactId: (data.contactId as string) || contactId,
      projectId: (data.projectId as string) || "",
      title: (data.title as string) || "",
      description: (data.description as string) || "",
      priority: (data.priority as ChangeRequest["priority"]) || "medium",
      status: (data.status as ChangeRequest["status"]) || "open",
      author: (data.author as string) || "",
      reviewTokenId: (data.reviewTokenId as string) || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function updateChangeRequest(
  contactId: string,
  requestId: string,
  fields: { status?: ChangeRequest["status"]; priority?: ChangeRequest["priority"] }
) {
  return updateDoc(doc(db, "contacts", contactId, "changeRequests", requestId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// --- Projects ---

export interface Project {
  id: string;
  contactId: string;
  contactName: string;
  companyName: string;
  name: string;
  repoName: string;
  repoUrl: string;
  status: "active" | "completed" | "on_hold";
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function addProject(
  contactId: string,
  data: {
    contactName: string;
    companyName: string;
    name: string;
    repoName?: string;
    repoUrl?: string;
  }
) {
  return addDoc(collection(db, "projects"), {
    contactId,
    contactName: data.contactName,
    companyName: data.companyName,
    name: data.name,
    repoName: data.repoName || "",
    repoUrl: data.repoUrl || "",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getProjects(): Promise<Project[]> {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      contactId: (data.contactId as string) || "",
      contactName: (data.contactName as string) || "",
      companyName: (data.companyName as string) || "",
      name: (data.name as string) || "",
      repoName: (data.repoName as string) || "",
      repoUrl: (data.repoUrl as string) || "",
      status: (data.status as Project["status"]) || "active",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function getProjectsForContact(contactId: string): Promise<Project[]> {
  const q = query(
    collection(db, "projects"),
    where("contactId", "==", contactId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      contactId: (data.contactId as string) || "",
      contactName: (data.contactName as string) || "",
      companyName: (data.companyName as string) || "",
      name: (data.name as string) || "",
      repoName: (data.repoName as string) || "",
      repoUrl: (data.repoUrl as string) || "",
      status: (data.status as Project["status"]) || "active",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    };
  });
}

export async function tagDocumentsWithProject(
  contactId: string,
  projectId: string,
  documentIds: string[]
) {
  for (const docId of documentIds) {
    await updateDoc(doc(db, "contacts", contactId, "documents", docId), {
      projectId,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function updateProject(
  projectId: string,
  fields: { status?: Project["status"]; name?: string; repoName?: string; repoUrl?: string }
) {
  return updateDoc(doc(db, "projects", projectId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export { auth, db, onAuthStateChanged, type User };
