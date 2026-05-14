import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { createShare, fetchListing, type ShareRecord } from "./lib/api";
import { workspaceCopy } from "./lib/i18n";

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(".");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareDialog, setShareDialog] = useState<ShareRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);

  const fileListing = useQuery({
    queryKey: ["files", currentPath],
    queryFn: () => fetchListing(currentPath)
  });

  const visibleListing = fileListing.data
    ? {
        ...fileListing.data,
        entries: fileListing.data.entries.filter((entry) => entry.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      }
    : undefined;

  async function handleCreateShare(path: string) {
    setIsCreatingShare(true);
    setShareError(null);
    setCopiedLink(null);

    try {
      const share = await createShare(path);
      setShareDialog(share);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCreatingShare(false);
    }
  }

  async function handleCopyLink(url: string) {
    const copied = await copyToClipboard(url);
    setCopiedLink(copied ? url : null);
  }

  return (
    <WorkspaceShell
      copy={workspaceCopy}
      listing={visibleListing}
      isLoading={fileListing.isLoading}
      errorMessage={fileListing.error instanceof Error ? fileListing.error.message : null}
      onNavigate={setCurrentPath}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onCreateShare={handleCreateShare}
      shareDialog={shareDialog}
      copiedLink={copiedLink}
      onCopyLink={handleCopyLink}
      onCloseShareDialog={() => {
        setShareDialog(null);
        setCopiedLink(null);
      }}
      shareError={shareError}
      isCreatingShare={isCreatingShare}
    />
  );
}
