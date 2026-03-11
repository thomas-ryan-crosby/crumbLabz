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
  deleteClientDocument,
  deleteChangeRequest,
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
  getChangeRequests,
  updateChangeRequest,
  submitContactForm,
  getOrCreatePortalToken,
  addProductUpdate,
  getProductUpdates,
  addChangeLogEntry,
  getChangeLogEntries,
  addChangeRequest,
  type Contact,
  type Activity,
  type ClientDocument,
  type DocumentRevision,
  type DocumentComment,
  type Project,
  type ChangeRequest,
  type ProductUpdate,
  type ChangeLogEntry,
} from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", company: "", email: "", phone: "", headache: "" });
  const [addingContact, setAddingContact] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.company.trim()) return;
    setAddingContact(true);
    try {
      await submitContactForm(newContact);
      setNewContact({ name: "", company: "", email: "", phone: "", headache: "" });
      setShowAddContact(false);
      await loadContacts();
    } finally {
      setAddingContact(false);
    }
  };

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

  // All unique company names for autocomplete
  const allCompanyNames = [...new Set(contacts.map((c) => c.company).filter(Boolean))].sort();

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
            <h1 className="text-xl font-bold">{showDeleted ? "Deleted Clients" : "Clients"}</h1>
            <div className="flex gap-2">
              {!showDeleted && (
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    showAddContact
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-accent hover:bg-accent/20"
                  }`}
                >
                  + Add Client
                </button>
              )}
              <button
                onClick={() => { setShowDeleted(!showDeleted); setSelected(null); setShowAddContact(false); }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  showDeleted
                    ? "bg-red-500/10 text-red-600"
                    : "bg-neutral text-muted hover:bg-border"
                }`}
              >
                {showDeleted ? "Back to Clients" : `Deleted (${deletedContacts.length})`}
              </button>
            </div>
          </div>

          {showAddContact && (
            <div className="bg-neutral rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold text-charcoal">New Client</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Primary contact name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Company name *"
                    value={newContact.company}
                    onChange={(e) => { setNewContact({ ...newContact, company: e.target.value }); setShowCompanySuggestions(true); }}
                    onFocus={() => setShowCompanySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 150)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  {showCompanySuggestions && newContact.company && allCompanyNames.filter((n) => n.toLowerCase().includes(newContact.company.toLowerCase())).length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                      {allCompanyNames.filter((n) => n.toLowerCase().includes(newContact.company.toLowerCase())).map((name) => (
                        <button
                          key={name}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setNewContact({ ...newContact, company: name }); setShowCompanySuggestions(false); }}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <textarea
                placeholder="What's their headache? (optional)"
                value={newContact.headache}
                onChange={(e) => setNewContact({ ...newContact, headache: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowAddContact(false); setNewContact({ name: "", company: "", email: "", phone: "", headache: "" }); }}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={addingContact || !newContact.name.trim() || !newContact.company.trim()}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-colors"
                >
                  {addingContact ? "Adding..." : "Add Client"}
                </button>
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Search clients..."
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
                No deleted clients.
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
              No clients found.
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
                  <p className="font-medium text-sm">{contact.company || "No Company"}</p>
                  <StageBadge stage={contact.stage} />
                </div>
                <p className="text-xs text-muted mb-1">
                  {contact.name} &middot; {contact.email}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted line-clamp-1 flex-1">
                    {contact.headache}
                  </p>
                  {contact.assignee && (
                    <AssigneeAvatar assigneeId={contact.assignee} />
                  )}
                </div>
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
          allContacts={contacts}
          onClose={() => setSelected(null)}
          onContactsChanged={loadContacts}
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
          Select a client to view details
        </div>
      )}
    </div>
  );
}

function ContactDetail({
  contact,
  actorName,
  isDeleted,
  allContacts,
  onClose,
  onUpdate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onContactsChanged,
}: {
  contact: Contact;
  actorName: string;
  isDeleted: boolean;
  allContacts: Contact[];
  onClose: () => void;
  onUpdate: (
    id: string,
    fields: { stage?: string; assignee?: string; notes?: string; githubRepoUrl?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  onContactsChanged: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"details" | "documents" | "portfolio">("details");
  const [notes, setNotes] = useState(contact.notes);
  const [saving, setSaving] = useState(false);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [contactProjects, setContactProjects] = useState<Project[]>([]);
  const [viewingDoc, setViewingDoc] = useState<ClientDocument | null>(null);
  const [showAddTeamContact, setShowAddTeamContact] = useState(false);
  const [addingTeamContact, setAddingTeamContact] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", email: "", phone: "", headache: "" });

  useEffect(() => {
    setNotes(contact.notes);
    setTab("details");
    setViewingDoc(null);
    setConfirmPermanentDelete(false);
    setShowAddTeamContact(false);
    setTeamForm({ name: "", email: "", phone: "", headache: "" });
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
    getProjectsForContact(contact.id).then(setContactProjects);
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
    const updatedProjects = await getProjectsForContact(contact.id);
    setContactProjects(updatedProjects);
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
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold">{contact.company || "No Company"}</h2>
            <p className="text-muted text-sm">Primary contact: {contact.name}</p>
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

        {/* Contacts section */}
        {contact.company && (() => {
          const companyContacts = allContacts.filter(
            (c) => c.company.toLowerCase() === contact.company.toLowerCase() && c.id !== contact.id
          );
          return (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  Contacts ({companyContacts.length + 1})
                </p>
                <button
                  onClick={() => setShowAddTeamContact(!showAddTeamContact)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                    showAddTeamContact
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-accent hover:bg-accent/20"
                  }`}
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {/* Primary contact */}
                <div className="flex items-center gap-1.5 bg-accent/5 border border-accent/20 rounded-full px-2.5 py-1">
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-charcoal">{contact.name}</span>
                  <span className="text-[10px] text-accent font-medium">Primary</span>
                </div>
                {/* Other contacts */}
                {companyContacts.map((tc) => (
                  <div key={tc.id} className="flex items-center gap-1.5 bg-neutral rounded-full px-2.5 py-1">
                    <span className="w-5 h-5 rounded-full bg-charcoal/70 text-white text-[10px] font-bold flex items-center justify-center">
                      {tc.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-charcoal">{tc.name}</span>
                    {tc.email && <span className="text-[10px] text-muted">{tc.email}</span>}
                  </div>
                ))}
              </div>

              {showAddTeamContact && (
                <div className="bg-neutral rounded-lg p-3 space-y-2 mb-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={teamForm.email}
                      onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={teamForm.phone}
                      onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setShowAddTeamContact(false); setTeamForm({ name: "", email: "", phone: "", headache: "" }); }}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg text-muted hover:bg-border transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!teamForm.name.trim()) return;
                        setAddingTeamContact(true);
                        try {
                          await submitContactForm({
                            name: teamForm.name,
                            company: contact.company,
                            email: teamForm.email,
                            phone: teamForm.phone,
                            headache: teamForm.headache,
                          });
                          setTeamForm({ name: "", email: "", phone: "", headache: "" });
                          setShowAddTeamContact(false);
                          await onContactsChanged();
                        } finally {
                          setAddingTeamContact(false);
                        }
                      }}
                      disabled={addingTeamContact || !teamForm.name.trim()}
                      className="text-[11px] font-medium px-3 py-1 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-colors"
                    >
                      {addingTeamContact ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
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
            Project Center
            {documents.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === "documents" ? "bg-white/20" : "bg-accent/10 text-accent"
              }`}>
                {documents.length}
              </span>
            )}
          </button>
          {contactProjects.length > 0 && (
            <button
              onClick={() => { setTab("portfolio"); setViewingDoc(null); }}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                tab === "portfolio"
                  ? "bg-charcoal text-white"
                  : "text-muted hover:bg-neutral"
              }`}
            >
              Portfolio
            </button>
          )}
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

      {/* Portfolio tab */}
      {tab === "portfolio" && (
        <PortfolioPanel
          projects={contactProjects}
          onProjectsChanged={async () => {
            const updated = await getProjectsForContact(contact.id);
            setContactProjects(updated);
          }}
        />
      )}
    </div>
  );
}

function PortfolioPanel({
  projects,
  onProjectsChanged,
}: {
  projects: Project[];
  onProjectsChanged: () => Promise<void>;
}) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handleGenerateShowcase = async (project: Project) => {
    if (!project.repoUrl) return;
    setGeneratingId(project.id);
    try {
      const urlParts = project.repoUrl.replace("https://github.com/", "").split("/");
      const owner = urlParts[0];
      const repo = urlParts[1];

      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "portfolio_showcase",
          repoOwner: owner,
          repoName: repo,
          projectName: project.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate portfolio showcase");
      const { description, benefits, showcaseHtml } = await res.json();

      await updateProject(project.id, {
        portfolioDescription: description,
        portfolioBenefits: benefits,
        portfolioContent: showcaseHtml,
      });
      await onProjectsChanged();
    } catch (err) {
      console.error("Portfolio generation error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="px-6 py-6 max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-charcoal mb-1">Portfolio Management</h3>
        <p className="text-sm text-muted">Control which projects appear on the public portfolio page and generate showcase assets.</p>
      </div>

      {projects.map((project) => (
        <div key={project.id} className="border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-charcoal">{project.name}</h4>
              <p className="text-xs text-muted">{project.companyName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">Show on website</span>
              <button
                onClick={async () => {
                  await updateProject(project.id, { portfolioEnabled: !project.portfolioEnabled });
                  await onProjectsChanged();
                }}
                className={`relative w-10 h-6 rounded-full transition-colors ${project.portfolioEnabled ? "bg-accent" : "bg-border"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${project.portfolioEnabled ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex gap-2 flex-wrap">
            {project.repoUrl ? (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-green-600/10 text-green-700">GitHub Connected</span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-600">No GitHub Repo</span>
            )}
            {project.portfolioContent ? (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">Showcase Generated</span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-700">No Showcase</span>
            )}
            {project.portfolioEnabled && (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">Live on Website</span>
            )}
          </div>

          {/* Generated content preview */}
          {project.portfolioDescription && (
            <div className="bg-neutral rounded-lg p-3 space-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Description</p>
                <p className="text-sm text-charcoal/80">{project.portfolioDescription}</p>
              </div>
              {project.portfolioBenefits && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Client Impact</p>
                  <p className="text-sm text-charcoal/80">{project.portfolioBenefits}</p>
                </div>
              )}
            </div>
          )}

          {/* Showcase preview */}
          {project.portfolioContent && previewHtml === project.id && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-neutral px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted">Showcase Preview</span>
                <button onClick={() => setPreviewHtml(null)} className="text-xs text-muted hover:text-charcoal">Close</button>
              </div>
              <div className="p-4" dangerouslySetInnerHTML={{ __html: project.portfolioContent }} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {project.repoUrl && (
              <button
                onClick={() => handleGenerateShowcase(project)}
                disabled={generatingId !== null}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-colors"
              >
                {generatingId === project.id ? "Generating..." : project.portfolioContent ? "Regenerate Showcase" : "Generate Showcase"}
              </button>
            )}
            {project.portfolioContent && previewHtml !== project.id && (
              <button
                onClick={() => setPreviewHtml(project.id)}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-charcoal/10 text-charcoal hover:bg-charcoal/20 transition-colors"
              >
                Preview
              </button>
            )}
          </div>

          {generatingId === project.id && (
            <GeneratingProgress label={`Generating showcase for ${project.name}`} />
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <p className="text-muted text-sm">No projects yet. Create a project in the Documents tab first.</p>
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
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showDocUpload, setShowDocUpload] = useState<string | null>(null); // doc type being uploaded
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectNameValue, setEditingProjectNameValue] = useState("");
  const [creatingNewProject, setCreatingNewProject] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [adminNotesOriginal, setAdminNotesOriginal] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [repoHead, setRepoHead] = useState<{ sha: string; message: string; date: string } | null>(null);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [retainerInput, setRetainerInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"discovery" | "initial_definition" | "maintenance">("discovery");
  const [changeLogEntries, setChangeLogEntries] = useState<ChangeLogEntry[]>([]);
  const [showNewChangeLog, setShowNewChangeLog] = useState(false);
  const [newChangeLogTitle, setNewChangeLogTitle] = useState("");
  const [newChangeLogDescription, setNewChangeLogDescription] = useState("");
  const [newChangeLogVersion, setNewChangeLogVersion] = useState("");
  const [newChangeLogCategory, setNewChangeLogCategory] = useState<ChangeLogEntry["category"]>("improvement");
  const [publishingChangeLog, setPublishingChangeLog] = useState(false);
  const [showCreateFeatureDoc, setShowCreateFeatureDoc] = useState(false);
  const [selectedMinuteIds, setSelectedMinuteIds] = useState<string[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [featureDocNotes, setFeatureDocNotes] = useState("");
  const [generatingFeatureDoc, setGeneratingFeatureDoc] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestDescription, setNewRequestDescription] = useState("");
  const [newRequestPriority, setNewRequestPriority] = useState<ChangeRequest["priority"]>("medium");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editRequestTitle, setEditRequestTitle] = useState("");
  const [editRequestDescription, setEditRequestDescription] = useState("");
  const [editRequestPriority, setEditRequestPriority] = useState<ChangeRequest["priority"]>("medium");
  const [savingRequest, setSavingRequest] = useState(false);

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
  const discoveryMeetings = meetingDocs.filter((d) => d.phase === "discovery" || !d.phase);
  const definitionMeetings = meetingDocs.filter((d) => d.phase === "initial_definition");
  const maintenanceMeetings = meetingDocs.filter((d) => d.phase === "maintenance");
  const productDocs = contextDocs.filter((d) =>
    ["problem_definition", "solution_one_pager", "development_plan"].includes(d.type)
  );
  const solutionDocs = contextDocs.filter((d) => ["solution_overview", "getting_started"].includes(d.type));
  const featureDocs = contextDocs.filter((d) => d.type === "feature_specification");
  const otherDocs = contextDocs.filter(
    (d) => !["meeting_transcript", "problem_definition", "solution_one_pager", "development_plan", "solution_overview", "getting_started", "feature_specification"].includes(d.type)
  );
  const unassignedDocs = documents.filter((d) => !d.projectId);
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleFileSelected = async (file: File) => {
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
    }
    // Auto-extract text from PDFs
    if (file.type === "application/pdf") {
      setExtractingPdf(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
        if (res.ok) {
          const { text } = await res.json();
          if (text) setUploadContent(text);
        }
      } catch {
        // Extraction failed — user can still upload the file without extracted text
      } finally {
        setExtractingPdf(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  };

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
        phase: uploadPhase,
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

  const handleUploadCoreDocument = async () => {
    if (!docUploadFile || !showDocUpload) return;
    setUploadingDoc(true);
    try {
      // Read file content
      const text = await docUploadFile.text();
      const titleMap: Record<string, string> = {
        problem_definition: "Problem Definition",
        solution_one_pager: "Solution One-Pager",
        development_plan: "Development Plan",
        solution_overview: "Solution Overview",
        getting_started: "Getting Started Guide",
      };

      // Upload file for storage
      let fileUrl = "";
      let fileName = "";
      const result = await uploadDocumentFile(contactId, docUploadFile);
      fileUrl = result.url;
      fileName = result.name;

      await addClientDocument(contactId, {
        title: titleMap[showDocUpload] || docUploadFile.name.replace(/\.[^.]+$/, ""),
        type: showDocUpload as "problem_definition" | "solution_one_pager" | "development_plan" | "solution_overview" | "getting_started",
        content: text,
        fileUrl,
        fileName,
        status: "draft",
        generatedBy: "manual",
        projectId: activeProjectId,
        phase: ["problem_definition", "solution_one_pager", "development_plan"].includes(showDocUpload) ? "initial_definition" : "",
      });
      setDocUploadFile(null);
      setShowDocUpload(null);
      await onDocumentsChanged();
    } finally {
      setUploadingDoc(false);
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
      const portalTokenId = await getOrCreatePortalToken(contactId);
      const portalUrl = `${baseUrl}/portal/${portalTokenId}`;

      // Send email — links to client portal
      const res = await fetch("/api/email/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName, contactEmail, companyName, portalUrl }),
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
      const transcript = discoveryMeetings[0];
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

  const handleGenerateSolutionOverview = async () => {
    if (!activeProject?.repoUrl) return;
    setGenerating("solution_overview");
    setGenerateError(null);
    try {
      // Parse owner/repo from URL like https://github.com/owner/repo
      const urlParts = activeProject.repoUrl.replace("https://github.com/", "").split("/");
      const repoOwner = urlParts[0];
      const repoName = urlParts[1];

      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "solution_overview",
          repoOwner,
          repoName,
          projectName: activeProject.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate solution overview");
      }

      const data = await res.json();
      const existing = solutionDocs.find((d) => d.type === "solution_overview");
      if (existing) {
        await saveRevisionAndUpdate(
          contactId,
          existing.id,
          { content: existing.content, title: existing.title, status: existing.status, version: existing.version || 1 },
          { content: data.content },
          "AI"
        );
        if (data.commitSha) {
          await updateClientDocument(contactId, existing.id, { generatedFromCommit: data.commitSha });
        }
      } else {
        await addClientDocument(contactId, {
          title: `Solution Overview — ${activeProject.name}`,
          type: "solution_overview",
          content: data.content,
          status: "draft",
          generatedBy: "ai",
          projectId: activeProjectId,
          generatedFromCommit: data.commitSha || "",
        });
      }
      await onDocumentsChanged();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate solution overview");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateGettingStarted = async () => {
    if (!activeProject?.repoUrl) return;
    setGenerating("getting_started");
    setGenerateError(null);
    try {
      const urlParts = activeProject.repoUrl.replace("https://github.com/", "").split("/");
      const repoOwner = urlParts[0];
      const repoName = urlParts[1];

      // Pass solution overview content as context if it exists
      const overviewDoc = solutionDocs.find((d) => d.type === "solution_overview");

      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "getting_started",
          repoOwner,
          repoName,
          projectName: activeProject.name,
          sourceContent: overviewDoc?.content || "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate getting started guide");
      }

      const data = await res.json();
      const existing = solutionDocs.find((d) => d.type === "getting_started");
      if (existing) {
        await saveRevisionAndUpdate(
          contactId,
          existing.id,
          { content: existing.content, title: existing.title, status: existing.status, version: existing.version || 1 },
          { content: data.content },
          "AI"
        );
        if (data.commitSha) {
          await updateClientDocument(contactId, existing.id, { generatedFromCommit: data.commitSha });
        }
      } else {
        await addClientDocument(contactId, {
          title: `Getting Started — ${activeProject.name}`,
          type: "getting_started",
          content: data.content,
          status: "draft",
          generatedBy: "ai",
          projectId: activeProjectId,
          generatedFromCommit: data.commitSha || "",
        });
      }
      await onDocumentsChanged();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate getting started guide");
    } finally {
      setGenerating(null);
    }
  };

  // Change requests state
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [solutionReviewSent, setSolutionReviewSent] = useState(false);
  const [sendingSolutionReview, setSendingSolutionReview] = useState(false);

  // Product updates state
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateSummary, setNewUpdateSummary] = useState("");
  const [selectedChangeRequestIds, setSelectedChangeRequestIds] = useState<string[]>([]);
  const [publishingUpdate, setPublishingUpdate] = useState(false);

  // Load change requests, product updates, and change log when project changes
  useEffect(() => {
    if (activeProjectId && activeProjectId !== "__unassigned__") {
      getChangeRequests(contactId, activeProjectId).then(setChangeRequests);
      getProductUpdates(contactId, activeProjectId).then(setProductUpdates);
      getChangeLogEntries(contactId, activeProjectId).then(setChangeLogEntries);
    }
  }, [contactId, activeProjectId, documents]);

  // Fetch current repo HEAD commit when active project has a repo
  useEffect(() => {
    if (!activeProject?.repoUrl) { setRepoHead(null); return; }
    const parts = activeProject.repoUrl.replace("https://github.com/", "").split("/");
    fetch(`/api/github?owner=${parts[0]}&repo=${parts[1]}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setRepoHead(data))
      .catch(() => setRepoHead(null));
  }, [activeProject?.repoUrl]);

  const handleSendSolutionForReview = async () => {
    setSendingSolutionReview(true);
    try {
      const tokenId = await createReviewToken({
        contactId,
        contactName,
        companyName,
        contactEmail,
        createdBy: actorName,
        projectId: activeProjectId,
        reviewType: "solution_assets",
      });

      const baseUrl = window.location.origin;
      const portalTokenId = await getOrCreatePortalToken(contactId);
      const portalUrl = `${baseUrl}/portal/${portalTokenId}`;

      const res = await fetch("/api/email/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName, contactEmail, companyName, reviewType: "solution_assets", portalUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }

      // Update solution doc statuses to "sent"
      for (const d of solutionDocs) {
        if (d.status === "draft") {
          await updateClientDocument(contactId, d.id, { status: "sent" });
        }
      }

      setSolutionReviewSent(true);
      await onDocumentsChanged();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to send solution review");
    } finally {
      setSendingSolutionReview(false);
    }
  };

  const handleChangeRequestStatus = async (requestId: string, status: ChangeRequest["status"]) => {
    await updateChangeRequest(contactId, requestId, { status });
    const updated = await getChangeRequests(contactId, activeProjectId);
    setChangeRequests(updated);
  };

  const handleDeleteChangeRequest = async (requestId: string, title: string) => {
    if (!confirm(`Delete feature request "${title}"? This cannot be undone.`)) return;
    await deleteChangeRequest(contactId, requestId);
    const updated = await getChangeRequests(contactId, activeProjectId);
    setChangeRequests(updated);
  };

  const handlePublishUpdate = async () => {
    if (!newUpdateTitle.trim() || !newUpdateSummary.trim()) return;
    setPublishingUpdate(true);
    try {
      await addProductUpdate(contactId, {
        projectId: activeProjectId,
        title: newUpdateTitle.trim(),
        summary: newUpdateSummary.trim(),
        changeRequestIds: selectedChangeRequestIds,
        createdBy: actorName,
      });
      // Mark addressed change requests as resolved
      for (const crId of selectedChangeRequestIds) {
        await updateChangeRequest(contactId, crId, { status: "resolved" });
      }
      const [updatedCRs, updatedPUs] = await Promise.all([
        getChangeRequests(contactId, activeProjectId),
        getProductUpdates(contactId, activeProjectId),
      ]);
      setChangeRequests(updatedCRs);
      setProductUpdates(updatedPUs);
      setNewUpdateTitle("");
      setNewUpdateSummary("");
      setSelectedChangeRequestIds([]);
      setShowNewUpdate(false);
    } finally {
      setPublishingUpdate(false);
    }
  };

  const handlePublishChangeLog = async () => {
    if (!newChangeLogTitle.trim() || !newChangeLogDescription.trim()) return;
    setPublishingChangeLog(true);
    try {
      await addChangeLogEntry(contactId, {
        projectId: activeProjectId,
        title: newChangeLogTitle.trim(),
        description: newChangeLogDescription.trim(),
        version: newChangeLogVersion.trim(),
        category: newChangeLogCategory,
        relatedChangeRequestIds: selectedChangeRequestIds,
        createdBy: actorName,
        createdByRole: "admin",
      });
      // Mark addressed change requests as resolved
      for (const crId of selectedChangeRequestIds) {
        await updateChangeRequest(contactId, crId, { status: "resolved" });
      }
      const [updatedCRs, updatedCLs] = await Promise.all([
        getChangeRequests(contactId, activeProjectId),
        getChangeLogEntries(contactId, activeProjectId),
      ]);
      setChangeRequests(updatedCRs);
      setChangeLogEntries(updatedCLs);
      setNewChangeLogTitle("");
      setNewChangeLogDescription("");
      setNewChangeLogVersion("");
      setNewChangeLogCategory("improvement");
      setSelectedChangeRequestIds([]);
      setShowNewChangeLog(false);
    } finally {
      setPublishingChangeLog(false);
    }
  };

  const handleAddRequest = async () => {
    if (!newRequestTitle.trim()) return;
    setSubmittingRequest(true);
    try {
      await addChangeRequest(contactId, activeProjectId, {
        title: newRequestTitle.trim(),
        description: newRequestDescription.trim(),
        priority: newRequestPriority,
        author: actorName,
        source: "admin",
      });
      const updated = await getChangeRequests(contactId, activeProjectId);
      setChangeRequests(updated);
      setNewRequestTitle("");
      setNewRequestDescription("");
      setNewRequestPriority("medium");
      setShowAddRequest(false);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleStartEditRequest = (cr: ChangeRequest) => {
    setEditingRequestId(cr.id);
    setEditRequestTitle(cr.title);
    setEditRequestDescription(cr.description);
    setEditRequestPriority(cr.priority);
  };

  const handleSaveEditRequest = async () => {
    if (!editingRequestId || !editRequestTitle.trim()) return;
    setSavingRequest(true);
    try {
      await updateChangeRequest(contactId, editingRequestId, {
        title: editRequestTitle.trim(),
        description: editRequestDescription.trim(),
        priority: editRequestPriority,
      });
      const updated = await getChangeRequests(contactId, activeProjectId);
      setChangeRequests(updated);
      setEditingRequestId(null);
    } finally {
      setSavingRequest(false);
    }
  };

  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const handleDeleteDocument = async (doc: ClientDocument) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    setDeletingDocId(doc.id);
    try {
      await deleteClientDocument(contactId, doc.id);
      if (viewingDoc?.id === doc.id) {
        setViewingDoc(null);
      }
      await onDocumentsChanged();
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleGenerateFeatureDoc = async () => {
    if (selectedMinuteIds.length === 0 && selectedRequestIds.length === 0 && !featureDocNotes.trim()) return;
    setGeneratingFeatureDoc(true);
    try {
      // Build inputs array from selected assets
      const inputs: { type: "meeting_minutes" | "feature_request" | "notes"; title: string; content: string }[] = [];

      for (const id of selectedMinuteIds) {
        const doc = maintenanceMeetings.find((d) => d.id === id);
        if (doc) inputs.push({ type: "meeting_minutes", title: doc.title, content: doc.content });
      }
      for (const id of selectedRequestIds) {
        const cr = changeRequests.find((r) => r.id === id);
        if (cr) inputs.push({ type: "feature_request", title: cr.title, content: `${cr.title}\n\nPriority: ${cr.priority}\n\n${cr.description}` });
      }
      if (featureDocNotes.trim()) {
        inputs.push({ type: "notes", title: "Additional Context", content: featureDocNotes.trim() });
      }

      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feature_specification", inputs }),
      });

      if (!res.ok) throw new Error("Failed to generate feature specification");
      const { content } = await res.json();

      // Save as a new document
      const docRef = await addClientDocument(contactId, {
        title: "Feature Specification",
        type: "feature_specification",
        content,
        status: "draft",
        generatedBy: "ai",
        projectId: activeProjectId,
        phase: "maintenance",
      });

      // Link selected change requests to this doc and lock them
      for (const id of selectedRequestIds) {
        await updateChangeRequest(contactId, id, { status: "in_progress", linkedDocumentId: docRef.id });
      }

      // Reset form
      setShowCreateFeatureDoc(false);
      setSelectedMinuteIds([]);
      setSelectedRequestIds([]);
      setFeatureDocNotes("");
      await onDocumentsChanged();
      const updatedCRs = await getChangeRequests(contactId, activeProjectId);
      setChangeRequests(updatedCRs);
    } catch (err) {
      console.error("Feature doc generation error:", err);
    } finally {
      setGeneratingFeatureDoc(false);
    }
  };

  const handleSavePaymentConfig = async () => {
    if (!activeProject) return;
    setSavingPayment(true);
    try {
      await updateProject(activeProject.id, {
        retainerAmount: parseFloat(retainerInput) || 0,
        monthlyRate: parseFloat(monthlyInput) || 0,
      });
      const updated = await getProjectsForContact(contactId);
      setProjects(updated);
      setShowPaymentConfig(false);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!activeProject || !activeProject.retainerAmount || !activeProject.monthlyRate) return;
    setSendingInvoice(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          contactId,
          contactName,
          contactEmail,
          companyName,
          projectName: activeProject.name,
          retainerAmount: activeProject.retainerAmount,
          monthlyRate: activeProject.monthlyRate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const data = await res.json();
      // Update project with Stripe customer ID
      if (data.customerId) {
        await updateProject(activeProject.id, { stripeCustomerId: data.customerId });
      }
      // Open checkout in new tab for admin to share or copy
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
      }
      const updated = await getProjectsForContact(contactId);
      setProjects(updated);
    } catch (err) {
      console.error("Invoice error:", err);
    } finally {
      setSendingInvoice(false);
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

  // Sync admin notes when viewing a document
  useEffect(() => {
    if (viewingDoc) {
      setAdminNotes(viewingDoc.adminNotes || "");
      setAdminNotesOriginal(viewingDoc.adminNotes || "");
    }
  }, [viewingDoc?.id]);

  const handleSaveAdminNotes = async () => {
    if (!viewingDoc) return;
    setSavingNotes(true);
    try {
      await updateClientDocument(contactId, viewingDoc.id, { adminNotes });
      setAdminNotesOriginal(adminNotes);
      await onDocumentsChanged();
    } finally {
      setSavingNotes(false);
    }
  };

  const isProductDoc = viewingDoc && ["problem_definition", "solution_one_pager", "development_plan"].includes(viewingDoc.type);
  const isDevDoc = viewingDoc && ["development_plan", "feature_specification", "problem_definition", "solution_one_pager", "solution_overview"].includes(viewingDoc.type);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

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
              {" · "}{viewingDoc.updatedAt?.toLocaleString() || viewingDoc.createdAt?.toLocaleString() || "—"}
            </p>
            {viewingDoc.generatedFromCommit && (
              <p className="text-[10px] text-muted mt-1">
                Generated from commit <span className="font-mono bg-neutral px-1.5 py-0.5 rounded border border-border">{viewingDoc.generatedFromCommit.slice(0, 7)}</span>
                {repoHead && viewingDoc.generatedFromCommit !== repoHead.sha && (
                  <span className="text-amber-600 font-medium ml-1.5">· codebase has changed</span>
                )}
                {repoHead && viewingDoc.generatedFromCommit === repoHead.sha && (
                  <span className="text-emerald-600 font-medium ml-1.5">· up to date</span>
                )}
              </p>
            )}
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
            <button
              onClick={() => handleDeleteDocument(viewingDoc)}
              disabled={deletingDocId === viewingDoc.id}
              title="Delete document"
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              {deletingDocId === viewingDoc.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* Download / Copy buttons */}
        {displayContent && (
          <div className="flex gap-2 flex-wrap mb-4">
            {isProductDoc && (
              <>
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
              </>
            )}
            {isDevDoc && (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(displayContent);
                    setCopiedMarkdown(true);
                    setTimeout(() => setCopiedMarkdown(false), 2000);
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-charcoal/10 text-charcoal hover:bg-charcoal/20 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  {copiedMarkdown ? "Copied!" : "Copy Markdown"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([displayContent], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${viewingDoc.title.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-")}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download .md
                </button>
              </>
            )}
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

        {/* Admin Notes - Starred Section (read-only display at top) */}
        {adminNotesOriginal && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-bold text-amber-800 uppercase tracking-wide">CrumbLabz Notes</span>
            </div>
            <div className="prose prose-sm max-w-none text-amber-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{adminNotesOriginal}</ReactMarkdown>
            </div>
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children, ...props }) => (
                  <div style={{ overflowX: "auto" }}>
                    <table {...props}>{children}</table>
                  </div>
                ),
              }}
            >{displayContent}</ReactMarkdown>
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

        {/* Admin Notes - Editable Section (at bottom) */}
        <div className="mt-6 border-t border-border pt-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            CrumbLabz Notes
          </h4>
          <p className="text-xs text-muted mb-2">Internal notes visible to the client when reviewing this document. Supports markdown.</p>
          <textarea
            className="w-full border border-border rounded-lg p-3 text-sm bg-white resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Add key information, instructions, or notes for the client..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <div className="flex justify-end mt-2 gap-3">
            {adminNotes !== adminNotesOriginal && (
              <button
                onClick={() => { setAdminNotes(adminNotesOriginal); }}
                className="text-xs text-muted hover:text-charcoal"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveAdminNotes}
              disabled={savingNotes || adminNotes === adminNotesOriginal}
              className="text-xs font-medium px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
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
            editingProjectId === p.id ? (
              <div key={p.id} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editingProjectNameValue}
                  onChange={(e) => setEditingProjectNameValue(e.target.value)}
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && editingProjectNameValue.trim()) {
                      await updateProject(p.id, { name: editingProjectNameValue.trim() });
                      const updated = await getProjectsForContact(contactId);
                      setProjects(updated);
                      setEditingProjectId(null);
                    }
                    if (e.key === "Escape") setEditingProjectId(null);
                  }}
                  onBlur={async () => {
                    if (editingProjectNameValue.trim() && editingProjectNameValue.trim() !== p.name) {
                      await updateProject(p.id, { name: editingProjectNameValue.trim() });
                      const updated = await getProjectsForContact(contactId);
                      setProjects(updated);
                    }
                    setEditingProjectId(null);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 w-48"
                />
              </div>
            ) : (
              <button
                key={p.id}
                onClick={() => { setActiveProjectId(p.id); setShowUpload(false); setReviewSent(false); setShowNewProjectInput(false); }}
                onDoubleClick={() => { setEditingProjectId(p.id); setEditingProjectNameValue(p.name); }}
                title="Double-click to rename"
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                  activeProjectId === p.id
                    ? "bg-charcoal text-white"
                    : "bg-neutral text-muted hover:bg-border"
                }`}
              >
                {p.name}
              </button>
            )
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

      {/* ===== VIEW CLIENT PORTAL ===== */}
      <div>
        <button
          onClick={async () => {
            const tokenId = await getOrCreatePortalToken(contactId);
            window.open(`/portal/${tokenId}`, "_blank");
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-accent/20 bg-accent/5 text-accent text-sm font-medium hover:bg-accent/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
          </svg>
          View Client Portal
        </button>
      </div>

      {/* ===== BILLING (top) ===== */}
      {activeProjectId && activeProjectId !== "__unassigned__" ? <>{activeProject && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Billing</h3>

          {/* Payment status badge */}
          {activeProject.paymentStatus !== "unpaid" && (
            <div className={`mb-3 px-4 py-3 rounded-lg flex items-center gap-2 ${
              activeProject.paymentStatus === "active" ? "bg-emerald-500/10 border border-emerald-500/20" :
              activeProject.paymentStatus === "retainer_paid" ? "bg-blue-500/10 border border-blue-500/20" :
              activeProject.paymentStatus === "past_due" ? "bg-red-500/10 border border-red-500/20" :
              "bg-neutral border border-border"
            }`}>
              <span className={`text-xs font-bold uppercase ${
                activeProject.paymentStatus === "active" ? "text-emerald-700" :
                activeProject.paymentStatus === "retainer_paid" ? "text-blue-700" :
                activeProject.paymentStatus === "past_due" ? "text-red-700" :
                "text-muted"
              }`}>
                {activeProject.paymentStatus === "retainer_paid" ? "Retainer Paid" :
                 activeProject.paymentStatus === "active" ? "Subscription Active" :
                 activeProject.paymentStatus === "past_due" ? "Past Due" :
                 "Cancelled"}
              </span>
              {activeProject.retainerAmount > 0 && (
                <span className="text-xs text-muted">
                  · ${activeProject.retainerAmount.toLocaleString()} retainer + ${activeProject.monthlyRate.toLocaleString()}/mo
                </span>
              )}
            </div>
          )}

          {/* Config / Send Invoice */}
          {activeProject.paymentStatus === "unpaid" && (
            <div className="space-y-3">
              {activeProject.retainerAmount > 0 && activeProject.monthlyRate > 0 && !showPaymentConfig ? (
                <div className="bg-neutral rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        ${activeProject.retainerAmount.toLocaleString()} retainer + ${activeProject.monthlyRate.toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-muted">Payment not yet initiated</p>
                    </div>
                    <button
                      onClick={() => { setShowPaymentConfig(true); setRetainerInput(activeProject.retainerAmount.toString()); setMonthlyInput(activeProject.monthlyRate.toString()); }}
                      className="text-xs text-muted hover:text-charcoal transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={handleSendInvoice}
                    disabled={sendingInvoice}
                    className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {sendingInvoice ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                        Generate Payment Link
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-neutral rounded-lg p-4 space-y-3">
                  <p className="text-xs font-medium text-muted">Set the retainer and monthly rate for this project.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted block mb-1">Retainer ($)</label>
                      <input
                        type="number"
                        value={retainerInput || (showPaymentConfig ? "" : "")}
                        onChange={(e) => setRetainerInput(e.target.value)}
                        placeholder="e.g. 2500"
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted block mb-1">Monthly Rate ($)</label>
                      <input
                        type="number"
                        value={monthlyInput || (showPaymentConfig ? "" : "")}
                        onChange={(e) => setMonthlyInput(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePaymentConfig}
                      disabled={savingPayment || !retainerInput || !monthlyInput}
                      className="text-sm font-medium px-4 py-2 rounded-lg bg-charcoal text-white hover:bg-charcoal-light disabled:opacity-40 transition-colors"
                    >
                      {savingPayment ? "Saving..." : "Save"}
                    </button>
                    {showPaymentConfig && (
                      <button
                        onClick={() => setShowPaymentConfig(false)}
                        className="text-sm text-muted hover:text-charcoal transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== DISCOVERY ===== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Discovery</h3>
          <button
            onClick={() => { setShowUpload(!showUpload); setUploadPhase("discovery"); }}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {showUpload && uploadPhase === "discovery" ? "Cancel" : "+ Add Transcript"}
          </button>
        </div>

        {showUpload && uploadPhase === "discovery" && (
          <div
            className={`bg-neutral rounded-lg p-4 mb-3 space-y-3 ${dragOver ? "ring-2 ring-accent" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="text"
              placeholder="Meeting title (e.g. Discovery Call — Acme Corp)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
            <label className={`flex items-center justify-center gap-2 w-full px-4 py-6 rounded-lg border-2 border-dashed text-sm cursor-pointer transition-colors ${
              dragOver ? "border-accent bg-accent/10 text-accent" : uploadFile ? "border-accent bg-accent/5 text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              {extractingPdf ? "Extracting text from PDF..." : uploadFile ? uploadFile.name : "Drop a file here or click to browse (PDF, DOC, TXT)"}
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelected(file); }} />
            </label>
            {uploadFile && <button onClick={() => { setUploadFile(null); setUploadContent(""); }} className="text-xs text-muted hover:text-red-600 transition-colors">Remove file</button>}
            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted">and/or add notes</span><div className="flex-1 h-px bg-border" /></div>
            <textarea placeholder="Paste meeting transcript or notes..." value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} rows={6} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-y" />
            <button onClick={handleUploadDocument} disabled={uploading || extractingPdf || !uploadTitle.trim() || (!uploadContent.trim() && !uploadFile)} className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {uploading ? "Uploading..." : "Save Document"}
            </button>
          </div>
        )}

        {discoveryMeetings.length === 0 && !(showUpload && uploadPhase === "discovery") ? (
          <p className="text-muted text-xs">No discovery documents yet. Add a transcript to get started.</p>
        ) : (
          <div className="space-y-2">
            {discoveryMeetings.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
            ))}
          </div>
        )}
      </div>

      {/* ===== INITIAL DEFINITION ===== */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-1">Initial Definition</h3>
        <p className="text-xs text-muted mb-3">Discovery transcripts, problem definition, solution one-pager, and development plan — the foundation for every project.</p>

        {/* Generate / Upload buttons */}
        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => setShowDocUpload(showDocUpload ? null : "pick_initial")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${showDocUpload?.startsWith("pick_initial") || ["problem_definition", "solution_one_pager", "development_plan"].includes(showDocUpload || "") ? "bg-charcoal text-white" : "bg-charcoal/10 text-charcoal hover:bg-charcoal/20"}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            Upload
          </button>
          <button
            onClick={() => handleGenerate("problem_definition")}
            disabled={discoveryMeetings.length === 0 || generating !== null}
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

        {/* Upload core document form */}
        {showDocUpload && (showDocUpload === "pick_initial" || ["problem_definition", "solution_one_pager", "development_plan"].includes(showDocUpload)) && (
          <div className="mb-3 bg-neutral rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-charcoal">Upload Document</p>
            {showDocUpload === "pick_initial" ? (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowDocUpload("problem_definition")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors">Problem Definition</button>
                <button onClick={() => setShowDocUpload("solution_one_pager")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 transition-colors">Solution One-Pager</button>
                <button onClick={() => setShowDocUpload("development_plan")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">Development Plan</button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted">
                  Uploading as: <span className="font-medium text-charcoal">{showDocUpload === "problem_definition" ? "Problem Definition" : showDocUpload === "solution_one_pager" ? "Solution One-Pager" : "Development Plan"}</span>
                </p>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-accent cursor-pointer transition-colors">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                  <span className="text-xs text-muted">{docUploadFile ? docUploadFile.name : "Choose .md file..."}</span>
                  <input type="file" accept=".md,.markdown,.txt" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setDocUploadFile(e.target.files[0]); }} />
                </label>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowDocUpload(null); setDocUploadFile(null); }} className="text-xs text-muted hover:text-charcoal px-3 py-1.5 transition-colors">Cancel</button>
                  <button onClick={handleUploadCoreDocument} disabled={!docUploadFile || uploadingDoc} className="text-xs font-medium px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-colors">
                    {uploadingDoc ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {generating && ["problem_definition", "solution_one_pager", "development_plan"].includes(generating) && (
          <GeneratingProgress label={
            generating === "problem_definition" ? "Generating Problem Definition" :
            generating === "solution_one_pager" ? "Generating Solution One-Pager" :
            "Generating Development Plan"
          } />
        )}

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

        {discoveryMeetings.length === 0 && productDocs.length === 0 && (
          <p className="text-muted text-xs">Add a discovery transcript first, then generate definition documents from it.</p>
        )}

        {productDocs.length > 0 && (
          <div className="space-y-2">
            {productDocs.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
            ))}
          </div>
        )}

        {/* Definition-phase meeting minutes */}
        {definitionMeetings.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-charcoal mb-2">Meeting Minutes</h4>
            <div className="space-y-2">
              {definitionMeetings.map((d) => (
                <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => { setShowUpload(true); setUploadPhase("initial_definition"); }}
          className="text-xs text-muted hover:text-accent transition-colors mt-2"
        >
          + Add meeting minutes to this phase
        </button>
        {showUpload && uploadPhase === "initial_definition" && (
          <div
            className={`bg-neutral rounded-lg p-4 mt-2 space-y-3 ${dragOver ? "ring-2 ring-accent" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="text" placeholder="Meeting title..." value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            <label className={`flex items-center justify-center gap-2 w-full px-4 py-6 rounded-lg border-2 border-dashed text-sm cursor-pointer transition-colors ${
              dragOver ? "border-accent bg-accent/10 text-accent" : uploadFile ? "border-accent bg-accent/5 text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              {extractingPdf ? "Extracting text from PDF..." : uploadFile ? uploadFile.name : "Drop a file here or click to browse"}
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelected(file); }} />
            </label>
            {uploadFile && <button onClick={() => { setUploadFile(null); setUploadContent(""); }} className="text-xs text-muted hover:text-red-600 transition-colors">Remove file</button>}
            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted">and/or add notes</span><div className="flex-1 h-px bg-border" /></div>
            <textarea placeholder="Paste transcript or notes..." value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y" />
            <div className="flex gap-2">
              <button onClick={handleUploadDocument} disabled={uploading || extractingPdf || !uploadTitle.trim() || (!uploadContent.trim() && !uploadFile)} className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{uploading ? "Uploading..." : "Save"}</button>
              <button onClick={() => setShowUpload(false)} className="text-sm text-muted hover:text-charcoal transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ===== SOLUTION ASSETS ===== */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-1">Solution Assets</h3>
        <p className="text-xs text-muted mb-3">GitHub repository, solution overview, and getting started guide — client-facing deliverables generated from the codebase.</p>

        {/* Create GitHub Repository */}
        {activeProject && !activeProject.repoUrl && (
          <div className="mb-3">
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
          </div>
        )}

        {createProjectError && (
          <div className="mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{createProjectError}</p>
          </div>
        )}

        {activeProject?.repoUrl ? (
          <div className="space-y-3">
            {/* GitHub Repository Link + Version Info */}
            <div className="bg-neutral rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-charcoal flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <a
                  href={activeProject.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-charcoal hover:text-accent transition-colors"
                >
                  {activeProject.repoUrl.replace("https://github.com/", "")}
                </a>
              </div>
              {repoHead && (
                <div className="text-xs text-muted flex items-center gap-1.5">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-border">{repoHead.sha.slice(0, 7)}</span>
                  <span className="truncate">{repoHead.message}</span>
                  <span className="shrink-0">· {new Date(repoHead.date).toLocaleDateString()}</span>
                </div>
              )}
              {/* Version mismatch indicator */}
              {repoHead && solutionDocs.length > 0 && (() => {
                const docsWithCommit = solutionDocs.filter((d) => d.generatedFromCommit);
                if (docsWithCommit.length === 0) return null;
                const allMatch = docsWithCommit.every((d) => d.generatedFromCommit === repoHead.sha);
                return allMatch ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Documents are up to date with the latest commit
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    Codebase has changed since documents were generated — consider regenerating
                  </div>
                );
              })()}
            </div>

            {/* Generate / Upload buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowDocUpload(showDocUpload ? null : "pick_solution")}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${showDocUpload?.startsWith("pick_solution") || ["solution_overview", "getting_started"].includes(showDocUpload || "") ? "bg-charcoal text-white" : "bg-charcoal/10 text-charcoal hover:bg-charcoal/20"}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Upload
              </button>
              <button
                onClick={handleGenerateSolutionOverview}
                disabled={generating !== null}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {generating === "solution_overview" ? (
                  <>
                    <span className="w-3 h-3 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                    Generating...
                  </>
                ) : solutionDocs.some((d) => d.type === "solution_overview") ? (
                  "Regenerate Solution Overview"
                ) : (
                  "Generate Solution Overview"
                )}
              </button>
              <button
                onClick={handleGenerateGettingStarted}
                disabled={generating !== null || !solutionDocs.some((d) => d.type === "solution_overview")}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {generating === "getting_started" ? (
                  <>
                    <span className="w-3 h-3 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
                    Generating...
                  </>
                ) : solutionDocs.some((d) => d.type === "getting_started") ? (
                  "Regenerate Getting Started Guide"
                ) : (
                  "Generate Getting Started Guide"
                )}
              </button>
            </div>

            {/* Upload solution document form */}
            {showDocUpload && (showDocUpload === "pick_solution" || ["solution_overview", "getting_started"].includes(showDocUpload)) && (
              <div className="bg-neutral rounded-lg p-4 space-y-3">
                <p className="text-xs font-bold text-charcoal">Upload Document</p>
                {showDocUpload === "pick_solution" ? (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowDocUpload("solution_overview")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-colors">Solution Overview</button>
                    <button onClick={() => setShowDocUpload("getting_started")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 transition-colors">Getting Started Guide</button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted">
                      Uploading as: <span className="font-medium text-charcoal">{showDocUpload === "solution_overview" ? "Solution Overview" : "Getting Started Guide"}</span>
                    </p>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-accent cursor-pointer transition-colors">
                      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                      <span className="text-xs text-muted">{docUploadFile ? docUploadFile.name : "Choose .md file..."}</span>
                      <input type="file" accept=".md,.markdown,.txt" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setDocUploadFile(e.target.files[0]); }} />
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setShowDocUpload(null); setDocUploadFile(null); }} className="text-xs text-muted hover:text-charcoal px-3 py-1.5 transition-colors">Cancel</button>
                      <button onClick={handleUploadCoreDocument} disabled={!docUploadFile || uploadingDoc} className="text-xs font-medium px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-colors">
                        {uploadingDoc ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {generating && ["solution_overview", "getting_started"].includes(generating) && (
              <GeneratingProgress label={
                generating === "solution_overview" ? "Generating Solution Overview" : "Generating Getting Started Guide"
              } />
            )}

            {/* Solution doc cards */}
            {solutionDocs.length > 0 && (
              <div className="space-y-2">
                {solutionDocs.map((d) => (
                  <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
                ))}
              </div>
            )}

            {solutionDocs.length === 0 && !generating && (
              <p className="text-muted text-xs">Generate a solution overview to create client-facing tech documentation from the GitHub repository.</p>
            )}

            {/* Send Solution Assets for Review */}
            {solutionDocs.length > 0 && !generating && (
              <div>
                {solutionReviewSent ? (
                  <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <p className="text-sm text-blue-700 font-medium">Solution assets sent to {contactEmail} for review.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleSendSolutionForReview}
                    disabled={sendingSolutionReview}
                    className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {sendingSolutionReview ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        Send Solution to Client for Review
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

          </div>
        ) : !activeProject || activeProject.repoUrl ? (
          <p className="text-muted text-xs">Create a project and GitHub repository to generate solution assets.</p>
        ) : null}
      </div>

      {/* ===== MAINTENANCE & CONTINUOUS DEVELOPMENT (sub-section of Solution Assets) ===== */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Maintenance &amp; Continuous Development</h3>
        <div className="space-y-4">

          {/* Maintenance Meeting Minutes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-charcoal">Meeting Minutes</h4>
              <button
                onClick={() => { setShowUpload(true); setUploadPhase("maintenance"); }}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                + Add Minutes
              </button>
            </div>
            {showUpload && uploadPhase === "maintenance" && (
              <div
                className={`bg-neutral rounded-lg p-4 mb-3 space-y-3 ${dragOver ? "ring-2 ring-accent" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="text" placeholder="Meeting title..." value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                <label className={`flex items-center justify-center gap-2 w-full px-4 py-6 rounded-lg border-2 border-dashed text-sm cursor-pointer transition-colors ${
                  dragOver ? "border-accent bg-accent/10 text-accent" : uploadFile ? "border-accent bg-accent/5 text-accent" : "border-border text-muted hover:border-accent hover:text-accent"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  {extractingPdf ? "Extracting text from PDF..." : uploadFile ? uploadFile.name : "Drop a file here or click to browse"}
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelected(file); }} />
                </label>
                {uploadFile && <button onClick={() => { setUploadFile(null); setUploadContent(""); }} className="text-xs text-muted hover:text-red-600 transition-colors">Remove file</button>}
                <div className="flex items-center gap-2"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted">and/or add notes</span><div className="flex-1 h-px bg-border" /></div>
                <textarea placeholder="Paste transcript or notes..." value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y" />
                <div className="flex gap-2">
                  <button onClick={handleUploadDocument} disabled={uploading || extractingPdf || !uploadTitle.trim() || (!uploadContent.trim() && !uploadFile)} className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{uploading ? "Uploading..." : "Save"}</button>
                  <button onClick={() => setShowUpload(false)} className="text-sm text-muted hover:text-charcoal transition-colors">Cancel</button>
                </div>
              </div>
            )}
            {maintenanceMeetings.length === 0 ? (
              <p className="text-muted text-xs">No maintenance meeting minutes yet.</p>
            ) : (
              <div className="space-y-2">
                {maintenanceMeetings.map((d) => (
                  <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
                ))}
              </div>
            )}
          </div>

          {/* Feature Requests — ticket-style items from clients or CrumbLabz */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-charcoal">Feature Requests</h4>
              <button
                onClick={() => setShowAddRequest(!showAddRequest)}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                {showAddRequest ? "Cancel" : "+ Add Request"}
              </button>
            </div>

            {showAddRequest && (
              <div className="bg-neutral rounded-lg p-4 mb-3 space-y-3">
                <input
                  type="text"
                  placeholder="Request title..."
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <textarea
                  placeholder="Describe the request..."
                  value={newRequestDescription}
                  onChange={(e) => setNewRequestDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-muted">Priority:</span>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewRequestPriority(p)}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-colors ${
                        newRequestPriority === p
                          ? p === "high" ? "bg-red-500/20 text-red-700" : p === "medium" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/20 text-blue-700"
                          : "bg-neutral text-muted hover:bg-border"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddRequest}
                  disabled={submittingRequest || !newRequestTitle.trim()}
                  className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {submittingRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}

            {changeRequests.length === 0 && !showAddRequest ? (
              <p className="text-muted text-xs">No requests yet. Clients can submit from the portal, or add one above.</p>
            ) : (
              <div className="space-y-2">
                {changeRequests.map((cr) => {
                  const isLocked = !!cr.linkedDocumentId;
                  const isEditing = editingRequestId === cr.id;

                  if (isEditing) {
                    return (
                      <div key={cr.id} className="bg-neutral rounded-lg p-3 space-y-2 ring-2 ring-accent/30">
                        <input type="text" value={editRequestTitle} onChange={(e) => setEditRequestTitle(e.target.value)} className="w-full px-2 py-1.5 rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                        <textarea value={editRequestDescription} onChange={(e) => setEditRequestDescription(e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-muted">Priority:</span>
                          {(["low", "medium", "high"] as const).map((p) => (
                            <button key={p} onClick={() => setEditRequestPriority(p)} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-colors ${editRequestPriority === p ? (p === "high" ? "bg-red-500/20 text-red-700" : p === "medium" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/20 text-blue-700") : "bg-neutral text-muted hover:bg-border"}`}>{p}</button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSaveEditRequest} disabled={savingRequest || !editRequestTitle.trim()} className="bg-charcoal hover:bg-charcoal-light disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">{savingRequest ? "Saving..." : "Save"}</button>
                          <button onClick={() => setEditingRequestId(null)} className="text-xs text-muted hover:text-charcoal transition-colors">Cancel</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={cr.id} className={`bg-neutral rounded-lg p-3 relative ${isLocked ? "opacity-75" : ""}`}>
                      {!isLocked && (
                        <button
                          onClick={() => handleDeleteChangeRequest(cr.id, cr.title)}
                          title="Delete feature request"
                          className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-700 transition-colors text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isLocked && (
                            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                          )}
                          <h5 className="text-sm font-medium">{cr.title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isLocked && cr.status === "open" && (
                            <button onClick={() => handleStartEditRequest(cr)} title="Edit request" className="text-[10px] text-accent hover:text-accent-hover transition-colors">Edit</button>
                          )}
                          {cr.source && cr.source !== "review" && (
                            <span className="text-[10px] text-muted capitalize">{cr.source.replace("_", " ")}</span>
                          )}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cr.priority === "high" ? "bg-red-500/10 text-red-700"
                              : cr.priority === "medium" ? "bg-amber-500/10 text-amber-700"
                                : "bg-blue-500/10 text-blue-700"
                          }`}>{cr.priority}</span>
                          <select
                            value={cr.status}
                            onChange={(e) => handleChangeRequestStatus(cr.id, e.target.value as ChangeRequest["status"])}
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border-0 cursor-pointer ${
                              cr.status === "open" ? "bg-blue-500/10 text-blue-700"
                                : cr.status === "in_progress" ? "bg-amber-500/10 text-amber-700"
                                  : cr.status === "resolved" ? "bg-emerald-500/10 text-emerald-700"
                                    : "bg-neutral text-muted"
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-muted">{cr.description}</p>
                      <p className="text-[10px] text-muted mt-1">
                        {cr.author} · {cr.createdAt?.toLocaleDateString() || "—"}
                        {isLocked && " · Linked to spec"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feature Backlog — formal specs promoted from meetings + requests */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-charcoal">Feature Backlog</h4>
              <button
                onClick={() => setShowCreateFeatureDoc(!showCreateFeatureDoc)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 transition-colors"
              >
                {showCreateFeatureDoc ? "Cancel" : "+ Create Spec"}
              </button>
            </div>

            {/* Create Feature Spec — multi-select inputs */}
            {showCreateFeatureDoc && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-3 space-y-3">
                <p className="text-xs text-violet-700 font-medium">Select meeting minutes and/or feature requests to promote into a formal feature specification.</p>

                {/* Meeting Minutes selection */}
                {maintenanceMeetings.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted mb-1.5">Meeting Minutes</p>
                    <div className="space-y-1.5">
                      {maintenanceMeetings.map((d) => (
                        <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMinuteIds.includes(d.id)}
                            onChange={(e) => setSelectedMinuteIds(e.target.checked ? [...selectedMinuteIds, d.id] : selectedMinuteIds.filter((id) => id !== d.id))}
                            className="rounded border-border"
                          />
                          <span>{d.title}</span>
                          <span className="text-[10px] text-muted">{d.createdAt?.toLocaleDateString() || ""}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Request selection */}
                {changeRequests.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted mb-1.5">Feature Requests</p>
                    <div className="space-y-1.5">
                      {changeRequests.map((cr) => (
                        <label key={cr.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRequestIds.includes(cr.id)}
                            onChange={(e) => setSelectedRequestIds(e.target.checked ? [...selectedRequestIds, cr.id] : selectedRequestIds.filter((id) => id !== cr.id))}
                            className="rounded border-border"
                          />
                          <span>{cr.title}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${cr.priority === "high" ? "bg-red-500/10 text-red-700" : cr.priority === "medium" ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-blue-700"}`}>{cr.priority}</span>
                          {cr.source && cr.source !== "review" && <span className="text-[10px] text-muted capitalize">{cr.source.replace("_", " ")}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional notes */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted mb-1.5">Additional Context (optional)</p>
                  <textarea
                    value={featureDocNotes}
                    onChange={(e) => setFeatureDocNotes(e.target.value)}
                    placeholder="Add any extra context, requirements, or notes for the feature spec..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 resize-y"
                  />
                </div>

                {!generatingFeatureDoc && (
                  <button
                    onClick={handleGenerateFeatureDoc}
                    disabled={selectedMinuteIds.length === 0 && selectedRequestIds.length === 0 && !featureDocNotes.trim()}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Generate Feature Specification
                  </button>
                )}
              </div>
            )}

            {generatingFeatureDoc && (
              <GeneratingProgress label="Generating Feature Specification" />
            )}

            {featureDocs.length === 0 && !showCreateFeatureDoc ? (
              <p className="text-muted text-xs">No feature specs yet. Promote meeting minutes and feature requests into formal specifications.</p>
            ) : (
              <div className="space-y-2">
                {featureDocs.map((d) => (
                  <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
                ))}
              </div>
            )}
          </div>

          {/* Change Log */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-charcoal">Change Log</h4>
              <button
                onClick={() => setShowNewChangeLog(!showNewChangeLog)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
              >
                {showNewChangeLog ? "Cancel" : "+ Add Entry"}
              </button>
            </div>

            {showNewChangeLog && (
              <div className="bg-neutral rounded-lg p-4 mb-3 space-y-3">
                <input
                  type="text"
                  placeholder="Title (e.g. v1.1 — Dashboard Improvements)"
                  value={newChangeLogTitle}
                  onChange={(e) => setNewChangeLogTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted block mb-1">Version</label>
                    <input
                      type="text"
                      value={newChangeLogVersion}
                      onChange={(e) => setNewChangeLogVersion(e.target.value)}
                      placeholder="e.g. v1.1"
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted block mb-1">Category</label>
                    <select
                      value={newChangeLogCategory}
                      onChange={(e) => setNewChangeLogCategory(e.target.value as ChangeLogEntry["category"])}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
                    >
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="bugfix">Bug Fix</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <textarea
                  placeholder="Describe what changed..."
                  value={newChangeLogDescription}
                  onChange={(e) => setNewChangeLogDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
                />

                {/* Link change requests */}
                {changeRequests.filter((cr) => cr.status !== "resolved" && cr.status !== "closed").length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted mb-2">Addressed requests:</p>
                    <div className="space-y-1.5">
                      {changeRequests.filter((cr) => cr.status !== "resolved" && cr.status !== "closed").map((cr) => (
                        <label key={cr.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChangeRequestIds.includes(cr.id)}
                            onChange={(e) => setSelectedChangeRequestIds(e.target.checked ? [...selectedChangeRequestIds, cr.id] : selectedChangeRequestIds.filter((id) => id !== cr.id))}
                            className="rounded border-border"
                          />
                          <span>{cr.title}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${cr.priority === "high" ? "bg-red-500/10 text-red-700" : cr.priority === "medium" ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-blue-700"}`}>{cr.priority}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePublishChangeLog}
                  disabled={publishingChangeLog || !newChangeLogTitle.trim() || !newChangeLogDescription.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {publishingChangeLog ? "Publishing..." : "Publish Entry"}
                </button>
              </div>
            )}

            {changeLogEntries.length === 0 && productUpdates.length === 0 && !showNewChangeLog ? (
              <p className="text-muted text-xs">No change log entries yet.</p>
            ) : (
              <div className="space-y-3">
                {/* Legacy product updates */}
                {productUpdates.map((pu) => (
                  <div key={pu.id} className="bg-neutral rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-bold">{pu.title}</h5>
                      <span className="text-[10px] text-muted">{pu.createdAt?.toLocaleDateString() || "—"}</span>
                    </div>
                    <p className="text-xs text-charcoal/80 leading-relaxed whitespace-pre-wrap">{pu.summary}</p>
                    {pu.changeRequestIds.length > 0 && (
                      <p className="text-[10px] text-muted mt-2">Addressed {pu.changeRequestIds.length} request{pu.changeRequestIds.length > 1 ? "s" : ""}</p>
                    )}
                    <p className="text-[10px] text-muted mt-1">Published by {pu.createdBy}</p>
                  </div>
                ))}
                {/* New change log entries */}
                {changeLogEntries.map((entry) => (
                  <div key={entry.id} className="bg-neutral rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold">{entry.title}</h5>
                        {entry.version && <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-border">{entry.version}</span>}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          entry.category === "feature" ? "bg-violet-500/10 text-violet-700" :
                          entry.category === "bugfix" ? "bg-red-500/10 text-red-700" :
                          entry.category === "maintenance" ? "bg-neutral text-muted" :
                          "bg-blue-500/10 text-blue-700"
                        }`}>{entry.category}</span>
                      </div>
                      <span className="text-[10px] text-muted">{entry.createdAt?.toLocaleDateString() || "—"}</span>
                    </div>
                    <p className="text-xs text-charcoal/80 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                    <p className="text-[10px] text-muted mt-1">
                      {entry.createdByRole === "client" ? `${entry.createdBy} (Client)` : `Published by ${entry.createdBy}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Other Documents */}
      {otherDocs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">Other</h3>
          <div className="space-y-2">
            {otherDocs.map((d) => (
              <DocCard key={d.id} doc={d} onClick={() => setViewingDoc(d)} onDelete={() => handleDeleteDocument(d)} deleting={deletingDocId === d.id} />
            ))}
          </div>
        </div>
      )}
      </> : null}
    </div>
  );
}

function DocCard({ doc, onClick, onDelete, deleting }: { doc: ClientDocument; onClick: () => void; onDelete?: () => void; deleting?: boolean }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-full text-left bg-neutral rounded-lg p-4 hover:bg-border/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <p className={`font-medium text-sm ${onDelete ? "pr-6" : ""}`}>{doc.title}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${
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
          {doc.updatedAt?.toLocaleString() || doc.createdAt?.toLocaleString() || "—"}
        </p>
        {doc.generatedFromCommit && (
          <p className="text-[10px] text-muted mt-1">
            Generated from <span className="font-mono bg-white/60 px-1 py-0.5 rounded">{doc.generatedFromCommit.slice(0, 7)}</span>
          </p>
        )}
      </button>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
          disabled={deleting}
          title="Delete document"
          className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-700 transition-colors text-xs font-bold"
        >
          {deleting ? "..." : "×"}
        </button>
      )}
    </div>
  );
}

function GeneratingProgress({ label }: { label: string }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Preparing...");

  useEffect(() => {
    const stages = [
      { at: 5, text: "Analyzing inputs..." },
      { at: 20, text: "Processing content..." },
      { at: 40, text: "Generating document..." },
      { at: 60, text: "Refining structure..." },
      { at: 80, text: "Finalizing..." },
      { at: 90, text: "Almost done..." },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev; // Stall near end until real completion
        const increment = prev < 30 ? 2 : prev < 60 ? 1.5 : prev < 80 ? 0.8 : 0.3;
        const next = Math.min(prev + increment, 92);
        const currentStage = [...stages].reverse().find((s) => next >= s.at);
        if (currentStage) setStage(currentStage.text);
        return next;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-charcoal">{label}</p>
        <p className="text-xs text-muted">{Math.round(progress)}%</p>
      </div>
      <div className="w-full h-2 bg-neutral rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        {stage}
      </p>
    </div>
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
