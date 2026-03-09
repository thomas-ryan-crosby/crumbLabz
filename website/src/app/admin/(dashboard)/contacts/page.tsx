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
  updateClientDocument,
  getCurrentTeamMember,
  PIPELINE_STAGES,
  TEAM_MEMBERS,
  type Contact,
  type Activity,
  type ClientDocument,
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
    fields: { stage?: string; assignee?: string; notes?: string }
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
        <div className="px-6 py-6 max-w-3xl">
          {viewingDoc ? (
            <div>
              <button
                onClick={() => setViewingDoc(null)}
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
                    {viewingDoc.generatedBy === "ai" ? "AI Generated" : "Manual"} &middot;{" "}
                    {viewingDoc.createdAt?.toLocaleString() || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["draft", "review", "approved", "sent"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleDocStatusChange(viewingDoc.id, s)}
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

              <div className="prose prose-sm max-w-none bg-neutral rounded-lg p-6">
                <ReactMarkdown>{viewingDoc.content}</ReactMarkdown>
              </div>
            </div>
          ) : loadingDocs ? (
            <p className="text-muted text-sm">Loading documents...</p>
          ) : documents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted text-sm">No documents yet.</p>
              <p className="text-muted text-xs mt-1">
                Documents will be auto-generated after the discovery call via Fireflies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setViewingDoc(d)}
                  className="w-full text-left bg-neutral rounded-lg p-4 hover:bg-border/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{d.title}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      d.status === "approved"
                        ? "bg-green-600/10 text-green-700"
                        : d.status === "sent"
                          ? "bg-blue-500/10 text-blue-600"
                          : d.status === "review"
                            ? "bg-accent/10 text-accent"
                            : "bg-charcoal/10 text-charcoal"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {d.generatedBy === "ai" ? "AI Generated" : "Manual"} &middot;{" "}
                    {d.type.replace(/_/g, " ")} &middot;{" "}
                    {d.createdAt?.toLocaleDateString() || "—"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
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
