import { FileArchive, FileAudio, FileImage, FileText, FileVideo } from "lucide-react";

export const isImageAttachment = (mimeType: string) =>
  mimeType === "image/gif" || mimeType.startsWith("image/");

export const formatAttachmentSize = (size: string | number): string => {
  const bytes = typeof size === "string" ? Number.parseInt(size, 10) : size;
  if (Number.isNaN(bytes)) return String(size);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getAttachmentFileIcon = (mimeType: string): React.ElementType => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive")) {
    return FileArchive;
  }
  return FileText;
};

export const downloadAttachment = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = fileName;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
};
