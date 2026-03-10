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
  type Contact,
  type ClientDocument,
  type Project,
  type ChangeRequest,
  type ProductUpdate,
} from "@/lib/firebase";

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
};

type Tab = "documents" | "solution" | "maintenance";

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [viewingDoc, setViewingDoc] = useState<ClientDocument | null>(null);

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

        const [docs, projs] = await Promise.all([
          getClientDocuments(portalData.contactId),
          getProjectsForContact(portalData.contactId),
        ]);
        setDocuments(docs);
        setProjects(projs);
        if (projs.length > 0) {
          setActiveProjectId(projs[0].id);
        }
      } catch {
        setError("Failed to load portal data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // Load change requests and product updates when project changes
  useEffect(() => {
    if (!contact || !activeProjectId) return;
    Promise.all([
      getChangeRequests(contact.id, activeProjectId),
      getProductUpdates(contact.id, activeProjectId),
    ]).then(([crs, pus]) => {
      setChangeRequests(crs);
      setProductUpdates(pus);
    });
  }, [contact?.id, activeProjectId]);

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
  const problemDocs = projectDocs.filter((d) => ["problem_definition", "solution_one_pager", "development_plan"].includes(d.type));
  const solutionDocs = projectDocs.filter((d) => ["solution_overview", "getting_started"].includes(d.type));

  if (viewingDoc) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => setViewingDoc(null)}
            className="text-sm text-[#e87a2e] font-medium mb-6 hover:underline"
          >
            &larr; Back to Portal
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

          <div className="bg-white border border-[#e0e0e0] rounded-xl p-6">
            <div className="prose prose-sm max-w-none text-[#2d2d2d]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{viewingDoc.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#e87a2e] uppercase tracking-wide mb-1">CrumbLabz Client Portal</p>
              <h1 className="text-xl font-bold text-[#2d2d2d]">{contact?.company || contact?.name}</h1>
            </div>
          </div>

          {/* Project selector */}
          {projects.length > 1 && (
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    activeProjectId === p.id ? "bg-[#2d2d2d] text-white" : "bg-[#f7f7f5] text-[#6b6b6b] hover:bg-[#e0e0e0]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-[#e0e0e0] -mx-6 px-6">
            {(["documents", "solution", "maintenance"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors ${
                  activeTab === t
                    ? "border-[#e87a2e] text-[#2d2d2d]"
                    : "border-transparent text-[#6b6b6b] hover:text-[#2d2d2d]"
                }`}
              >
                {t === "documents" ? "Project Documents" : t === "solution" ? "Solution" : "Maintenance"}
                {t === "maintenance" && changeRequests.filter((cr) => cr.status === "open" || cr.status === "in_progress").length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {changeRequests.filter((cr) => cr.status === "open" || cr.status === "in_progress").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Project Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {problemDocs.length === 0 ? (
              <p className="text-[#6b6b6b] text-sm">No project documents available yet.</p>
            ) : (
              problemDocs.map((d) => (
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
              ))
            )}
          </div>
        )}

        {/* Solution Tab */}
        {activeTab === "solution" && (
          <div className="space-y-4">
            {activeProject?.repoUrl && (
              <div className="flex items-center gap-2 bg-white border border-[#e0e0e0] rounded-xl px-5 py-3">
                <svg className="w-5 h-5 text-[#2d2d2d]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span className="text-sm text-[#2d2d2d] font-medium">{activeProject.name}</span>
              </div>
            )}

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
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div className="space-y-8">
            {/* Product Updates */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#6b6b6b] mb-4">Product Updates</h2>
              {productUpdates.length === 0 ? (
                <p className="text-[#6b6b6b] text-sm">No product updates yet. Your CrumbLabz team will post updates here as improvements are made.</p>
              ) : (
                <div className="space-y-4">
                  {productUpdates.map((pu) => (
                    <div key={pu.id} className="bg-white border border-[#e0e0e0] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-[#2d2d2d]">{pu.title}</h3>
                        <span className="text-xs text-[#6b6b6b]">{pu.createdAt?.toLocaleDateString() || "—"}</span>
                      </div>
                      <p className="text-sm text-[#2d2d2d]/80 leading-relaxed whitespace-pre-wrap">{pu.summary}</p>
                      {pu.changeRequestIds.length > 0 && (
                        <p className="text-xs text-emerald-600 mt-3 font-medium">
                          Addressed {pu.changeRequestIds.length} request{pu.changeRequestIds.length > 1 ? "s" : ""} from your feedback
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Request Status */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#6b6b6b] mb-4">Your Change Requests</h2>
              {changeRequests.length === 0 ? (
                <p className="text-[#6b6b6b] text-sm">No change requests submitted yet. You can submit requests when reviewing your solution.</p>
              ) : (
                <div className="space-y-3">
                  {changeRequests.map((cr) => (
                    <div key={cr.id} className="bg-white border border-[#e0e0e0] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-[#2d2d2d]">{cr.title}</h3>
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
                                  : "bg-neutral text-[#6b6b6b]"
                          }`}>{cr.status === "in_progress" ? "In Progress" : cr.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6b6b6b]">{cr.description}</p>
                      <p className="text-[10px] text-[#6b6b6b] mt-2">Submitted {cr.createdAt?.toLocaleDateString() || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
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
