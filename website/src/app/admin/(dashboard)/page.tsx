"use client";

import { useEffect, useState } from "react";
import { getContacts, type Contact } from "@/lib/firebase";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContacts().then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    contacted: contacts.filter((c) => c.status === "contacted").length,
    inProgress: contacts.filter((c) => c.status === "in_progress").length,
    closed: contacts.filter((c) => c.status === "closed").length,
  };

  const recentContacts = contacts.slice(0, 5);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Leads" value={stats.total} color="bg-charcoal" />
        <StatCard label="New" value={stats.new} color="bg-accent" />
        <StatCard label="Contacted" value={stats.contacted} color="bg-blue-500" />
        <StatCard label="In Progress" value={stats.inProgress} color="bg-emerald-500" />
      </div>

      {/* Recent contacts */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Submissions</h2>
          <Link
            href="/admin/contacts"
            className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted text-sm">
            No contact submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/admin/contacts?id=${contact.id}`}
                className="block px-6 py-4 hover:bg-neutral/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-muted text-xs">
                      {contact.company} &middot; {contact.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={contact.status} />
                    <span className="text-xs text-muted">
                      {contact.createdAt ? contact.createdAt.toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
                <p className="text-muted text-xs mt-1 line-clamp-1">
                  {contact.headache}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className={`w-2 h-2 rounded-full ${color} mb-3`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-muted text-xs mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-accent/10 text-accent",
    contacted: "bg-blue-500/10 text-blue-600",
    in_progress: "bg-emerald-500/10 text-emerald-600",
    closed: "bg-charcoal/10 text-charcoal",
  };

  const labels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    in_progress: "In Progress",
    closed: "Closed",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.new}`}>
      {labels[status] || status}
    </span>
  );
}
