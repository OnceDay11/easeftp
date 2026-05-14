import { ChevronRight, Copy, Download, FileText, Folder, FolderUp, Link2, Search, X } from "lucide-react";
import type { FileListing, ShareRecord } from "../lib/api";
import { formatFileKind, type WorkspaceCopy } from "../lib/i18n";

type WorkspaceShellProps = {
  copy: WorkspaceCopy;
  listing?: FileListing;
  isLoading: boolean;
  errorMessage: string | null;
  onNavigate: (path: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onCreateShare: (path: string) => void | Promise<void>;
  shareDialog: ShareRecord | null;
  copiedLink: string | null;
  onCopyLink: (url: string) => void | Promise<void>;
  onCloseShareDialog: () => void;
  shareError: string | null;
  isCreatingShare: boolean;
};

export function WorkspaceShell(props: WorkspaceShellProps) {
  const { copy } = props;
  const currentPath = props.listing?.path ?? ".";
  const breadcrumb =
    currentPath === "."
      ? [{ label: copy.rootBreadcrumbLabel, path: "." }]
      : [
          { label: copy.rootBreadcrumbLabel, path: "." },
          ...currentPath.split("/").map((segment, index, segments) => ({
            label: segment,
            path: segments.slice(0, index + 1).join("/")
          }))
        ];
  const childDirectories = props.listing?.entries.filter((entry) => entry.isDir) ?? [];
  const parentPath = currentPath === "." ? null : currentPath.split("/").slice(0, -1).join("/") || ".";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f1e8_0%,#f3eadf_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-10 border border-white/60 bg-ink px-5 py-4 text-white shadow-panel backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="border border-white/10 bg-white/5 px-3 py-2 text-sm uppercase tracking-[0.24em] text-mist">
                {copy.brandLabel}
              </div>

              <div className="hidden min-w-0 items-center gap-2 truncate text-sm text-slate-300 md:flex">
                {breadcrumb.map((item, index) => (
                  <span key={`${item.path}-${index}`} className="inline-flex min-w-0 items-center gap-2">
                    {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                    <button
                      type="button"
                      className={index === breadcrumb.length - 1 ? "truncate font-semibold text-white" : "truncate transition hover:text-white"}
                      onClick={() => props.onNavigate(item.path)}
                      disabled={index === breadcrumb.length - 1}
                    >
                      {item.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 border border-white/10 bg-white px-4 py-2 text-sm font-medium text-ink">
              <Search className="h-4 w-4" />
              <input
                value={props.searchQuery}
                onChange={(event) => props.onSearchQueryChange(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-slate-500 md:w-56"
              />
            </label>
          </div>
        </header>

        <main className="mt-5 grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border border-white/70 bg-white/85 p-5 shadow-panel backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.navigationLabel}</p>
                <h2 className="mt-2 text-lg font-semibold">{copy.directoryTreeTitle}</h2>
              </div>
              <Folder className="h-5 w-5 text-ember" />
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <button
                type="button"
                className="w-full border border-slate-200 bg-sand px-4 py-3 text-left font-medium text-ink"
                onClick={() => props.onNavigate(".")}
              >
                {copy.workspaceRoot}
              </button>
              {parentPath ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 border border-dashed border-slate-200 px-4 py-3 text-left"
                  onClick={() => props.onNavigate(parentPath)}
                >
                  <FolderUp className="h-4 w-4 text-slate-500" />
                  <span>{copy.parentDirectory}</span>
                </button>
              ) : null}
              {childDirectories.length > 0 ? (
                childDirectories.map((entry) => (
                  <button
                    key={entry.path}
                    type="button"
                    className="flex w-full items-center gap-3 border border-dashed border-slate-200 px-4 py-3 text-left transition hover:border-spruce/40 hover:bg-spruce/5"
                    onClick={() => props.onNavigate(entry.path)}
                  >
                    <Folder className="h-4 w-4 text-spruce" />
                    <span className="truncate">{entry.name}</span>
                  </button>
                ))
              ) : (
                <div className="border border-dashed border-slate-200 px-4 py-3 text-slate-500">{copy.noChildDirectories}</div>
              )}
            </div>
          </aside>

          <section className="min-w-0 border border-white/70 bg-white/80 p-5 shadow-panel backdrop-blur">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.workspaceLabel}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 md:hidden">
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

            {props.shareError ? <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{props.shareError}</div> : null}

            <div className="mt-4 overflow-hidden border border-slate-100 bg-white">
              <div className="grid grid-cols-[minmax(0,1.8fr)_130px_180px_160px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>{copy.nameColumn}</span>
                <span>{copy.typeColumn}</span>
                <span>{copy.modifiedColumn}</span>
                <span>{copy.actionsColumn}</span>
              </div>

              {props.isLoading ? (
                <div className="px-4 py-10 text-sm text-slate-500">{copy.loading}</div>
              ) : props.errorMessage ? (
                <div className="px-4 py-10 text-sm text-red-600">{props.errorMessage}</div>
              ) : props.listing && props.listing.entries.length > 0 ? (
                props.listing.entries.map((entry) => (
                  <div
                    key={entry.path}
                    className="grid grid-cols-[minmax(0,1.8fr)_130px_180px_160px] gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {entry.isDir ? (
                        <Folder className="h-4 w-4 shrink-0 text-spruce" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-ember" />
                      )}
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
                    <span>{entry.isDir ? copy.fileTypeDirectory : formatFileKind(entry.kind || "binary")}</span>
                    <span>{new Date(entry.modifiedAt).toLocaleString("zh-CN")}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {!entry.isDir ? (
                        <button
                          type="button"
                          className="border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-spruce/40 hover:text-spruce disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          onClick={() => void props.onCreateShare(entry.path)}
                          disabled={props.isCreatingShare}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" />
                            {copy.shareAction}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-sm text-slate-500">
                  {props.searchQuery.trim() ? copy.searchEmptyState : copy.emptyState}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {props.shareDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6" onClick={props.onCloseShareDialog}>
          <div
            className="w-full max-w-3xl border border-white/70 bg-white p-5 shadow-panel backdrop-blur sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-ink">
                  <Link2 className="h-4 w-4 text-spruce" />
                  <h2 className="text-lg font-semibold">{copy.shareDialogTitle}</h2>
                </div>
                <p className="mt-2 text-sm text-slate-600">{copy.shareDialogDescription}</p>
                <p className="mt-2 text-sm font-medium text-ink">{props.shareDialog.fileName}</p>
              </div>
              <button
                type="button"
                className="border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-ink"
                onClick={props.onCloseShareDialog}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {props.shareDialog.links.length > 0 ? (
                props.shareDialog.links.map((link) => (
                  <div key={`${link.label}-${link.url}`} className="border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">{link.label}</div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-spruce/40 hover:text-spruce"
                        onClick={() => void props.onCopyLink(link.url)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {props.copiedLink === link.url ? copy.shareDialogCopiedLabel : copy.copyLinkAction}
                      </button>
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.12em] text-slate-500">{copy.linkAddressLabel}</div>
                    <div className="mt-2 break-all border border-slate-200 bg-white px-3 py-3 font-mono text-sm text-slate-700">{link.url}</div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">{copy.shareDialogEmptyState}</div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-white"
                onClick={props.onCloseShareDialog}
              >
                {copy.shareDialogCloseAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
