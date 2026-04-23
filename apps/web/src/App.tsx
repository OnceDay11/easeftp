import { useQuery } from "@tanstack/react-query";
import { FolderKanban, HardDriveUpload, Link2, ShieldCheck } from "lucide-react";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { fetchListing } from "./lib/api";

export default function App() {
  const fileListing = useQuery({
    queryKey: ["files", "."],
    queryFn: () => fetchListing(".")
  });

  return (
    <WorkspaceShell
      highlights={[
        {
          icon: FolderKanban,
          title: "Directory-first workspace",
          description: "Browse inherited folders, inspect file classifications, and keep upload context visible."
        },
        {
          icon: HardDriveUpload,
          title: "Resumable transfers",
          description: "Upload queues and transfer states will stay visible across navigation."
        },
        {
          icon: Link2,
          title: "Controlled anonymous sharing",
          description: "Only lowest-classification files will be shareable outside the team."
        },
        {
          icon: ShieldCheck,
          title: "Auditable governance",
          description: "Every share, download, and permission change is designed to stay reviewable."
        }
      ]}
      listing={fileListing.data}
      isLoading={fileListing.isLoading}
      errorMessage={fileListing.error instanceof Error ? fileListing.error.message : null}
    />
  );
}
