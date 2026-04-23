import type { LucideIcon } from "lucide-react";
import { ChevronRight, FileText, Folder, FolderUp, PanelRightOpen, Search } from "lucide-react";
import type { FileListing } from "../lib/api";

type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type WorkspaceShellProps = {
  highlights: Highlight[];
  listing?: FileListing;
  isLoading: boolean;
  errorMessage: string | null;
  onNavigate: (path: string) => void;
};

export function WorkspaceShell(props: WorkspaceShellProps) {
  const currentPath = props.listing?.path ?? ".";
  const breadcrumb = currentPath === "."
    ? [{ label: "Workspace", path: "." }]
    : [
        { label: "Workspace", path: "." },
        ...currentPath.split("/").map((segment, index, segments) => ({
          label: segment,
          path: segments.slice(0, index + 1).join("/")
        }))
      ];
  const childDirectories = props.listing?.entries.filter((entry) => entry.isDir) ?? [];
  const parentPath = currentPath === "."
    ? null
    : currentPath.split("/").slice(0, -1).join("/") || ".";

  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-8 text-white shadow-panel sm:px-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(246,239,229,0.22),_transparent_60%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-mist">EaseFTP</p>
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">Modern file operations without the drag of legacy tools.</h1>
              <p className="max-w-xl text-base text-slate-200 sm:text-lg">
                The first implementation slice focuses on directory browsing, file visibility, and the interaction shell for uploads, sharing, and audit-ready actions.
              </p>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {props.highlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <article key={highlight.title} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <Icon className="mb-3 h-5 w-5 text-sand" />
                    <h2 className="text-sm font-semibold text-white">{highlight.title}</h2>
                    <p className="mt-1 text-sm text-slate-200">{highlight.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </header>

        <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Navigation</p>
                <h2 className="mt-2 text-lg font-semibold">Directory tree</h2>
              </div>
              <Folder className="h-5 w-5 text-ember" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <button
                type="button"
                className="w-full rounded-2xl bg-sand px-4 py-3 text-left font-medium text-ink"
                onClick={() => props.onNavigate(".")}
              >
                Workspace root
              </button>
              {parentPath ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-left"
                  onClick={() => props.onNavigate(parentPath)}
                >
                  <FolderUp className="h-4 w-4 text-slate-500" />
                  <span>Parent directory</span>
                </button>
              ) : null}
              {childDirectories.length > 0 ? (
                childDirectories.map((entry) => (
                  <button
                    key={entry.path}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-left transition hover:border-spruce/40 hover:bg-spruce/5"
                    onClick={() => props.onNavigate(entry.path)}
                  >
                    <Folder className="h-4 w-4 text-spruce" />
                    <span className="truncate">{entry.name}</span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-slate-500">
                  No child directories in this view.
                </div>
              )}
            </div>
          </aside>

          <section className="rounded-[28px] bg-white p-5 shadow-panel">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {breadcrumb.map((item, index) => (
                    <span key={`${item.path}-${index}`} className="inline-flex items-center gap-2">
                      {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                      <button
                        type="button"
                        className={index === breadcrumb.length - 1 ? "font-semibold text-ink" : "transition hover:text-ink"}
                        onClick={() => props.onNavigate(item.path)}
                        disabled={index === breadcrumb.length - 1}
                      >
                        {item.label}
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                  <Search className="h-4 w-4" />
                  Search
                </button>
                <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Upload</button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100">
              <div className="grid grid-cols-[minmax(0,1.5fr)_120px_180px_160px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Name</span>
                <span>Type</span>
                <span>Classification</span>
                <span>Modified</span>
              </div>

              {props.isLoading ? (
                <div className="px-4 py-10 text-sm text-slate-500">Loading workspace contents...</div>
              ) : props.errorMessage ? (
                <div className="px-4 py-10 text-sm text-red-600">{props.errorMessage}</div>
              ) : props.listing && props.listing.entries.length > 0 ? (
                props.listing.entries.map((entry) => (
                  <div
                    key={entry.path}
                    className="grid grid-cols-[minmax(0,1.5fr)_120px_180px_160px] gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {entry.isDir ? <Folder className="h-4 w-4 shrink-0 text-spruce" /> : <FileText className="h-4 w-4 shrink-0 text-ember" />}
                      {entry.isDir ? (
                        <button
                          type="button"
                          className="truncate font-medium text-ink transition hover:text-spruce"
                          onClick={() => props.onNavigate(entry.path)}
                        >
                          {entry.name}
                        </button>
                      ) : (
                        <span className="truncate font-medium text-ink">{entry.name}</span>
                      )}
                    </div>
                    <span>{entry.isDir ? "Directory" : "File"}</span>
                    <span className="capitalize">{entry.classification.split("-").join(" ")}</span>
                    <span>{new Date(entry.modifiedAt).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-sm text-slate-500">The storage root is empty. Add files under the configured storage directory to populate the workspace.</div>
              )}
            </div>
          </section>

          <aside className="rounded-[28px] bg-ink p-5 text-white shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Live panel</p>
                <h2 className="mt-2 text-lg font-semibold">Next slices</h2>
              </div>
              <PanelRightOpen className="h-5 w-5 text-sand" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <div className="rounded-3xl bg-white/10 p-4">
                <h3 className="font-semibold text-white">Upload queue</h3>
                <p className="mt-1">Will track resumable transfers, retry states, and network recovery.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <h3 className="font-semibold text-white">Share policy</h3>
                <p className="mt-1">Anonymous links will only unlock for public-shareable files.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <h3 className="font-semibold text-white">Audit feed</h3>
                <p className="mt-1">Upcoming activity stream for uploads, downloads, logins, and permission changes.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
