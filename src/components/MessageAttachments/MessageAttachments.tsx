import { memo } from "react";
import type { Attachment } from "../../types/attachment.type";
import MessageAttachmentItem from "./MessageAttachmentItem";
import styles from "./MessageAttachments.module.scss";

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

const MessageAttachments = ({ attachments }: MessageAttachmentsProps) => {
  if (!attachments.length) return null;

  return (
    <div className={styles.messageAttachments}>
      {attachments.map((attachment) => (
        <MessageAttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
};

export default memo(MessageAttachments);
