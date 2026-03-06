"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getContacts,
  updateContact,
  getActivities,
  getCurrentTeamMember,
  PIPELINE_STAGES,
  TEAM_MEMBERS,
  type Contact,
  type Activity,
} from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function ContactsPage() {
  const { user } = useAuth();
  const currentMember = getCurrentTeamMember(user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [filterStage, setFilterStage] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [search, setSearch] = useState("");

  const loadContacts = useCallback(async () => {
    const data = await getContacts();
    setContacts(data);
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
          <h1 className="text-xl font-bold">Contacts</h1>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />

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
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.length === 0 ? (
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
          onClose={() => setSelected(null)}
          onUpdate={async (id, fields) => {
            await updateContact(id, fields, currentMember?.name);
            await loadContacts();
            setSelected((prev) =>
              prev && prev.id === id ? { ...prev, ...fields } : prev
            );
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
  onClose,
  onUpdate,
}: {
  contact: Contact;
  actorName: string;
  onClose: () => void;
  onUpdate: (
    id: string,
    fields: { stage?: string; assignee?: string; notes?: string }
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState(contact.notes);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    setNotes(contact.notes);
    setLoadingActivity(true);
    getActivities(contact.id).then((data) => {
      setActivities(data);
      setLoadingActivity(false);
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

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{contact.name}</h2>
          <p className="text-muted text-sm">{contact.company}</p>
        </div>
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
