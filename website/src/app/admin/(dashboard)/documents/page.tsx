"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocMeta {
  slug: string;
  label: string;
  filename: string;
}

interface DocContent {
  slug: string;
  label: string;
  content: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [active, setActive] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocs(data);
        setLoading(false);
      });
  }, []);

  const openDoc = async (slug: string) => {
    setLoadingDoc(true);
    const res = await fetch(`/api/documents?slug=${slug}`);
    const data = await res.json();
    setActive(data);
    setLoadingDoc(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Document list */}
      <div
        className={`${active ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[320px] border-r border-border bg-white`}
      >
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-xl font-bold">Documents</h1>
          <p className="text-muted text-sm mt-1">Core business documents</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {docs.map((doc) => (
            <button
              key={doc.slug}
              onClick={() => openDoc(doc.slug)}
              className={`w-full text-left px-6 py-4 hover:bg-neutral/50 transition-colors ${
                active?.slug === doc.slug ? "bg-neutral" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
                  <svg
                    className="w-4.5 h-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">{doc.label}</p>
                  <p className="text-xs text-muted">{doc.filename}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Document viewer */}
      {active ? (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">{active.label}</h2>
            <button
              onClick={() => setActive(null)}
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

          <div className="px-6 py-6 max-w-3xl">
            {loadingDoc ? (
              <p className="text-muted">Loading...</p>
            ) : (
              <article className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children, ...props }) => (
                      <div style={{ overflowX: "auto" }}>
                        <table {...props}>{children}</table>
                      </div>
                    ),
                  }}
                >{active.content}</ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted text-sm">
          Select a document to view
        </div>
      )}
    </div>
  );
}
