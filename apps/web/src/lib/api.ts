export type FileEntry = {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifiedAt: string;
  kind: string;
};

export type FileListing = {
  path: string;
  entries: FileEntry[];
};

export type ShareRecord = {
  path: string;
  fileName: string;
  links: ProtocolLink[];
};

export type ProtocolLink = {
  label: string;
  url: string;
};

function mapListingError(message?: string): string {
  if (!message) {
    return "无法加载文件列表。";
  }

  if (message === "invalid path") {
    return "请求路径无效。";
  }

  if (message.includes("does not exist")) {
    return "请求路径不存在。";
  }

  return "文件列表加载失败，请稍后重试。";
}

function mapShareError(message?: string): string {
  if (!message) {
    return "创建文件链接失败。";
  }

  if (message === "directory sharing is not supported") {
    return "目录暂不支持直接分享。";
  }

  return "创建文件链接失败。";
}

export async function fetchListing(path: string): Promise<FileListing> {
  const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(mapListingError(payload.error));
  }

  return (await response.json()) as FileListing;
}

export async function createShare(path: string): Promise<ShareRecord> {
  const response = await fetch("/api/shares", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ path })
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(mapShareError(payload.error));
  }

  return (await response.json()) as ShareRecord;
}
