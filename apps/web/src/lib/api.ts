export type FileEntry = {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifiedAt: string;
  classification: string;
};

export type FileListing = {
  path: string;
  entries: FileEntry[];
};

export async function fetchListing(path: string): Promise<FileListing> {
  const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Unable to load file listing.");
  }

  return (await response.json()) as FileListing;
}
