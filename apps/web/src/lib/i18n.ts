export type WorkspaceCopy = {
  brandLabel: string;
  navigationLabel: string;
  directoryTreeTitle: string;
  workspaceRoot: string;
  parentDirectory: string;
  noChildDirectories: string;
  workspaceLabel: string;
  searchPlaceholder: string;
  nameColumn: string;
  typeColumn: string;
  modifiedColumn: string;
  actionsColumn: string;
  loading: string;
  emptyState: string;
  searchEmptyState: string;
  shareAction: string;
  shareDialogTitle: string;
  shareDialogDescription: string;
  shareDialogEmptyState: string;
  shareDialogCloseAction: string;
  shareDialogCopiedLabel: string;
  copyLinkAction: string;
  linkAddressLabel: string;
  fileKindLabels: Record<string, string>;
  fileTypeDirectory: string;
  rootBreadcrumbLabel: string;
};

export const workspaceCopy: WorkspaceCopy = {
  brandLabel: "EaseFTP",
  navigationLabel: "导航",
  directoryTreeTitle: "目录树",
  workspaceRoot: "工作区根目录",
  parentDirectory: "上级目录",
  noChildDirectories: "当前目录下没有子目录。",
  workspaceLabel: "文件列表",
  searchPlaceholder: "搜索当前目录",
  nameColumn: "名称",
  typeColumn: "类型",
  modifiedColumn: "修改时间",
  actionsColumn: "操作",
  loading: "正在加载文件列表...",
  emptyState: "当前目录为空。",
  searchEmptyState: "没有匹配当前搜索条件的文件。",
  shareAction: "查看下载链接",
  shareDialogTitle: "下载链接",
  shareDialogDescription: "根据当前可用协议生成下载地址，可直接查看并逐条复制。",
  shareDialogEmptyState: "当前没有可用的下载链接。",
  shareDialogCloseAction: "关闭",
  shareDialogCopiedLabel: "已复制",
  copyLinkAction: "复制",
  linkAddressLabel: "地址",
  fileKindLabels: {
    text: "文本",
    code: "代码",
    pdf: "PDF",
    image: "图片",
    video: "视频",
    audio: "音频",
    archive: "压缩包",
    document: "文档",
    spreadsheet: "表格",
    presentation: "演示文稿",
    binary: "二进制",
    directory: "目录"
  },
  fileTypeDirectory: "目录",
  rootBreadcrumbLabel: "工作区"
};

export function formatFileKind(kind: string): string {
  return workspaceCopy.fileKindLabels[kind] ?? kind;
}
