"use client";

import { useEffect, useState } from "react";
import {
  getContacts,
  getCurrentTeamMember,
  PIPELINE_STAGES,
  TEAM_MEMBERS,
  type Contact,
} from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const currentMember = getCurrentTeamMember(user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContacts().then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const myContacts = contacts.filter(
    (c) => c.assignee === currentMember?.id
  );
  const unassigned = contacts.filter((c) => !c.assignee);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {currentMember ? `Welcome, ${currentMember.name.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-muted text-sm mt-1">
          {contacts.length} total contacts &middot; {myContacts.length} assigned
          to you &middot; {unassigned.length} unassigned
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Contacts" value={contacts.length} color="bg-charcoal" />
        <StatCard label="New Leads" value={contacts.filter((c) => c.stage === "new_lead").length} color="bg-accent" />
        <StatCard label="In Development" value={contacts.filter((c) => c.stage === "development").length} color="bg-emerald-500" />
        <StatCard label="Active Clients" value={contacts.filter((c) => c.stage === "active_client").length} color="bg-green-600" />
      </div>

      {/* Pipeline overview */}
      <div className="bg-white rounded-xl border border-border mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Pipeline Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {PIPELINE_STAGES.filter((s) => s.value !== "closed_lost").map((stage) => {
              const count = contacts.filter(
                (c) => c.stage === stage.value
              ).length;
              return (
                <Link
                  key={stage.value}
                  href={`/admin/contacts`}
                  className="bg-neutral rounded-lg p-4 hover:bg-border/50 transition-colors text-center"
                >
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted mt-1">{stage.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team workload */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {TEAM_MEMBERS.map((member) => {
          const memberContacts = contacts.filter(
            (c) => c.assignee === member.id && c.stage !== "closed_lost"
          );
          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-border"
            >
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-charcoal text-white text-xs font-bold flex items-center justify-center">
                  {member.initials}
                </span>
                <div>
                  <h3 className="font-semibold text-sm">{member.name}</h3>
                  <p className="text-xs text-muted">
                    {memberContacts.length} active contact
                    {memberContacts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {memberContacts.length === 0 ? (
                <div className="px-6 py-6 text-center text-muted text-sm">
                  No active contacts assigned.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {memberContacts.slice(0, 5).map((c) => (
                    <div key={c.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted">{c.company}</p>
                      </div>
                      <StageBadge stage={c.stage} />
                    </div>
                  ))}
                  {memberContacts.length > 5 && (
                    <div className="px-6 py-3 text-center">
                      <Link
                        href="/admin/contacts"
                        className="text-accent hover:text-accent-hover text-xs font-medium transition-colors"
                      >
                        +{memberContacts.length - 5} more
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned leads */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">
              Unassigned Leads ({unassigned.length})
            </h2>
            <Link
              href="/admin/contacts"
              className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {unassigned.slice(0, 5).map((contact) => (
              <div
                key={contact.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-muted text-xs">
                    {contact.company} &middot; {contact.email}
                  </p>
                  <p className="text-muted text-xs mt-1 line-clamp-1">
                    {contact.headache}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={contact.stage} />
                  <span className="text-xs text-muted">
                    {contact.createdAt
                      ? contact.createdAt.toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className={`w-2 h-2 rounded-full ${color} mb-3`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-muted text-xs mt-1">{label}</p>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const opt = PIPELINE_STAGES.find((s) => s.value === stage);
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${opt?.color || "bg-neutral text-muted"}`}
    >
      {opt?.label || stage}
    </span>
  );
}
