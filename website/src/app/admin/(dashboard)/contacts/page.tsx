"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getContacts,
  getDeletedContacts,
  updateContact,
  softDeleteContact,
  restoreContact,
  permanentlyDeleteContact,
  getActivities,
  getClientDocuments,
  addClientDocument,
  uploadDocumentFile,
  updateClientDocument,
  saveRevisionAndUpdate,
  getDocumentRevisions,
  getCurrentTeamMember,
  PIPELINE_STAGES,
  TEAM_MEMBERS,
  addProject,
  updateProject,
  getProjectsForContact,
  createReviewToken,
  getDocumentComments,
  tagDocumentsWithProject,
  type Contact,
  type Activity,
  type ClientDocument,
  type DocumentRevision,
  type DocumentComment,
  type Project,
} from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";

export default function ContactsPage() {
  const { user } = useAuth();
  const currentMember = getCurrentTeamMember(user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deletedContacts, setDeletedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [filterStage, setFilterStage] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const loadContacts = useCallback(async () => {
    const [data, deleted] = await Promise.all([getContacts(), getDeletedContacts()]);
    setContacts(data);
    setDeletedContacts(deleted);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filtered = contacts.filter((c) => {
    if (filterStage !== "all" && c.stage !== filterStage) return false;
    if (filterAssignee === "unassigned" && c.assignee) return false;
    if (filterAssignee !== "all" && filterAssignee !== "unassigned" && c.assignee !== filterAssignee) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.headache.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Contact list */}
      <div
        className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[480px] border-r border-border bg-white`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{showDeleted ? "Deleted Contacts" : "Contacts"}</h1>
            <button
              onClick={() => { setShowDeleted(!showDeleted); setSelected(null); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                showDeleted
                  ? "bg-red-500/10 text-red-600"
                  : "bg-neutral text-muted hover:bg-border"
              }`}
            >
              {showDeleted ? "Back to Contacts" : `Deleted (${deletedContacts.length})`}
            </button>
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />

          {!showDeleted && (
            <>
              {/* Stage filters */}
              <div className="flex gap-1.5 flex-wrap">
                <FilterChip
                  active={filterStage === "all"}
                  onClick={() => setFilterStage("all")}
                >
                  All ({contacts.length})
                </FilterChip>
                {PIPELINE_STAGES.map((s) => {
                  const count = contacts.filter((c) => c.stage === s.value).length;
                  if (count === 0) return null;
                  return (
                    <FilterChip
                      key={s.value}
                      active={filterStage === s.value}
                      onClick={() => setFilterStage(s.value)}
                    >
                      {s.label} ({count})
                    </FilterChip>
                  );
                })}
              </div>

              {/* Assignee filters */}
              <div className="flex gap-1.5 flex-wrap">
                <FilterChip
                  active={filterAssignee === "all"}
                  onClick={() => setFilterAssignee("all")}
                  variant="secondary"
                >
                  All Team
                </FilterChip>
                {TEAM_MEMBERS.map((m) => (
                  <FilterChip
                    key={m.id}
                    active={filterAssignee === m.id}
                    onClick={() => setFilterAssignee(m.id)}
                    variant="secondary"
                  >
                    {m.initials}
                  </FilterChip>
                ))}
                <FilterChip
                  active={filterAssignee === "unassigned"}
                  onClick={() => setFilterAssignee("unassigned")}
                  variant="secondary"
                >
                  Unassigned
                </FilterChip>
              </div>
            </>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {showDeleted ? (
            deletedContacts.length === 0 ? (
              <div className="px-6 py-10 text-center text-muted text-sm">
                No deleted contacts.
              </div>
            ) : (
              deletedContacts.map((contact) => {
                const daysLeft = contact.deletedAt
                  ? Math.max(0, 10 - Math.floor((Date.now() - contact.deletedAt.getTime()) / (1000 * 60 * 60 * 24)))
                  : 0;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelected(contact)}
                    className={`w-full text-left px-6 py-4 hover:bg-neutral/50 transition-colors ${
                      selected?.id === contact.id ? "bg-neutral" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-600">
                        {daysLeft}d remaining
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-1">
                      {contact.company} &middot; {contact.email}
                    </p>
                    <p className="text-xs text-muted/60 mt-1">
                      Deleted {contact.deletedAt?.toLocaleDateString() || "—"}
                    </p>
                  </button>
                );
              })
            )
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted text-sm">
              No contacts found.
            </div>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelected(contact)}
                className={`w-full text-left px-6 py-4 hover:bg-neutral/50 transition-colors ${
                  selected?.id === contact.id ? "bg-neutral" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <StageBadge stage={contact.stage} />
                </div>
                <p className="text-xs text-muted mb-1">
                  {contact.company} &middot; {contact.email}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted line-clamp-1 flex-1">
                    {contact.headache}
                  </p>
                  {contact.assignee && (
                    <AssigneeAvatar assigneeId={contact.assignee} />
                  )}
                </div>
                <p className="text-xs text-muted/60 mt-1">
                  {contact.createdAt
                    ? contact.createdAt.toLocaleDateString()
                    : "—"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <ContactDetail
          contact={selected}
          actorName={currentMember?.name || "Unknown"}
          isDeleted={showDeleted}
          onClose={() => setSelected(null)}
          onUpdate={async (id, fields) => {
            await updateContact(id, fields, currentMember?.name);
            await loadContacts();
            setSelected((prev) =>
              prev && prev.id === id ? { ...prev, ...fields } : prev
            );
          }}
          onDelete={async (id) => {
            await softDeleteContact(id, currentMember?.name);
            setSelected(null);
            await loadContacts();
          }}
          onRestore={async (id) => {
            await restoreContact(id, currentMember?.name);
            setSelected(null);
            await loadContacts();
          }}
          onPermanentDelete={async (id) => {
            await permanentlyDeleteContact(id);
            setSelected(null);
            await loadContacts();
          }}
        />
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted text-sm">
          Select a contact to view details
        </div>
      )}
    </div>
  );
}

function ContactDetail({
  contact,
  actorName,
  isDeleted,
  onClose,
  onUpdate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: {
  contact: Contact;
  actorName: string;
  isDeleted: boolean;
  onClose: () => void;
  onUpdate: (
    id: string,
    fields: { stage?: string; assignee?: string; notes?: string; githubRepoUrl?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<"details" | "documents">("details");
  const [notes, setNotes] = useState(contact.notes);
  const [saving, setSaving] = useState(false);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [viewingDoc, setViewingDoc] = useState<ClientDocument | null>(null);

  useEffect(() => {
    setNotes(contact.notes);
    setTab("details");
    setViewingDoc(null);
    setConfirmPermanentDelete(false);
    setLoadingActivity(true);
    setLoadingDocs(true);
    getActivities(contact.id).then((data) => {
      setActivities(data);
      setLoadingActivity(false);
    });
    getClientDocuments(contact.id).then((data) => {
      setDocuments(data);
      setLoadingDocs(false);
    });
  }, [contact.id, contact.notes]);

  const handleStageChange = async (stage: string) => {
    await onUpdate(contact.id, { stage });
    const updated = await getActivities(contact.id);
    setActivities(updated);
  };

  const handleAssigneeChange = async (assignee: string) => {
    await onUpdate(contact.id, { assignee });
    const updated = await getActivities(contact.id);
    setActivities(updated);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onUpdate(contact.id, { notes });
    const updated = await getActivities(contact.id);
    setActivities(updated);
    setSaving(false);
  };

  const handleProjectCreated = async () => {
    await onUpdate(contact.id, { stage: "development" });
    const updated = await getActivities(contact.id);
    setActivities(updated);
  };

  const handleDocStatusChange = async (
    docId: string,
    status: string
  ) => {
    await updateClientDocument(contact.id, docId, { status });
    const updated = await getClientDocuments(contact.id);
    setDocuments(updated);
    if (viewingDoc?.id === docId) {
      setViewingDoc(updated.find((d) => d.id === docId) || null);
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{contact.name}</h2>
            <p className="text-muted text-sm">{contact.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {isDeleted ? (
              <>
                <button
                  onClick={() => onRestore(contact.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-600/10 text-green-700 hover:bg-green-600/20 transition-colors"
                >
                  Restore
                </button>
                {confirmPermanentDelete ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-600">Are you sure?</span>
                    <button
                      onClick={() => onPermanentDelete(contact.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Yes, delete forever
                    </button>
                    <button
                      onClick={() => setConfirmPermanentDelete(false)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-neutral text-muted hover:bg-border transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmPermanentDelete(true)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    Delete Forever
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onDelete(contact.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-muted hover:text-charcoal transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => { setTab("details"); setViewingDoc(null); }}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              tab === "details"
                ? "bg-charcoal text-white"
                : "text-muted hover:bg-neutral"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => { setTab("documents"); setViewingDoc(null); }}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "documents"
                ? "bg-charcoal text-white"
                : "text-muted hover:bg-neutral"
            }`}
          >
            Documents
            {documents.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === "documents" ? "bg-white/20" : "bg-accent/10 text-accent"
              }`}>
                {documents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Deleted banner */}
      {isDeleted && contact.deletedAt && (
        <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20">
          <p className="text-sm text-red-600 font-medium">
            This contact was deleted on {contact.deletedAt.toLocaleDateString()}.
            {" "}It will be permanently removed in{" "}
            {Math.max(0, 10 - Math.floor((Date.now() - contact.deletedAt.getTime()) / (1000 * 60 * 60 * 24)))} days.
          </p>
        </div>
      )}

      {/* Documents tab */}
      {tab === "documents" && (
        <DocumentsPanel
          contactId={contact.id}
          actorName={actorName}
          contactName={contact.name}
          contactEmail={contact.email}
          companyName={contact.company}
          documents={documents}
          loadingDocs={loadingDocs}
          viewingDoc={viewingDoc}
          setViewingDoc={setViewingDoc}
          onDocStatusChange={handleDocStatusChange}
          onDocumentsChanged={async () => {
            const updated = await getClientDocuments(contact.id);
            setDocuments(updated);
          }}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Details tab */}
      {tab === "details" && (
      <div className="px-6 py-6 space-y-6 max-w-2xl">
        {/* Contact info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoField
            label="Email"
            value={contact.email}
            href={`mailto:${contact.email}`}
          />
          <InfoField
            label="Phone"
            value={contact.phone || "Not provided"}
            href={contact.phone ? `tel:${contact.phone}` : undefined}
          />
          <InfoField
            label="Submitted"
            value={
              contact.createdAt
                ? contact.createdAt.toLocaleString()
                : "Unknown"
            }
          />
          <InfoField
            label="Last Updated"
            value={
              contact.updatedAt
                ? contact.updatedAt.toLocaleString()
                : "—"
            }
          />
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium mb-2">Assigned To</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAssigneeChange("")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                !contact.assignee
                  ? "bg-charcoal/10 text-charcoal border-current"
                  : "border-border text-muted hover:border-charcoal"
              }`}
            >
              Unassigned
            </button>
            {TEAM_MEMBERS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleAssigneeChange(m.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                  contact.assignee === m.id
                    ? "bg-accent/10 text-accent border-current"
                    : "border-border text-muted hover:border-charcoal"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[10px] font-bold flex items-center justify-center">
                  {m.initials}
                </span>
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline stage */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Pipeline Stage
          </label>
          <div className="flex gap-2 flex-wrap">
            {PIPELINE_STAGES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStageChange(s.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  contact.stage === s.value
                    ? s.color + " border-current"
                    : "border-border text-muted hover:border-charcoal"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Headache */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Their Headache
          </label>
          <div className="bg-neutral rounded-lg p-4 text-sm leading-relaxed">
            {contact.headache}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add notes about this lead..."
            className="w-full px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-y"
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving || notes === contact.notes}
            className="mt-2 bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* Activity log */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Activity Log
          </label>
          {loadingActivity ? (
            <p className="text-muted text-sm">Loading activity...</p>
          ) : activities.length === 0 ? (
            <p className="text-muted text-sm">No activity recorded yet.</p>
          ) : (
            <div className="space-y-0">
              {activities.map((a, i) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        a.type === "stage_change"
                          ? "bg-accent"
                          : a.type === "assignment"
                            ? "bg-blue-500"
                            : "bg-border"
                      }`}
                    />
                    {i < activities.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm">{a.description}</p>
                    <p className="text-xs text-muted">
                      {a.user}
                      {a.timestamp && ` · ${a.timestamp.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function DocumentsPanel({
  contactId,
  actorName,
  contactName,
  contactEmail,
  companyName,
  documents,
  loadingDocs,
  viewingDoc,
  setViewingDoc,
  onDocStatusChange,
  onDocumentsChanged,
  onProjectCreated,
}: {
  contactId: string;
  actorName: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  documents: ClientDocument[];
  loadingDocs: boolean;
  viewingDoc: ClientDocument | null;
  setViewingDoc: (doc: ClientDocument | null) => void;
  onDocStatusChange: (docId: string, status: string) => Promise<void>;
  onDocumentsChanged: () => Promise<void>;
  onProjectCreated: () => Promise<void>;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [viewingRevision, setViewingRevision] = useState<DocumentRevision | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [sendingReview, setSendingReview] = useState(false);
  const [sendReviewError, setSendReviewError] = useState<string | null>(null);
  const [reviewSent, setReviewSent] = useState(false);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingNewProject, setCreatingNewProject] = useState(false);

  useEffect(() => {
    setLoadingProjects(true);
    getProjectsForContact(contactId).then((p) => {
      setProjects(p);
      setLoadingProjects(false);
      if (p.length > 0) {
        setActiveProjectId(p[0].id);
      }
    });
  }, [contactId]);

  const handleCreateNewProject = async () => {
    if (!newProjectName.trim()) return;
    setCreatingNewProject(true);
    try {
      const ref = await addProject(contactId, {
        contactName,
        companyName,
        name: newProjectName.trim(),
      });
      const updated = await getProjectsForContact(contactId);
      setProjects(updated);
      setActiveProjectId(ref.id);
      setNewProjectName("");
      setShowNewProjectInput(false);
    } finally {
      setCreatingNewProject(false);
    }
  };

  // Filter documents by active project context
  const contextDocs = documents.filter((d) => (d.projectId || "") === activeProjectId);
  const meetingDocs = contextDocs.filter((d) => d.type === "meeting_transcript");
  const productDocs = contextDocs.filter((d) =>
    ["problem_definition", "solution_one_pager", "development_plan"].includes(d.type)
  );
  const otherDocs = contextDocs.filter(
    (d) => d.type === "other" && !["meeting_transcript", "problem_definition", "solution_one_pager", "development_plan"].includes(d.type)
  );
  const unassignedDocs = documents.filter((d) => !d.projectId);
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleUploadDocument = async () => {
    if (!uploadTitle.trim() || (!uploadContent.trim() && !uploadFile)) return;
    setUploading(true);
    try {
      let fileUrl = "";
      let fileName = "";
      if (uploadFile) {
        const result = await uploadDocumentFile(contactId, uploadFile);
        fileUrl = result.url;
        fileName = result.name;
      }
      await addClientDocument(contactId, {
        title: uploadTitle.trim(),
        type: "meeting_transcript",
        content: uploadContent.trim(),
        fileUrl,
        fileName,
        status: "approved",
        generatedBy: "manual",
        projectId: activeProjectId,
      });
      setUploadTitle("");
      setUploadContent("");
      setUploadFile(null);
      setShowUpload(false);
      await onDocumentsChanged();
    } finally {
      setUploading(false);
    }
  };

  const [generateError, setGenerateError] = useState<string | null>(null);

  const allThreeExist =
    productDocs.some((d) => d.type === "problem_definition") &&
    productDocs.some((d) => d.type === "solution_one_pager") &&
    productDocs.some((d) => d.type === "development_plan");

  const allThreeApproved =
    productDocs.some((d) => d.type === "problem_definition" && d.status === "approved") &&
    productDocs.some((d) => d.type === "solution_one_pager" && d.status === "approved") &&
    productDocs.some((d) => d.type === "development_plan" && d.status === "approved");

  const handleSendForReview = async () => {
    setSendingReview(true);
    setSendReviewError(null);
    try {
      // Create review token
      const tokenId = await createReviewToken({
        contactId,
        contactName,
        companyName,
        contactEmail,
        createdBy: actorName,
        projectId: activeProjectId,
      });

      const baseUrl = window.location.origin;
      const reviewUrl = `${baseUrl}/review/${tokenId}`;

      // Send email
      const res = await fetch("/api/email/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName, contactEmail, companyName, reviewUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }

      // Update all three doc statuses to "review"
      for (const d of productDocs) {
        if (d.status === "draft" || d.status === "revision_requested") {
          await onDocStatusChange(d.id, "review");
        }
      }

      setReviewSent(true);
      await onDocumentsChanged();
    } catch (err) {
      setSendReviewError(err instanceof Error ? err.message : "Failed to send review");
    } finally {
      setSendingReview(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!activeProject) return;
    setCreatingProject(true);
    setCreateProjectError(null);
    try {
      const problemDef = productDocs.find((d) => d.type === "problem_definition")!;
      const solutionOnePager = productDocs.find((d) => d.type === "solution_one_pager")!;
      const devPlan = productDocs.find((d) => d.type === "development_plan")!;

      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: activeProject.name,
          companyName,
          documents: {
            problemDefinition: problemDef.content,
            solutionOnePager: solutionOnePager.content,
            developmentPlan: devPlan.content,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create repository");
      }

      const { repoUrl, repoName } = await res.json();

      // Update existing project with repo info
      await updateProject(activeProject.id, { repoName, repoUrl });

      // Refresh projects list
      const updated = await getProjectsForContact(contactId);
      setProjects(updated);
      await onProjectCreated();
    } catch (err) {
      setCreateProjectError(err instanceof Error ? err.message : "Failed to create repository");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleGenerate = async (type: "problem_definition" | "solution_one_pager" | "development_plan") => {
    let sourceContent = "";
    let fileUrl = "";

    if (type === "problem_definition") {
      const transcript = meetingDocs[0];
      if (!transcript) return;
      sourceContent = transcript.content;
      fileUrl = transcript.fileUrl;

      if (!sourceContent && !fileUrl) {
        setGenerateError("No meeting document content or file found. Please add a transcript first.");
        return;
      }
    } else if (type === "solution_one_pager") {
      const prd = productDocs.find((d) => d.type === "problem_definition");
      if (!prd) return;
      sourceContent = prd.content;
    } else if (type === "development_plan") {
      const sop = productDocs.find((d) => d.type === "solution_one_pager");
      if (!sop) return;
      sourceContent = sop.content;
    }

    setGenerateError(null);
    setGenerating(type);
    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, sourceContent: sourceContent || undefined, fileUrl: fileUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const title = type === "problem_definition"
        ? "Problem Definition Document"
        : type === "solution_one_pager"
          ? "Solution One-Pager"
          : "Development Plan";

      // Check if a document of this type already exists — if so, save revision
      const existing = productDocs.find((d) => d.type === type);
      if (existing && existing.content) {
        await saveRevisionAndUpdate(
          contactId,
          existing.id,
          {
            content: existing.content,
            title: existing.title,
            status: existing.status,
            version: existing.version || 1,
          },
          { content: data.content, title, status: "draft" },
          actorName
        );
      } else {
        await addClientDocument(contactId, {
          title,
          type,
          content: data.content,
          status: "draft",
          generatedBy: "ai",
          projectId: activeProjectId,
        });
      }
      await onDocumentsChanged();
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setGenerating(null);
    }
  };

  // Load revisions when viewing a product document
  useEffect(() => {
    if (viewingDoc && ["problem_definition", "solution_one_pager", "development_plan"].includes(viewingDoc.type)) {
      setLoadingRevisions(true);
      setViewingRevision(null);
      setShowRevisions(false);
      getDocumentRevisions(contactId, viewingDoc.id).then((data) => {
        setRevisions(data);
        setLoadingRevisions(false);
      });
    } else {
      setRevisions([]);
      setViewingRevision(null);
      setShowRevisions(false);
    }
  }, [viewingDoc?.id, contactId]);

  // Load comments when viewing a product document
  useEffect(() => {
    if (viewingDoc && ["problem_definition", "solution_one_pager", "development_plan"].includes(viewingDoc.type)) {
      setLoadingComments(true);
      getDocumentComments(contactId, viewingDoc.id).then((data) => {
        setComments(data);
        setLoadingComments(false);
      });
    } else {
      setComments([]);
    }
  }, [viewingDoc?.id, contactId]);

  const isProductDoc = viewingDoc && ["problem_definition", "solution_one_pager", "development_plan"].includes(viewingDoc.type);

  if (viewingDoc) {
    const displayContent = viewingRevision ? viewingRevision.content : viewingDoc.content;

    return (
      <div className="px-6 py-6 max-w-3xl">
        <button
          onClick={() => { setViewingDoc(null); setViewingRevision(null); }}
          className="text-sm text-accent hover:text-accent-hover font-medium mb-4 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to documents
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">{viewingDoc.title}</h3>
            <p className="text-xs text-muted mt-1">
              {viewingDoc.generatedBy === "ai" ? "AI Generated" : "Manual"}
              {" · v"}{viewingDoc.version || 1}
              {" · "}{viewingDoc.createdAt?.toLocaleString() || "—"}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {isProductDoc && revisions.length > 0 && (
              <button
                onClick={() => { setShowRevisions(!showRevisions); setViewingRevision(null); }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  showRevisions
                    ? "bg-charcoal text-white"
                    : "bg-neutral text-muted hover:bg-border"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {revisions.length} revision{revisions.length !== 1 ? "s" : ""}
              </button>
            )}
            {(["draft", "review", "approved", "sent"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onDocStatusChange(viewingDoc.id, s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                  viewingDoc.status === s
                    ? s === "approved"
                      ? "bg-green-600/10 text-green-700 border-current"
                      : s === "sent"
                        ? "bg-blue-500/10 text-blue-600 border-current"
                        : s === "review"
                          ? "bg-accent/10 text-accent border-current"
                          : "bg-charcoal/10 text-charcoal border-current"
                    : "border-border text-muted hover:border-charcoal"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Download buttons for product documents */}
        {isProductDoc && displayContent && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/documents/download-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markdown: displayContent, title: viewingDoc.title }),
                  });
                  if (!res.ok) throw new Error("Failed to generate PDF");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${viewingDoc.title}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("PDF download error:", err);
                }
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/documents/download-docx", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markdown: displayContent, title: viewingDoc.title }),
                  });
                  if (!res.ok) throw new Error("Failed to generate DOCX");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${viewingDoc.title}.docx`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("DOCX download error:", err);
                }
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Word
            </button>
          </div>
        )}

        {/* Revision history sidebar */}
        {showRevisions && (
          <div className="mb-4 bg-neutral rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Version History</h4>
            <div className="space-y-1">
              <button
                onClick={() => setViewingRevision(null)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  !viewingRevision ? "bg-accent/10 text-accent font-medium" : "text-muted hover:bg-border/50"
                }`}
              >
                v{viewingDoc.version || 1} (current) — {viewingDoc.updatedAt?.toLocaleDateString() || "—"}
              </button>
              {revisions.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => setViewingRevision(rev)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    viewingRevision?.id === rev.id ? "bg-accent/10 text-accent font-medium" : "text-muted hover:bg-border/50"
                  }`}
                >
                  v{rev.version} — {rev.editedBy} — {rev.createdAt?.toLocaleDateString() || "—"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Viewing old revision banner */}
        {viewingRevision && (
          <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">
              Viewing version {viewingRevision.version} — saved by {viewingRevision.editedBy} on{" "}
              {viewingRevision.createdAt?.toLocaleString() || "—"}
            </p>
          </div>
        )}

        {viewingDoc.fileUrl && (
          <div className="flex items-center gap-3 mb-4 bg-neutral rounded-lg p-4">
            <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 18H17V16H7V18M17 14H7V12H17V14M7 10H11V8H7V10M15 2H5C3.89 2 3 2.89 3 4V20C3 21.11 3.89 22 5 22H19C20.11 22 21 21.11 21 20V8L15 2M19 20H5V4H14V9H19V20Z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{viewingDoc.fileName}</p>
              <p className="text-xs text-muted">Uploaded file</p>
            </div>
            <a
              href={viewingDoc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
            >
              View / Download
            </a>
          </div>
        )}

        {viewingDoc.fileUrl && viewingDoc.fileName.toLowerCase().endsWith(".pdf") && (
          <iframe
            src={viewingDoc.fileUrl}
            className="w-full h-[600px] rounded-lg border border-border mb-4"
            title={viewingDoc.title}
          />
        )}

        {displayContent && (
          <div className="prose prose-sm max-w-none bg-neutral rounded-lg p-6">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        )}

        {/* Client Comments */}
        {isProductDoc && (
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
              Client Feedback
              {comments.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                  {comments.length}
                </span>
              )}
            </h4>
            {loadingComments ? (
              <p className="text-muted text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-muted text-xs">No client feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-charcoal">{c.author}</p>
                      <p className="text-xs text-muted">
                        {c.createdAt?.toLocaleString() || "—"}
                      </p>
                    </div>
                    <p className="text-sm text-charcoal/80 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (loadingDocs) {
    return <div className="px-6 py-6"><p className="text-muted text-sm">Loading documents...</p></div>;
  }

  return (
    <div className="px-6 py-6 max-w-3xl space-y-8">
      {/* Project Tabs */}
      <div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActiveProjectId(p.id); setShowUpload(false); setReviewSent(false); setShowNewProjectInput(false); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                activeProjectId === p.id
                  ? "bg-charcoal text-white"
                  : "bg-neutral text-muted hover:bg-border"
              }`}
            >
              {p.name}
              {p.repoUrl ? (
                <svg className="w-3 h-3 opacity-60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeProjectId === p.id ? "bg-white/20" : "bg-amber-500/15 text-amber-700"
                }`}>
                  draft
                </span>
              )}
            </button>
          ))}

          {/* + New Project */}
          {showNewProjectInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateNewProject(); if (e.key === "Escape") { setShowNewProjectInput(false); setNewProjectName(""); } }}
                className="text-xs px-3 py-1.5 rounded-full border border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 w-48"
                disabled={creatingNewProject}
              />
              <button
                onClick={handleCreateNewProject}
                disabled={creatingNewProject || !newProjectName.trim()}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-40 transition-colors"
              >
                {creatingNewProject ? "..." : "Create"}
              </button>
              <button
                onClick={() => { setShowNewProjectInput(false); setNewProjectName(""); }}
                className="text-xs text-muted hover:text-charcoal transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewProjectInput(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors border-2 border-dashed border-border text-muted hover:border-accent hover:text-accent"
            >
              + New Project
            </button>
          )}

          {/* Unassigned Assets tab */}
          {unassignedDocs.length > 0 && (
            <button
              onClick={() => { setActiveProjectId("__unassigned__"); setShowUpload(false); setReviewSent(false); setShowNewProjectInput(false); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                activeProjectId === "__unassigned__"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              Unassigned Assets
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeProjectId === "__unassigned__" ? "bg-white/20" : "bg-amber-500/20"
              }`}>
                {unassignedDocs.length}
              </span>
            </button>
          )}
        </div>

        {/* Active project GitHub link */}
        {activeProject?.repoUrl && (
          <div className="mt-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <a
              href={activeProject.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {activeProject.repoUrl.replace("https://github.com/", "")}
            </a>
          </div>
        )}
      </div>

      {/* No projects yet - prompt */}
      {projects.length === 0 && !showNewProjectInput && unassignedDocs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted text-sm mb-3">Create a project to get started with this contact.</p>
          <button
            onClick={() => setShowNewProjectInput(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Create First Project
          </button>
        </div>
      )}

      {/* Unassigned Assets view */}
      {activeProjectId === "__unassigned__" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Assign each document to a project using the dropdown.</p>
          <div className="space-y-2">
            {unassignedDocs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 bg-neutral rounded-lg p-3">
                <button
                  onClick={() => setViewingDoc(d)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-medium text-sm truncate">{d.title}</p>
                  <p className="text-xs text-muted">{d.type.replace(/_/g, " ")} · {d.createdAt?.toLocaleDateString() || "—"}</p>
                </button>
                <select
                  defaultValue=""
                  onChange={async (e) => {
                    const projectId = e.target.value;
                    if (!projectId) return;
                    e.target.disabled = true;
                    try {
                      await tagDocumentsWithProject(contactId, projectId, [d.id]);
                      await onDocumentsChanged();
                    } finally {
                      e.target.disabled = false;
                    }
                  }}
                  className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  <option value="" disabled>Assign to...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Documents */}
      {activeProjectId && activeProjectId !== "__unassigned__" ? <><div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Meeting Documents</h3>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {showUpload ? "Cancel" : "+ Add Transcript"}
          </button>
        </div>

        {showUpload && (
          <div className="bg-neutral rounded-lg p-4 mb-3 space-y-3">
            <input
              type="text"
              placeholder="Meeting title (e.g. Discovery Call — Acme Corp)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />

            {/* File upload */}
            <label className={`flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg border-2 border-dashed text-sm cursor-pointer transition-colors ${
              uploadFile ? "border-accent bg-accent/5 text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              {uploadFile ? uploadFile.name : "Upload a file (PDF, DOC, etc.)"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    if (!uploadTitle.trim()) {
                      setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
                    }
                  }
                }}
              />
            </label>
            {uploadFile && (
              <button
                onClick={() => setUploadFile(null)}
                className="text-xs text-muted hover:text-red-600 transition-colors"
              >
                Remove file
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">and/or add notes</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <textarea
              placeholder="Paste meeting transcript or notes (optional if uploading a file)..."
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-y"
            />
            <button
              onClick={handleUploadDocument}
              disabled={uploading || !uploadTitle.trim() || (!uploadContent.trim() && !uploadFile)}
              className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {uploading ? "Uploading..." : "Save Document"}
            </button>
          </div>
        )}

        {meetingDocs.length === 0 && !showUpload ? (
          <p className="text-muted text-xs">No meeting documents yet. Add a transcript to get started.</p>
        ) : (
          <div className="space-y-2">
            {meetingDocs.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} />
            ))}
          </div>
        )}
      </div>

      {/* Product Documents */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Product Documents</h3>

        {/* Generate buttons */}
        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => handleGenerate("problem_definition")}
            disabled={meetingDocs.length === 0 || generating !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {generating === "problem_definition" ? (
              <>
                <span className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                Generating...
              </>
            ) : productDocs.some((d) => d.type === "problem_definition") ? (
              "Regenerate Problem Definition"
            ) : (
              "Generate Problem Definition"
            )}
          </button>
          <button
            onClick={() => handleGenerate("solution_one_pager")}
            disabled={!productDocs.some((d) => d.type === "problem_definition") || generating !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {generating === "solution_one_pager" ? (
              <>
                <span className="w-3 h-3 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                Generating...
              </>
            ) : productDocs.some((d) => d.type === "solution_one_pager") ? (
              "Regenerate Solution One-Pager"
            ) : (
              "Generate Solution One-Pager"
            )}
          </button>
          <button
            onClick={() => handleGenerate("development_plan")}
            disabled={!productDocs.some((d) => d.type === "solution_one_pager") || generating !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {generating === "development_plan" ? (
              <>
                <span className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                Generating...
              </>
            ) : productDocs.some((d) => d.type === "development_plan") ? (
              "Regenerate Development Plan"
            ) : (
              "Generate Development Plan"
            )}
          </button>
        </div>

        {generateError && (
          <div className="mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{generateError}</p>
          </div>
        )}

        {/* Send for Review */}
        {allThreeExist && !generating && (
          <div className="mb-3">
            {reviewSent ? (
              <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <p className="text-sm text-blue-700 font-medium">Documents sent to {contactEmail} for review.</p>
              </div>
            ) : (
              <button
                onClick={handleSendForReview}
                disabled={sendingReview}
                className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {sendingReview ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    Send to Client for Review
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {sendReviewError && (
          <div className="mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{sendReviewError}</p>
          </div>
        )}

        {/* Create GitHub Repository for active project */}
        {allThreeExist && !generating && activeProject && !activeProject.repoUrl && (
          <div className="mb-3">
            {!allThreeApproved ? (
              <p className="text-xs text-amber-600 mb-2">Approve all three documents to create a GitHub repository.</p>
            ) : (
              <button
                onClick={handleCreateRepo}
                disabled={creatingProject}
                className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {creatingProject ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Repository...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    Create GitHub Repository
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {createProjectError && (
          <div className="mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{createProjectError}</p>
          </div>
        )}

        {meetingDocs.length === 0 && productDocs.length === 0 && (
          <p className="text-muted text-xs">Add a meeting transcript first, then generate product documents from it.</p>
        )}

        {productDocs.length > 0 && (
          <div className="space-y-2">
            {productDocs.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} />
            ))}
          </div>
        )}
      </div>

      {/* Other Documents */}
      {otherDocs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Other</h3>
          <div className="space-y-2">
            {otherDocs.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} />
            ))}
          </div>
        </div>
      )}
      </> : null}
    </div>
  );
}

function DocCard({ doc, onClick }: { doc: ClientDocument; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-neutral rounded-lg p-4 hover:bg-border/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-sm">{doc.title}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
          doc.status === "approved"
            ? "bg-green-600/10 text-green-700"
            : doc.status === "sent"
              ? "bg-blue-500/10 text-blue-600"
              : doc.status === "review"
                ? "bg-accent/10 text-accent"
                : doc.status === "revision_requested"
                  ? "bg-amber-500/10 text-amber-700"
                  : "bg-charcoal/10 text-charcoal"
        }`}>
          {doc.status === "revision_requested" ? "revision requested" : doc.status}
        </span>
      </div>
      <p className="text-xs text-muted">
        {doc.generatedBy === "ai" ? "AI Generated" : "Manual"}
        {["problem_definition", "solution_one_pager", "development_plan"].includes(doc.type) && ` · v${doc.version || 1}`}
        {doc.fileName ? ` · ${doc.fileName}` : ` · ${doc.type.replace(/_/g, " ")}`}
        {" · "}
        {doc.createdAt?.toLocaleDateString() || "—"}
      </p>
    </button>
  );
}

function InfoField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const opt = PIPELINE_STAGES.find((s) => s.value === stage);
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${opt?.color || "bg-neutral text-muted"}`}
    >
      {opt?.label || stage}
    </span>
  );
}

function AssigneeAvatar({ assigneeId }: { assigneeId: string }) {
  const member = TEAM_MEMBERS.find((m) => m.id === assigneeId);
  if (!member) return null;
  return (
    <span
      className="w-6 h-6 rounded-full bg-charcoal text-white text-[10px] font-bold flex items-center justify-center shrink-0"
      title={member.name}
    >
      {member.initials}
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  variant = "primary",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const activeStyle =
    variant === "primary" ? "bg-charcoal text-white" : "bg-accent text-white";
  const inactiveStyle = "bg-neutral text-muted hover:bg-border";

  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active ? activeStyle : inactiveStyle
      }`}
    >
      {children}
    </button>
  );
}
