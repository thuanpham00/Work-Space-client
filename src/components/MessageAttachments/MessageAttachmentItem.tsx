import { memo, useCallback } from "react";
import { Image } from "antd";
import { Download } from "lucide-react";
import type { Attachment } from "../../types/attachment.type";
import {
  downloadAttachment,
  formatAttachmentSize,
  getAttachmentFileIcon,
  isImageAttachment,
} from "./attachment.utils";
import styles from "./MessageAttachments.module.scss";

interface MessageAttachmentItemProps {
  attachment: Attachment;
}

const MessageAttachmentItem = ({ attachment }: MessageAttachmentItemProps) => {
  const handleDownload = useCallback(() => {
    downloadAttachment(attachment.fileUrl, attachment.fileName);
  }, [attachment.fileUrl, attachment.fileName]);

  if (isImageAttachment(attachment.mimeType)) {
    return (
      <div className={styles.imageAttachment}>
        <Image
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className={styles.attachmentImg}
          rootClassName={styles.imageRoot}
        />
      </div>
    );
  }

  const FileIcon = getAttachmentFileIcon(attachment.mimeType);

  return (
    <button type="button" className={styles.fileAttachment} onClick={handleDownload}>
      <span className={styles.fileIcon}>
        <FileIcon size={20} />
      </span>

      <span className={styles.fileInfo}>
        <span className={styles.fileName}>{attachment.fileName}</span>
        <span className={styles.fileSize}>{formatAttachmentSize(attachment.fileSize)}</span>
      </span>

      <span className={styles.downloadIcon} aria-hidden="true">
        <Download size={16} />
      </span>
    </button>
  );
};

export default memo(MessageAttachmentItem);
