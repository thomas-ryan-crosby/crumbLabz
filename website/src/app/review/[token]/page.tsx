"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getReviewToken,
  getClientDocuments,
  getDocumentComments,
  addDocumentComment,
  updateClientDocument,
  completeReviewToken,
  addChangeRequest,
  getChangeRequests,
  type ReviewToken,
  type ClientDocument,
  type DocumentComment,
  type ChangeRequest,
} from "@/lib/firebase";

const DOC_ORDER = ["problem_definition", "solution_one_pager", "development_plan"] as const;
const DOC_LABELS: Record<string, string> = {
  problem_definition: "Problem Definition",
  solution_one_pager: "Solution One-Pager",
  development_plan: "Development Plan",
  solution_overview: "Solution Overview",
  getting_started: "Getting Started Guide",
};

const SOLUTION_DOC_ORDER = ["solution_overview", "getting_started"] as const;

export default function ReviewPage() {
  const params = useParams();
  const tokenId = params.token as string;

  const [token, setToken] = useState<ReviewToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [comments, setComments] = useState<Record<string, DocumentComment[]>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [allApproved, setAllApproved] = useState(false);

  // Solution assets state
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestDesc, setNewRequestDesc] = useState("");
  const [newRequestPriority, setNewRequestPriority] = useState<ChangeRequest["priority"]>("medium");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const isSolutionReview = token?.reviewType === "solution_assets";

  useEffect(() => {
    async function load() {
      const t = await getReviewToken(tokenId);
      if (!t) {
        setInvalid(true);
        setLoading(false);
        return;
      }
      setToken(t);

      const docs = await getClientDocuments(t.contactId);

      if (t.reviewType === "solution_assets") {
        const solutionDocs = docs
          .filter((d) => SOLUTION_DOC_ORDER.includes(d.type as typeof SOLUTION_DOC_ORDER[number]))
          .filter((d) => (d.projectId || "") === (t.projectId || ""))
          .sort((a, b) =>
            SOLUTION_DOC_ORDER.indexOf(a.type as typeof SOLUTION_DOC_ORDER[number]) -
            SOLUTION_DOC_ORDER.indexOf(b.type as typeof SOLUTION_DOC_ORDER[number])
          );
        setDocuments(solutionDocs);
        if (solutionDocs.length > 0) setActiveTab(solutionDocs[0].type);

        // Load change requests
        const requests = await getChangeRequests(t.contactId, t.projectId);
        setChangeRequests(requests);
      } else {
        const productDocs = docs
          .filter((d) => DOC_ORDER.includes(d.type as typeof DOC_ORDER[number]))
          .filter((d) => (d.projectId || "") === (t.projectId || ""))
          .sort((a, b) => DOC_ORDER.indexOf(a.type as typeof DOC_ORDER[number]) - DOC_ORDER.indexOf(b.type as typeof DOC_ORDER[number]));
        setDocuments(productDocs);
        if (productDocs.length > 0) setActiveTab(productDocs[0].type);

        // Load comments for each doc
        const commentMap: Record<string, DocumentComment[]> = {};
        for (const d of productDocs) {
          commentMap[d.id] = await getDocumentComments(t.contactId, d.id);
        }
        setComments(commentMap);

        const approved = productDocs.length === 3 && productDocs.every((d) => d.status === "approved");
        setAllApproved(approved);
      }

      setLoading(false);
    }
    load();
  }, [tokenId]);

  const handleApprove = async (docId: string) => {
    if (!token) return;
    setSubmitting(docId);
    await updateClientDocument(token.contactId, docId, { status: "approved" });

    const docs = await getClientDocuments(token.contactId);
    const productDocs = docs
      .filter((d) => DOC_ORDER.includes(d.type as typeof DOC_ORDER[number]))
      .filter((d) => (d.projectId || "") === (token.projectId || ""))
      .sort((a, b) => DOC_ORDER.indexOf(a.type as typeof DOC_ORDER[number]) - DOC_ORDER.indexOf(b.type as typeof DOC_ORDER[number]));
    setDocuments(productDocs);

    const approved = productDocs.length === 3 && productDocs.every((d) => d.status === "approved");
    setAllApproved(approved);
    if (approved) {
      await completeReviewToken(tokenId);
    }

    setSubmitting(null);
  };

  const handleComment = async (docId: string) => {
    if (!token || !commentText[docId]?.trim()) return;
    setSubmitting(docId);

    await addDocumentComment(token.contactId, docId, {
      author: token.contactName,
      content: commentText[docId].trim(),
      reviewTokenId: tokenId,
    });

    await updateClientDocument(token.contactId, docId, { status: "revision_requested" });

    const updatedComments = await getDocumentComments(token.contactId, docId);
    setComments((prev) => ({ ...prev, [docId]: updatedComments }));

    const docs = await getClientDocuments(token.contactId);
    const productDocs = docs
      .filter((d) => DOC_ORDER.includes(d.type as typeof DOC_ORDER[number]))
      .filter((d) => (d.projectId || "") === (token.projectId || ""))
      .sort((a, b) => DOC_ORDER.indexOf(a.type as typeof DOC_ORDER[number]) - DOC_ORDER.indexOf(b.type as typeof DOC_ORDER[number]));
    setDocuments(productDocs);

    setCommentText((prev) => ({ ...prev, [docId]: "" }));
    setSubmitting(null);
  };

  const handleSubmitChangeRequest = async () => {
    if (!token || !newRequestTitle.trim() || !newRequestDesc.trim()) return;
    setSubmittingRequest(true);

    await addChangeRequest(token.contactId, token.projectId, {
      title: newRequestTitle.trim(),
      description: newRequestDesc.trim(),
      priority: newRequestPriority,
      author: token.contactName,
      reviewTokenId: tokenId,
    });

    const updated = await getChangeRequests(token.contactId, token.projectId);
    setChangeRequests(updated);

    setNewRequestTitle("");
    setNewRequestDesc("");
    setNewRequestPriority("medium");
    setSubmittingRequest(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#e87a2e]/30 border-t-[#e87a2e] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b6b6b] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-bold text-[#2d2d2d] mb-2">Link Expired or Invalid</h1>
          <p className="text-[#6b6b6b] text-sm">
            This review link has expired or is no longer valid. Please contact your CrumbLabz representative for a new link.
          </p>
        </div>
      </div>
    );
  }

  const activeDoc = documents.find((d) => d.type === activeTab);

  // Solution Assets Review
  if (isSolutionReview) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <header className="bg-white border-b border-[#e0e0e0]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#2d2d2d]">CrumbLabz</h1>
              <p className="text-xs text-[#6b6b6b]">Solution Review</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#2d2d2d]">{token?.companyName}</p>
              <p className="text-xs text-[#6b6b6b]">{token?.contactName}</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#2d2d2d] mb-2">
              Hi {token?.contactName?.split(" ")[0]}, your solution is ready for review.
            </h2>
            <p className="text-sm text-[#6b6b6b] leading-relaxed">
              Review the documentation below to understand what was built and how to use it.
              If you'd like anything changed, improved, or added, submit a change request below.
              This is an <strong>iterative process</strong> — we'll continue refining the solution until it fully meets your needs.
            </p>
          </div>

          {/* Document tabs */}
          {documents.length > 0 && (
            <div className="flex gap-1 mb-6 bg-white rounded-lg border border-[#e0e0e0] p-1">
              {documents.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveTab(d.type)}
                  className={`flex-1 text-sm font-medium px-3 py-2.5 rounded-md transition-colors ${
                    activeTab === d.type
                      ? "bg-[#2d2d2d] text-white"
                      : "text-[#6b6b6b] hover:bg-[#f7f7f5]"
                  }`}
                >
                  {DOC_LABELS[d.type] || d.type}
                </button>
              ))}
            </div>
          )}

          {/* Active document */}
          {activeDoc && (
            <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-[#e0e0e0]">
                <h3 className="text-base font-bold text-[#2d2d2d]">{activeDoc.title}</h3>
                <p className="text-xs text-[#6b6b6b]">Version {activeDoc.version || 1}</p>
              </div>
              <div className="px-6 py-6 prose prose-sm max-w-none text-[#2d2d2d]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeDoc.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Change Requests Section */}
          <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e0e0e0]">
              <h3 className="text-base font-bold text-[#2d2d2d]">Change Requests</h3>
              <p className="text-xs text-[#6b6b6b] mt-1">
                Submit requests for improvements, new features, or adjustments. No request is too small — each one helps us build a better solution for you.
              </p>
            </div>

            {/* Existing change requests */}
            {changeRequests.length > 0 && (
              <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#f7f7f5]">
                <h4 className="text-sm font-bold text-[#2d2d2d] mb-3">Your Requests ({changeRequests.length})</h4>
                <div className="space-y-2">
                  {changeRequests.map((cr) => (
                    <div key={cr.id} className="bg-white rounded-lg p-3 border border-[#e0e0e0]">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-[#2d2d2d]">{cr.title}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cr.priority === "high"
                              ? "bg-red-500/10 text-red-700"
                              : cr.priority === "medium"
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-blue-500/10 text-blue-700"
                          }`}>
                            {cr.priority}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cr.status === "open"
                              ? "bg-blue-500/10 text-blue-700"
                              : cr.status === "in_progress"
                                ? "bg-amber-500/10 text-amber-700"
                                : cr.status === "resolved"
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-[#e0e0e0] text-[#6b6b6b]"
                          }`}>
                            {cr.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6b6b6b]">{cr.description}</p>
                      <p className="text-[10px] text-[#6b6b6b] mt-1">{cr.createdAt?.toLocaleString() || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New change request form */}
            <div className="px-6 py-5 space-y-3">
              <h4 className="text-sm font-bold text-[#2d2d2d]">Submit a New Request</h4>
              <input
                type="text"
                value={newRequestTitle}
                onChange={(e) => setNewRequestTitle(e.target.value)}
                placeholder="Brief title (e.g., 'Add export to CSV button')"
                className="w-full text-sm border border-[#e0e0e0] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/40"
                disabled={submittingRequest}
              />
              <textarea
                value={newRequestDesc}
                onChange={(e) => setNewRequestDesc(e.target.value)}
                placeholder="Describe what you'd like changed, improved, or added. Be as specific as possible — include which screen, button, or workflow you're referring to."
                rows={4}
                className="w-full text-sm border border-[#e0e0e0] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/40 resize-none"
                disabled={submittingRequest}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#6b6b6b]">Priority:</label>
                  <select
                    value={newRequestPriority}
                    onChange={(e) => setNewRequestPriority(e.target.value as ChangeRequest["priority"])}
                    className="text-sm border border-[#e0e0e0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/40"
                    disabled={submittingRequest}
                  >
                    <option value="low">Low — Nice to have</option>
                    <option value="medium">Medium — Should fix</option>
                    <option value="high">High — Blocking issue</option>
                  </select>
                </div>
                <button
                  onClick={handleSubmitChangeRequest}
                  disabled={submittingRequest || !newRequestTitle.trim() || !newRequestDesc.trim()}
                  className="ml-auto text-sm font-medium px-5 py-2.5 rounded-lg bg-[#e87a2e] text-white hover:bg-[#d06a20] disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  {submittingRequest ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Iterative message */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#6b6b6b] leading-relaxed max-w-lg mx-auto">
              Your solution is a living product. CrumbLabz will continue to iterate and improve it based on your feedback.
              Submit change requests anytime — we'll review them and keep you updated on progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Project Documents Review (original flow)
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <header className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#2d2d2d]">CrumbLabz</h1>
            <p className="text-xs text-[#6b6b6b]">Document Review</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[#2d2d2d]">{token?.companyName}</p>
            <p className="text-xs text-[#6b6b6b]">{token?.contactName}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {allApproved ? (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <h2 className="text-lg font-bold text-emerald-800 mb-1">All Documents Approved!</h2>
            <p className="text-sm text-emerald-700">
              Thank you for reviewing and approving all three documents. We'll begin development shortly — you'll hear from us soon.
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#2d2d2d] mb-1">
              Hi {token?.contactName?.split(" ")[0]}, your documents are ready for review.
            </h2>
            <p className="text-sm text-[#6b6b6b]">
              Please review each document below. You can approve it or leave comments for our team.
            </p>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-[#e0e0e0] p-1">
          {documents.map((d) => {
            const isActive = activeTab === d.type;
            const isApproved = d.status === "approved";
            const hasComments = d.status === "revision_requested";
            return (
              <button
                key={d.id}
                onClick={() => setActiveTab(d.type)}
                className={`flex-1 text-sm font-medium px-3 py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-[#2d2d2d] text-white"
                    : "text-[#6b6b6b] hover:bg-[#f7f7f5]"
                }`}
              >
                {DOC_LABELS[d.type] || d.type}
                {isApproved && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                {hasComments && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>

        {activeDoc && (
          <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2d2d2d]">{activeDoc.title}</h3>
                <p className="text-xs text-[#6b6b6b]">Version {activeDoc.version || 1}</p>
              </div>
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                activeDoc.status === "approved"
                  ? "bg-emerald-500/10 text-emerald-700"
                  : activeDoc.status === "revision_requested"
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-blue-500/10 text-blue-700"
              }`}>
                {activeDoc.status === "revision_requested" ? "Revision Requested" : activeDoc.status}
              </span>
            </div>

            <div className="px-6 py-6 prose prose-sm max-w-none text-[#2d2d2d]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeDoc.content}</ReactMarkdown>
            </div>

            {comments[activeDoc.id]?.length > 0 && (
              <div className="px-6 py-4 border-t border-[#e0e0e0] bg-[#f7f7f5]">
                <h4 className="text-sm font-bold text-[#2d2d2d] mb-3">Comments</h4>
                <div className="space-y-3">
                  {comments[activeDoc.id].map((c) => (
                    <div key={c.id} className="bg-white rounded-lg p-3 border border-[#e0e0e0]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#2d2d2d]">{c.author}</span>
                        <span className="text-[10px] text-[#6b6b6b]">{c.createdAt?.toLocaleString() || ""}</span>
                      </div>
                      <p className="text-sm text-[#2d2d2d]">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDoc.status !== "approved" && (
              <div className="px-6 py-5 border-t border-[#e0e0e0] space-y-4">
                <button
                  onClick={() => handleApprove(activeDoc.id)}
                  disabled={submitting !== null}
                  className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting === activeDoc.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Approve This Document
                    </>
                  )}
                </button>

                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                    Or leave a comment for our team
                  </label>
                  <textarea
                    value={commentText[activeDoc.id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [activeDoc.id]: e.target.value }))}
                    placeholder="Describe any changes you'd like us to make..."
                    rows={3}
                    className="w-full text-sm border border-[#e0e0e0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e87a2e]/40 resize-none"
                    disabled={submitting !== null}
                  />
                  <button
                    onClick={() => handleComment(activeDoc.id)}
                    disabled={submitting !== null || !commentText[activeDoc.id]?.trim()}
                    className="mt-2 text-sm font-medium px-4 py-2 rounded-lg border border-[#e0e0e0] text-[#2d2d2d] hover:bg-[#f7f7f5] disabled:opacity-40 transition-colors"
                  >
                    Submit Comment
                  </button>
                </div>
              </div>
            )}

            {activeDoc.status === "approved" && (
              <div className="px-6 py-4 border-t border-[#e0e0e0] bg-emerald-50">
                <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  You've approved this document.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                d.status === "approved"
                  ? "bg-emerald-500"
                  : d.status === "revision_requested"
                    ? "bg-amber-500"
                    : "bg-[#e0e0e0]"
              }`} />
              <span className="text-xs text-[#6b6b6b]">{DOC_LABELS[d.type]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
