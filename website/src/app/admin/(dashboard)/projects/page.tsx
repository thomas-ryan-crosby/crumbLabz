"use client";

import { useEffect, useState } from "react";
import { getProjects, updateProject, type Project } from "@/lib/firebase";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    getProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (projectId: string, status: Project["status"]) => {
    await updateProject(projectId, { status });
    const updated = await getProjects();
    setProjects(updated);
  };

  const filtered = filterStatus === "all"
    ? projects
    : projects.filter((p) => p.status === filterStatus);

  const statusCounts = {
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    on_hold: projects.filter((p) => p.status === "on_hold").length,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted text-sm mt-1">All client project repositories</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "on_hold", "completed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              filterStatus === status
                ? "bg-charcoal text-white"
                : "bg-neutral text-muted hover:bg-border"
            }`}
          >
            {status === "all" ? "All" : status === "on_hold" ? "On Hold" : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 opacity-60">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">
            {projects.length === 0
              ? "No projects yet. Create one from a contact's Documents tab."
              : "No projects match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold truncate">{project.name}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      project.status === "active" ? "bg-emerald-500/10 text-emerald-700"
                        : project.status === "completed" ? "bg-green-500/10 text-green-700"
                        : "bg-amber-500/10 text-amber-700"
                    }`}>
                      {project.status === "on_hold" ? "On Hold" : project.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">
                    {project.companyName} &middot; {project.contactName}
                  </p>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    {project.repoUrl.replace("https://github.com/", "")}
                  </a>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status selector */}
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value as Project["status"])}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>

                  <Link
                    href={`/admin/contacts?highlight=${project.contactId}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted hover:bg-neutral transition-colors"
                  >
                    View Contact
                  </Link>
                </div>
              </div>

              <div className="mt-3 text-xs text-muted">
                Created {project.createdAt?.toLocaleDateString() || "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
