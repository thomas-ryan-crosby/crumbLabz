"use client";

import { useEffect, useState } from "react";
import {
  getPortalVisits,
  getContacts,
  type PortalVisit,
  type Contact,
} from "@/lib/firebase";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  portal_open: { label: "Portal Opened", color: "bg-blue-500/10 text-blue-700" },
  project_view: { label: "Viewed Project", color: "bg-violet-500/10 text-violet-700" },
  document_view: { label: "Viewed Document", color: "bg-emerald-500/10 text-emerald-700" },
  feature_request: { label: "Feature Request", color: "bg-amber-500/10 text-amber-700" },
  change_log: { label: "Change Log Entry", color: "bg-rose-500/10 text-rose-700" },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  problem_definition: "Problem Definition",
  solution_one_pager: "Solution One-Pager",
  development_plan: "Development Plan",
  solution_overview: "Solution Overview",
  getting_started: "Getting Started Guide",
  meeting_transcript: "Meeting Minutes",
  feature_specification: "Feature Specification",
};

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const [visits, setVisits] = useState<PortalVisit[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  useEffect(() => {
    async function load() {
      const [visitsData, contactsData] = await Promise.all([
        getPortalVisits(),
        getContacts(),
      ]);
      setVisits(visitsData);
      setContacts(contactsData);
      setLoading(false);
    }
    load();
  }, []);

  // Filter visits by time range
  const now = new Date();
  const filteredVisits = visits.filter((v) => {
    if (timeRange === "all" || !v.createdAt) return true;
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return v.createdAt >= cutoff;
  });

  // Compute stats
  const totalVisits = filteredVisits.length;
  const uniqueCompanies = new Set(filteredVisits.map((v) => v.companyName.toLowerCase())).size;
  const docViews = filteredVisits.filter((v) => v.action === "document_view").length;
  const featureRequests = filteredVisits.filter((v) => v.action === "feature_request").length;

  // Visits by company
  const companyMap = new Map<string, { count: number; lastVisit: Date | null }>();
  for (const v of filteredVisits) {
    const key = v.companyName || "Unknown";
    const existing = companyMap.get(key);
    if (!existing) {
      companyMap.set(key, { count: 1, lastVisit: v.createdAt });
    } else {
      existing.count++;
      if (v.createdAt && (!existing.lastVisit || v.createdAt > existing.lastVisit)) {
        existing.lastVisit = v.createdAt;
      }
    }
  }
  const companySorted = Array.from(companyMap.entries())
    .sort((a, b) => b[1].count - a[1].count);

  // Action breakdown
  const actionCounts = new Map<string, number>();
  for (const v of filteredVisits) {
    actionCounts.set(v.action, (actionCounts.get(v.action) || 0) + 1);
  }

  // Document type breakdown
  const docTypeCounts = new Map<string, number>();
  for (const v of filteredVisits) {
    if (v.action === "document_view" && v.documentType) {
      docTypeCounts.set(v.documentType, (docTypeCounts.get(v.documentType) || 0) + 1);
    }
  }

  // Daily visit trend (last 14 days for chart)
  const dayBuckets = new Map<string, number>();
  const trendDays = 14;
  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayBuckets.set(d.toISOString().split("T")[0], 0);
  }
  for (const v of visits) {
    if (!v.createdAt) continue;
    const key = v.createdAt.toISOString().split("T")[0];
    if (dayBuckets.has(key)) {
      dayBuckets.set(key, dayBuckets.get(key)! + 1);
    }
  }
  const trendData = Array.from(dayBuckets.entries());
  const maxTrend = Math.max(...trendData.map(([, c]) => c), 1);

  // Resolve contact name from companyName
  const getContactForCompany = (companyName: string) =>
    contacts.find((c) => c.company.toLowerCase() === companyName.toLowerCase());

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portal Analytics</h1>
          <p className="text-muted text-sm mt-1">
            Track how clients are using their portal
          </p>
        </div>
        <div className="flex gap-1 bg-neutral rounded-lg p-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                timeRange === range
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-muted hover:text-charcoal"
              }`}
            >
              {range === "all" ? "All Time" : `Last ${range.replace("d", " days")}`}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Portal Visits" value={totalVisits} color="bg-blue-500" />
        <StatCard label="Unique Companies" value={uniqueCompanies} color="bg-violet-500" />
        <StatCard label="Document Views" value={docViews} color="bg-emerald-500" />
        <StatCard label="Feature Requests" value={featureRequests} color="bg-amber-500" />
      </div>

      {/* 14-day trend */}
      <div className="bg-white rounded-xl border border-border mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Portal Visits — Last 14 Days</h2>
        </div>
        <div className="p-6">
          {totalVisits === 0 ? (
            <p className="text-muted text-sm text-center py-8">
              No portal visits recorded yet. Data will appear here once clients start using their portals.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {trendData.map(([date, count]) => {
                const height = maxTrend > 0 ? (count / maxTrend) * 100 : 0;
                const d = new Date(date);
                const label = `${d.getMonth() + 1}/${d.getDate()}`;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted">{count > 0 ? count : ""}</span>
                    <div
                      className="w-full bg-accent/80 rounded-t transition-all"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${label}: ${count} visits`}
                    />
                    <span className="text-[10px] text-muted">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Visits by company */}
        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Visits by Company</h2>
          </div>
          {companySorted.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted text-sm">
              No visits yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {companySorted.slice(0, 10).map(([company, { count, lastVisit }]) => {
                const contact = getContactForCompany(company);
                return (
                  <div key={company} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{company}</p>
                      <p className="text-xs text-muted">
                        {contact?.name || "—"} &middot; Last visit:{" "}
                        {lastVisit ? lastVisit.toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action breakdown */}
        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Activity Breakdown</h2>
          </div>
          {actionCounts.size === 0 ? (
            <div className="px-6 py-8 text-center text-muted text-sm">
              No activity yet.
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {Array.from(actionCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([action, count]) => {
                  const meta = ACTION_LABELS[action] || { label: action, color: "bg-neutral text-muted" };
                  const pct = totalVisits > 0 ? (count / totalVisits) * 100 : 0;
                  return (
                    <div key={action}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-muted tabular-nums">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Document type breakdown */}
      {docTypeCounts.size > 0 && (
        <div className="bg-white rounded-xl border border-border mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Most Viewed Document Types</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from(docTypeCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="bg-neutral rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted mt-1">
                      {DOC_TYPE_LABELS[type] || type}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent activity feed */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        {filteredVisits.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted text-sm">
            No portal activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredVisits.slice(0, 25).map((visit) => {
              const meta = ACTION_LABELS[visit.action] || { label: visit.action, color: "bg-neutral text-muted" };
              return (
                <div key={visit.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{visit.companyName || "Unknown"}</p>
                      {visit.documentType && (
                        <p className="text-xs text-muted">
                          {DOC_TYPE_LABELS[visit.documentType] || visit.documentType}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {visit.createdAt
                      ? visit.createdAt.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
