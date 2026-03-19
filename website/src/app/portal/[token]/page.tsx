"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  getPortalToken,
  getContacts,
  getClientDocuments,
  getProjectsForContact,
  getChangeRequests,
  getProductUpdates,
  getChangeLogEntries,
  addChangeLogEntry,
  addChangeRequest,
  type Contact,
  type ClientDocument,
  type Project,
  type ChangeRequest,
  type ProductUpdate,
  type ChangeLogEntry,
} from "@/lib/firebase";
import FeatureRequestChat from "@/components/FeatureRequestChat";

const mdComponents: Components = {
  table: ({ children, ...props }) => (
    <div style={{ overflowX: "auto" }}>
      <table {...props}>{children}</table>
    </div>
  ),
};

const DOC_LABELS: Record<string, string> = {
  problem_definition: "Problem Definition",
  solution_one_pager: "Solution One-Pager",
  development_plan: "Development Plan",
  solution_overview: "Solution Overview",
  getting_started: "Getting Started Guide",
  meeting_transcript: "Meeting Minutes",
};

type Tab = "billing" | "discovery" | "initial_definition" | "solution_assets";

const TAB_LABELS: Record<Tab, string> = {
  billing: "Billing",
  discovery: "Discovery",
  initial_definition: "Initial Definition",
  solution_assets: "Solution Assets",
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Subscription Active", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  retainer_paid: { label: "Retainer Paid", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  past_due: { label: "Past Due", color: "bg-red-500/10 text-red-700 border-red-500/20" },
  cancelled: { label: "Cancelled", color: "bg-[#f7f7f5] text-[#6b6b6b] border-[#e0e0e0]" },
  unpaid: { label: "Awaiting Setup", color: "bg-[#f7f7f5] text-[#6b6b6b] border-[#e0e0e0]" },
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  feature: { label: "Feature", color: "bg-violet-500/10 text-violet-700" },
  improvement: { label: "Improvement", color: "bg-blue-500/10 text-blue-700" },
  bugfix: { label: "Bug Fix", color: "bg-red-500/10 text-red-700" },
  maintenance: { label: "Maintenance", color: "bg-[#f7f7f5] text-[#6b6b6b]" },
};

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [companyContactIds, setCompanyContactIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("billing");
  const [viewingDoc, setViewingDoc] = useState<ClientDocument | null>(null);

  // Change log form state
  const [showChangeLogForm, setShowChangeLogForm] = useState(false);
  const [changeLogTitle, setChangeLogTitle] = useState("");
  const [changeLogDescription, setChangeLogDescription] = useState("");
  const [submittingChangeLog, setSubmittingChangeLog] = useState(false);

  // Feature request form state
  const [featureRequestMode, setFeatureRequestMode] = useState<null | "choice" | "form" | "chat">(null);
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePriority, setFeaturePriority] = useState<ChangeRequest["priority"]>("medium");
  const [submittingFeature, setSubmittingFeature] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const portalData = await getPortalToken(token);
        if (!portalData) {
          setError("This portal link is invalid or has been deactivated.");
          setLoading(false);
          return;
        }

        const contacts = await getContacts();
        const c = contacts.find((ct) => ct.id === portalData.contactId);
        if (!c) {
          setError("Contact not found.");
          setLoading(false);
          return;
        }
        setContact(c);

        // Aggregate docs and projects across all contacts in the same company
        const companyContacts = contacts.filter(
          (ct) => ct.company.toLowerCase() === c.company.toLowerCase()
        );
        const ccIds = companyContacts.map((ct) => ct.id);
        setCompanyContactIds(ccIds);

        const [docsResults, projResults] = await Promise.all([
          Promise.all(ccIds.map((id) => getClientDocuments(id))),
          Promise.all(ccIds.map((id) => getProjectsForContact(id))),
        ]);
        setDocuments(docsResults.flat());
        const allProjects = projResults.flat();
        const uniqueProjects = Array.from(new Map(allProjects.map((p) => [p.id, p])).values());
        setProjects(uniqueProjects);
      } catch {
        setError("Failed to load portal data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // Load change requests, product updates, and change log when project changes
  useEffect(() => {
    if (!contact || !activeProjectId || companyContactIds.length === 0) return;
    Promise.all([
      Promise.all(companyContactIds.map((id) => getChangeRequests(id, activeProjectId))),
      Promise.all(companyContactIds.map((id) => getProductUpdates(id, activeProjectId))),
      Promise.all(companyContactIds.map((id) => getChangeLogEntries(id, activeProjectId))),
    ]).then(([crsArr, pusArr, clsArr]) => {
      setChangeRequests(crsArr.flat());
      setProductUpdates(pusArr.flat());
      setChangeLog(clsArr.flat());
    });
  }, [contact, activeProjectId, companyContactIds]);

  const handleSubmitChangeLog = async () => {
    if (!contact || !changeLogTitle.trim() || !changeLogDescription.trim()) return;
    setSubmittingChangeLog(true);
    try {
      await addChangeLogEntry(contact.id, {
        projectId: activeProjectId,
        title: changeLogTitle.trim(),
        description: changeLogDescription.trim(),
        createdBy: contact.name,
        createdByRole: "client",
      });
      const results = await Promise.all(companyContactIds.map((id) => getChangeLogEntries(id, activeProjectId)));
      setChangeLog(results.flat());
      setChangeLogTitle("");
      setChangeLogDescription("");
      setShowChangeLogForm(false);
    } finally {
      setSubmittingChangeLog(false);
    }
  };

  const handleSubmitFeatureRequest = async () => {
    if (!contact || !featureTitle.trim() || !featureDescription.trim()) return;
    setSubmittingFeature(true);
    try {
      await addChangeRequest(contact.id, activeProjectId, {
        title: featureTitle.trim(),
        description: featureDescription.trim(),
        priority: featurePriority,
        author: contact.name,
        source: "client_portal",
      });
      const results = await Promise.all(companyContactIds.map((id) => getChangeRequests(id, activeProjectId)));
      setChangeRequests(results.flat());
      setFeatureTitle("");
      setFeatureDescription("");
      setFeaturePriority("medium");
      setShowFeatureRequestForm(false);
    } finally {
      setSubmittingFeature(false);
    }
  };

  const openProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveTab("billing");
    setViewingDoc(null);
  };

  const backToProjects = () => {
    setActiveProjectId("");
    setViewingDoc(null);
    setChangeRequests([]);
    setProductUpdates([]);
    setChangeLog([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#e0e0e0] border-t-[#e87a2e] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#2d2d2d] mb-2">Portal Unavailable</h1>
          <p className="text-[#6b6b6b]">{error}</p>
        </div>
      </div>
    );
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectDocs = documents.filter((d) => d.projectId === activeProjectId);

  const discoveryDocs = projectDocs.filter(
    (d) => d.type === "meeting_transcript" && (d.phase === "discovery" || !d.phase)
  );
  const definitionDocs = projectDocs.filter((d) =>
    ["problem_definition", "solution_one_pager", "development_plan"].includes(d.type)
  );
  const definitionMeetings = projectDocs.filter(
    (d) => d.type === "meeting_transcript" && d.phase === "initial_definition"
  );
  const solutionDocs = projectDocs.filter((d) =>
    ["solution_overview", "getting_started"].includes(d.type)
  );
  const featureDocs = projectDocs.filter((d) => d.type === "feature_specification");
  const maintenanceMeetings = projectDocs.filter(
    (d) => d.type === "meeting_transcript" && d.phase === "maintenance"
  );
  const openRequests = changeRequests.filter(
    (cr) => cr.status === "open" || cr.status === "in_progress"
  );

  // ===== Document detail view =====
  if (viewingDoc) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => setViewingDoc(null)}
            className="text-sm text-[#e87a2e] font-medium mb-6 hover:underline"
          >
            &larr; Back
          </button>

          <h1 className="text-xl font-bold text-[#2d2d2d] mb-1">{viewingDoc.title}</h1>
          <p className="text-xs text-[#6b6b6b] mb-6">Version {viewingDoc.version || 1}</p>

          {viewingDoc.adminNotes && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-bold text-amber-800">From Your CrumbLabz Team</span>
              </div>
              <div className="prose prose-sm max-w-none text-amber-900">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{viewingDoc.adminNotes}</ReactMarkdown>
              </div>
            </div>
          )}

          {viewingDoc.fileUrl && (
            <div className="flex items-center gap-3 mb-4 bg-white border border-[#e0e0e0] rounded-xl p-4">
              <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18H17V16H7V18M17 14H7V12H17V14M7 10H11V8H7V10M15 2H5C3.89 2 3 2.89 3 4V20C3 21.11 3.89 22 5 22H19C20.11 22 21 21.11 21 20V8L15 2M19 20H5V4H14V9H19V20Z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2d2d2d] truncate">{viewingDoc.fileName || "Attached File"}</p>
                <p className="text-xs text-[#6b6b6b]">Uploaded file</p>
              </div>
              <a
                href={viewingDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#e87a2e]/10 text-[#e87a2e] hover:bg-[#e87a2e]/20 transition-colors shrink-0"
              >
                View / Download
              </a>
            </div>
          )}

          {viewingDoc.fileUrl && viewingDoc.fileName?.toLowerCase().endsWith(".pdf") && (
            <iframe
              src={viewingDoc.fileUrl}
              className="w-full h-[600px] rounded-xl border border-[#e0e0e0] mb-4"
              title={viewingDoc.title}
            />
          )}

          {viewingDoc.content ? (
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-6">
              <div className="prose prose-sm max-w-none text-[#2d2d2d]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{viewingDoc.content}</ReactMarkdown>
              </div>
            </div>
          ) : !viewingDoc.fileUrl ? (
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 text-center">
              <p className="text-sm text-[#6b6b6b]">No content available for this document.</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ===== Project list (landing) =====
  if (!activeProjectId) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        {/* Header */}
        <div className="bg-white border-b border-[#e0e0e0]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <p className="text-xs font-bold text-[#e87a2e] uppercase tracking-wide mb-1">CrumbLabz Client Portal</p>
            <h1 className="text-xl font-bold text-[#2d2d2d]">{contact?.company || contact?.name}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Value statement */}
          <div className="bg-white border border-[#e0e0e0] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#2d2d2d] mb-2">Welcome to your CrumbLabz portal</h2>
            <p className="text-sm text-[#6b6b6b] leading-relaxed">
              CrumbLabz builds custom software tools that eliminate the manual work slowing your business down.
              This portal is your window into every project we&apos;re building together &mdash; from discovery
              conversations and project plans, all the way through to the finished solution and ongoing improvements.
            </p>
            <p className="text-sm text-[#6b6b6b] leading-relaxed mt-3">
              Select a project below to view documents, track progress, submit feature requests, and manage billing.
            </p>
          </div>

          {/* Project cards */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6b6b6b] text-sm">No projects yet. Your CrumbLabz team will set up your first project soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">Your Projects</h3>
              {projects.map((p) => {
                const pDocs = documents.filter((d) => d.projectId === p.id);
                const paymentInfo = PAYMENT_STATUS_LABELS[p.paymentStatus] || PAYMENT_STATUS_LABELS.unpaid;
                return (
                  <button
                    key={p.id}
                    onClick={() => openProject(p.id)}
                    className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-5 hover:border-[#e87a2e] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-[#2d2d2d] group-hover:text-[#e87a2e] transition-colors">{p.name}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6b6b6b]">
                      <span>{pDocs.length} document{pDocs.length !== 1 ? "s" : ""}</span>
                      {p.repoUrl && <span>GitHub connected</span>}

                    </div>
                    <p className="text-xs text-[#e87a2e] font-medium mt-3 group-hover:underline">View project &rarr;</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e0e0e0] mt-16">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <p className="text-xs text-[#6b6b6b]">CrumbLabz &mdash; Custom Tools for Smarter Operations</p>
            <p className="text-xs text-[#6b6b6b] mt-1">
              <a href="https://crumblabz.com" className="text-[#e87a2e] hover:underline">crumblabz.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Project detail view =====
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={backToProjects}
            className="text-xs text-[#e87a2e] font-medium mb-3 hover:underline"
          >
            &larr; All Projects
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#e87a2e] uppercase tracking-wide mb-1">CrumbLabz Client Portal</p>
              <h1 className="text-xl font-bold text-[#2d2d2d]">{activeProject?.name || "Project"}</h1>
              <p className="text-sm text-[#6b6b6b]">{contact?.company || contact?.name}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-[#e0e0e0] -mx-6 px-6 overflow-x-auto">
            {(["billing", "discovery", "initial_definition", "solution_assets"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t
                    ? "border-[#e87a2e] text-[#2d2d2d]"
                    : "border-transparent text-[#6b6b6b] hover:text-[#2d2d2d]"
                }`}
              >
                {TAB_LABELS[t]}
                {t === "solution_assets" && openRequests.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {openRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ===== BILLING TAB ===== */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-5">
              <h2 className="text-sm font-bold text-[#2d2d2d] mb-1">Billing</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">
                Your payment status and subscription details. If you have any billing questions, reply to any CrumbLabz email or reach out to your team contact.
              </p>
            </div>

            {activeProject ? (
              <div className="bg-white border border-[#e0e0e0] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#2d2d2d]">{activeProject.name}</h3>
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                    PAYMENT_STATUS_LABELS[activeProject.paymentStatus]?.color || PAYMENT_STATUS_LABELS.unpaid.color
                  }`}>
                    {PAYMENT_STATUS_LABELS[activeProject.paymentStatus]?.label || "Awaiting Setup"}
                  </span>
                </div>

                {(activeProject.retainerAmount > 0 || activeProject.monthlyRate > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {activeProject.retainerAmount > 0 && (
                      <div className="bg-[#f7f7f5] rounded-lg p-4">
                        <p className="text-xs text-[#6b6b6b] mb-1">Initial Retainer</p>
                        <p className="text-lg font-bold text-[#2d2d2d]">${activeProject.retainerAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {activeProject.monthlyRate > 0 && (
                      <div className="bg-[#f7f7f5] rounded-lg p-4">
                        <p className="text-xs text-[#6b6b6b] mb-1">Monthly Rate</p>
                        <p className="text-lg font-bold text-[#2d2d2d]">${activeProject.monthlyRate.toLocaleString()}/mo</p>
                      </div>
                    )}
                  </div>
                )}

                {activeProject.paymentStatus === "unpaid" && activeProject.retainerAmount === 0 && (
                  <p className="text-sm text-[#6b6b6b]">Payment details have not been configured for this project yet. Your CrumbLabz team will set this up and send you a payment link.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6b6b6b]">No active project selected.</p>
            )}
          </div>
        )}

        {/* ===== DISCOVERY TAB ===== */}
        {activeTab === "discovery" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-5">
              <h2 className="text-sm font-bold text-[#2d2d2d] mb-1">Discovery</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">
                Notes and transcripts from our initial discovery conversations. These capture the problems you shared, ideas discussed, and context that shapes the project direction.
              </p>
            </div>

            {discoveryDocs.length === 0 ? (
              <p className="text-[#6b6b6b] text-sm">No discovery documents available yet.</p>
            ) : (
              discoveryDocs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setViewingDoc(d)}
                  className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-5 hover:border-[#e87a2e] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-[#2d2d2d]">{d.title}</h3>
                    <span className="text-xs text-[#6b6b6b]">{d.createdAt?.toLocaleDateString() || "—"}</span>
                  </div>
                  <p className="text-xs text-[#6b6b6b]">Meeting Notes</p>
                </button>
              ))
            )}
          </div>
        )}

        {/* ===== INITIAL DEFINITION TAB ===== */}
        {activeTab === "initial_definition" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-5">
              <h2 className="text-sm font-bold text-[#2d2d2d] mb-1">Initial Definition</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">
                The core documents that define your project — the problem we&apos;re solving, our proposed approach, and the development roadmap. Review each document and approve it or leave feedback so we can move forward.
              </p>
            </div>

            {definitionDocs.length === 0 && definitionMeetings.length === 0 ? (
              <p className="text-[#6b6b6b] text-sm">No definition documents available yet.</p>
            ) : (
              <>
                {definitionDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setViewingDoc(d)}
                    className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-5 hover:border-[#e87a2e] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-[#2d2d2d]">{DOC_LABELS[d.type] || d.title}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        d.status === "approved" ? "bg-emerald-500/10 text-emerald-700" : "bg-blue-500/10 text-blue-700"
                      }`}>{d.status}</span>
                    </div>
                    <p className="text-xs text-[#6b6b6b]">{d.title}</p>
                  </button>
                ))}

                {definitionMeetings.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b] mb-3 mt-4">Meeting Minutes</h3>
                    {definitionMeetings.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setViewingDoc(d)}
                        className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-5 hover:border-[#e87a2e] transition-colors mb-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-[#2d2d2d]">{d.title}</h3>
                          <span className="text-xs text-[#6b6b6b]">{d.createdAt?.toLocaleDateString() || "—"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== SOLUTION ASSETS TAB ===== */}
        {activeTab === "solution_assets" && (
          <div className="space-y-8">

            {/* Access Quick Reference */}
            {activeProject?.accessQuickRef && (
              <div className="bg-[#e87a2e]/5 border-2 border-[#e87a2e] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#e87a2e]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                  </svg>
                  <h2 className="text-base font-bold text-[#2d2d2d]">Access Quick Reference</h2>
                </div>
                <div className="text-sm text-[#2d2d2d] leading-relaxed whitespace-pre-wrap">{activeProject.accessQuickRef}</div>
              </div>
            )}

            {/* Solution Documents */}
            <div className="space-y-4">
              <div className="bg-white border border-[#e0e0e0] rounded-xl p-5">
                <h2 className="text-sm font-bold text-[#2d2d2d] mb-1">Solution Documents</h2>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">
                  A technical overview of the tool we built and a step-by-step guide to get you started. These documents are updated as the solution evolves.
                </p>
              </div>

              {solutionDocs.length === 0 ? (
                <p className="text-[#6b6b6b] text-sm">Solution documentation is not yet available. Your CrumbLabz team will publish it here once development is complete.</p>
              ) : (
                solutionDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setViewingDoc(d)}
                    className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-5 hover:border-[#e87a2e] transition-colors"
                  >
                    <h3 className="text-sm font-bold text-[#2d2d2d] mb-1">{DOC_LABELS[d.type] || d.title}</h3>
                    <p className="text-xs text-[#6b6b6b]">{d.title}</p>
                  </button>
                ))
              )}
            </div>

            {/* Codebase */}
            {activeProject?.repoUrl && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">Codebase</h2>
                <div className="flex items-center gap-2 bg-white border border-[#e0e0e0] rounded-xl px-5 py-4">
                  <svg className="w-5 h-5 text-[#2d2d2d]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#2d2d2d] hover:text-[#e87a2e] transition-colors"
                  >
                    {activeProject.repoUrl.replace("https://github.com/", "")}
                  </a>
                </div>
              </div>
            )}

            {/* Maintenance & Continuous Development */}
            <div className="space-y-6">
              <div className="bg-white border border-[#e0e0e0] rounded-xl p-5">
                <h2 className="text-sm font-bold text-[#2d2d2d] mb-1">Maintenance &amp; Continuous Development</h2>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">
                  Track every improvement we make to your solution. Submit feature requests, log issues, and follow along as we implement updates. We&apos;re your ongoing development partner.
                </p>
              </div>

              {/* Maintenance Meeting Minutes */}
              {maintenanceMeetings.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b] mb-3">Meeting Minutes</h3>
                  <div className="space-y-3">
                    {maintenanceMeetings.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setViewingDoc(d)}
                        className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-4 hover:border-[#e87a2e] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-[#2d2d2d]">{d.title}</h4>
                          <span className="text-xs text-[#6b6b6b]">{d.createdAt?.toLocaleDateString() || "—"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Backlog */}
              {featureDocs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b] mb-3">Feature Backlog</h3>
                  <p className="text-xs text-[#6b6b6b] mb-3">Formal feature specifications created from your feedback and meetings. Review and approve each document before we begin implementation.</p>
                  <div className="space-y-3">
                    {featureDocs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setViewingDoc(d)}
                        className="w-full text-left bg-white border border-[#e0e0e0] rounded-xl p-4 hover:border-[#e87a2e] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-[#2d2d2d]">{d.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              d.status === "approved" ? "bg-green-100 text-green-700"
                                : d.status === "review" ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}>{d.status === "review" ? "Awaiting Review" : d.status}</span>
                            <span className="text-xs text-[#6b6b6b]">{d.createdAt?.toLocaleDateString() || "—"}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Requests */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">Feature Requests</h3>
                  <button
                    onClick={() => setFeatureRequestMode(featureRequestMode ? null : "choice")}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#e87a2e]/10 text-[#e87a2e] hover:bg-[#e87a2e]/20 transition-colors"
                  >
                    {featureRequestMode ? "Cancel" : "+ New Request"}
                  </button>
                </div>

                {/* Mode choice */}
                {featureRequestMode === "choice" && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setFeatureRequestMode("chat")}
                      className="group bg-white border border-[#e0e0e0] rounded-xl p-5 text-left hover:border-[#e87a2e] hover:shadow-sm transition-all"
                    >
                      <svg className="w-5 h-5 text-[#e87a2e] mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                      </svg>
                      <h4 className="text-sm font-bold text-[#2d2d2d] mb-1">Chat through it</h4>
                      <p className="text-xs text-[#6b6b6b] leading-relaxed">Describe what you need and our assistant will help shape it into a clear request.</p>
                    </button>
                    <button
                      onClick={() => setFeatureRequestMode("form")}
                      className="group bg-white border border-[#e0e0e0] rounded-xl p-5 text-left hover:border-[#e87a2e] hover:shadow-sm transition-all"
                    >
                      <svg className="w-5 h-5 text-[#e87a2e] mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <h4 className="text-sm font-bold text-[#2d2d2d] mb-1">Fill out a form</h4>
                      <p className="text-xs text-[#6b6b6b] leading-relaxed">Know exactly what you want? Submit a quick form with title, description, and priority.</p>
                    </button>
                  </div>
                )}

                {/* Chat mode */}
                {featureRequestMode === "chat" && (
                  <div className="mb-4">
                    <FeatureRequestChat
                      variant="portal"
                      onCancel={() => setFeatureRequestMode(null)}
                      onFeaturesReady={async (features) => {
                        if (!contact) return;
                        for (const f of features) {
                          await addChangeRequest(contact.id, activeProjectId, {
                            title: f.title,
                            description: f.description,
                            priority: f.priority,
                            author: contact.name,
                            source: "client_portal",
                          });
                        }
                        const results = await Promise.all(companyContactIds.map((id) => getChangeRequests(id, activeProjectId)));
                        setChangeRequests(results.flat());
                      }}
                    />
                  </div>
                )}

                {/* Form mode */}
                {featureRequestMode === "form" && (
                  <div className="bg-white border border-[#e0e0e0] rounded-xl p-5 mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder="What would you like to see? (e.g. Export to CSV)"
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/30 focus:border-[#e87a2e]"
                    />
                    <textarea
                      placeholder="Describe what you need and why it would be helpful..."
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/30 focus:border-[#e87a2e] resize-y"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-[#6b6b6b]">Priority:</label>
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setFeaturePriority(p)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize transition-colors ${
                            featurePriority === p
                              ? p === "high" ? "bg-red-500/20 text-red-700" : p === "medium" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/20 text-blue-700"
                              : "bg-[#f7f7f5] text-[#6b6b6b] hover:bg-[#e0e0e0]"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmitFeatureRequest}
                      disabled={submittingFeature || !featureTitle.trim() || !featureDescription.trim()}
                      className="bg-[#e87a2e] hover:bg-[#d06a1e] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      {submittingFeature ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                )}

                {changeRequests.length === 0 && !featureRequestMode ? (
                  <p className="text-[#6b6b6b] text-sm">No feature requests yet. Submit a request for anything you&apos;d like added or changed.</p>
                ) : (
                  <div className="space-y-3">
                    {changeRequests.map((cr) => (
                      <div key={cr.id} className="bg-white border border-[#e0e0e0] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-[#2d2d2d]">{cr.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              cr.priority === "high" ? "bg-red-500/10 text-red-700"
                                : cr.priority === "medium" ? "bg-amber-500/10 text-amber-700"
                                  : "bg-blue-500/10 text-blue-700"
                            }`}>{cr.priority}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              cr.status === "open" ? "bg-blue-500/10 text-blue-700"
                                : cr.status === "in_progress" ? "bg-amber-500/10 text-amber-700"
                                  : cr.status === "resolved" ? "bg-emerald-500/10 text-emerald-700"
                                    : "bg-[#f7f7f5] text-[#6b6b6b]"
                            }`}>{cr.status === "in_progress" ? "In Progress" : cr.status}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#6b6b6b]">{cr.description}</p>
                        <p className="text-[10px] text-[#6b6b6b] mt-2">
                          {cr.source === "client_portal" ? "Submitted via portal" : cr.source === "meeting_minutes" ? "From meeting" : "Submitted"} {cr.createdAt?.toLocaleDateString() || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Change Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">Change Log</h3>
                  <button
                    onClick={() => setShowChangeLogForm(!showChangeLogForm)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#e87a2e]/10 text-[#e87a2e] hover:bg-[#e87a2e]/20 transition-colors"
                  >
                    {showChangeLogForm ? "Cancel" : "+ Add Entry"}
                  </button>
                </div>

                {showChangeLogForm && (
                  <div className="bg-white border border-[#e0e0e0] rounded-xl p-5 mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Issue or note title..."
                      value={changeLogTitle}
                      onChange={(e) => setChangeLogTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/30 focus:border-[#e87a2e]"
                    />
                    <textarea
                      placeholder="Describe the issue, observation, or feedback..."
                      value={changeLogDescription}
                      onChange={(e) => setChangeLogDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/30 focus:border-[#e87a2e] resize-y"
                    />
                    <button
                      onClick={handleSubmitChangeLog}
                      disabled={submittingChangeLog || !changeLogTitle.trim() || !changeLogDescription.trim()}
                      className="bg-[#e87a2e] hover:bg-[#d06a1e] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      {submittingChangeLog ? "Submitting..." : "Submit Entry"}
                    </button>
                  </div>
                )}

                {changeLog.length === 0 && productUpdates.length === 0 && !showChangeLogForm ? (
                  <p className="text-[#6b6b6b] text-sm">No change log entries yet. Your CrumbLabz team will log updates here, and you can add entries too.</p>
                ) : (
                  <div className="space-y-3">
                    {productUpdates.map((pu) => (
                      <div key={`pu-${pu.id}`} className="bg-white border border-[#e0e0e0] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-[#2d2d2d]">{pu.title}</h4>
                          <span className="text-xs text-[#6b6b6b]">{pu.createdAt?.toLocaleDateString() || "—"}</span>
                        </div>
                        <p className="text-sm text-[#2d2d2d]/80 leading-relaxed whitespace-pre-wrap">{pu.summary}</p>
                        {pu.changeRequestIds.length > 0 && (
                          <p className="text-xs text-emerald-600 mt-3 font-medium">
                            Addressed {pu.changeRequestIds.length} request{pu.changeRequestIds.length > 1 ? "s" : ""} from your feedback
                          </p>
                        )}
                        <p className="text-[10px] text-[#6b6b6b] mt-1">Published by CrumbLabz</p>
                      </div>
                    ))}
                    {changeLog.map((entry) => (
                      <div key={`cl-${entry.id}`} className="bg-white border border-[#e0e0e0] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#2d2d2d]">{entry.title}</h4>
                            {entry.version && (
                              <span className="text-[10px] font-mono bg-[#f7f7f5] text-[#6b6b6b] px-2 py-0.5 rounded">{entry.version}</span>
                            )}
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              CATEGORY_LABELS[entry.category]?.color || CATEGORY_LABELS.improvement.color
                            }`}>
                              {CATEGORY_LABELS[entry.category]?.label || entry.category}
                            </span>
                          </div>
                          <span className="text-xs text-[#6b6b6b]">{entry.createdAt?.toLocaleDateString() || "—"}</span>
                        </div>
                        <p className="text-sm text-[#2d2d2d]/80 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                        <p className="text-[10px] text-[#6b6b6b] mt-2">
                          {entry.createdByRole === "client" ? `${entry.createdBy} (Client)` : `Published by ${entry.createdBy}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#e0e0e0] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-[#6b6b6b]">CrumbLabz &mdash; Custom Tools for Smarter Operations</p>
          <p className="text-xs text-[#6b6b6b] mt-1">
            <a href="https://crumblabz.com" className="text-[#e87a2e] hover:underline">crumblabz.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
