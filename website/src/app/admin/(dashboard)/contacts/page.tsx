"use client";

import { useEffect, useState, useCallback } from "react";
import { getContacts, updateContact, type Contact } from "@/lib/firebase";

const statusOptions = [
  { value: "new", label: "New", style: "bg-accent/10 text-accent" },
  { value: "contacted", label: "Contacted", style: "bg-blue-500/10 text-blue-600" },
  { value: "in_progress", label: "In Progress", style: "bg-emerald-500/10 text-emerald-600" },
  { value: "closed", label: "Closed", style: "bg-charcoal/10 text-charcoal" },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
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
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
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
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[480px] border-r border-border bg-white`}>
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
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>
              All ({contacts.length})
            </FilterChip>
            {statusOptions.map((s) => (
              <FilterChip
                key={s.value}
                active={filterStatus === s.value}
                onClick={() => setFilterStatus(s.value)}
              >
                {s.label} ({contacts.filter((c) => c.status === s.value).length})
              </FilterChip>
            ))}
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
                  <StatusBadge status={contact.status} />
                </div>
                <p className="text-xs text-muted mb-1">
                  {contact.company} &middot; {contact.email}
                </p>
                <p className="text-xs text-muted line-clamp-1">{contact.headache}</p>
                <p className="text-xs text-muted/60 mt-1">
                  {contact.createdAt ? contact.createdAt.toLocaleDateString() : "—"}
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
          onClose={() => setSelected(null)}
          onUpdate={async (id, fields) => {
            await updateContact(id, fields);
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
  onClose,
  onUpdate,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: (id: string, fields: { status?: string; notes?: string }) => Promise<void>;
}) {
  const [notes, setNotes] = useState(contact.notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(contact.notes);
  }, [contact.id, contact.notes]);

  const handleStatusChange = async (status: string) => {
    await onUpdate(contact.id, { status });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onUpdate(contact.id, { notes });
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-2xl">
        {/* Contact info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoField label="Email" value={contact.email} href={`mailto:${contact.email}`} />
          <InfoField label="Phone" value={contact.phone || "Not provided"} href={contact.phone ? `tel:${contact.phone}` : undefined} />
          <InfoField
            label="Submitted"
            value={contact.createdAt ? contact.createdAt.toLocaleString() : "Unknown"}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  contact.status === s.value
                    ? s.style + " border-current"
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
          <label className="block text-sm font-medium mb-2">Their Headache</label>
          <div className="bg-neutral rounded-lg p-4 text-sm leading-relaxed">
            {contact.headache}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Internal Notes</label>
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
      </div>
    </div>
  );
}

function InfoField({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const opt = statusOptions.find((s) => s.value === status);
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${opt?.style || "bg-neutral text-muted"}`}>
      {opt?.label || status}
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-charcoal text-white"
          : "bg-neutral text-muted hover:bg-border"
      }`}
    >
      {children}
    </button>
  );
}
