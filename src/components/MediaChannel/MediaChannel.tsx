import { useMemo, useState, type ReactNode } from "react";
import { Tabs, Image, Tooltip, Empty } from "antd";
import { Download, FileText, FileImage, FileVideo, FileAudio, FileArchive } from "lucide-react";
import styles from "./MediaChannel.module.scss";
import type { Attachment } from "../../types/attachment.type";
import CollapsibleSection from "../CollapsibleSection/CollapsibleSection";

const getFileIcon = (mimeType: string): ReactNode => {
  if (mimeType.startsWith("image/")) return <FileImage size={18} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
  if (mimeType.startsWith("audio/")) return <FileAudio size={18} />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive size={18} />;
  return <FileText size={18} />;
};

const MediaChannel = ({ attachments }: { attachments: Attachment[] }) => {
  const [activeTab, setActiveTab] = useState("media");

  const attachmentsMedia = useMemo(() => {
    if (attachments?.length === 0) return [];
    return attachments?.filter((attachment) => attachment.mimeType.startsWith("image/"));
  }, [attachments]);

  const attachmentsFiles = useMemo(() => {
    if (attachments?.length === 0) return [];
    return attachments?.filter((attachment) => !attachment.mimeType.startsWith("image/"));
  }, [attachments]);

  return (
    <CollapsibleSection title="File phương tiện và file">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        className={styles.tabs}
        items={[
          {
            key: "media",
            label: "Phương tiện",
            children: (
              <div className={styles.mediaContent}>
                {attachmentsMedia?.length === 0 ? (
                  <Empty description="Chưa có tệp phương tiện" />
                ) : (
                  <Image.PreviewGroup>
                    <div className={styles.mediaGrid}>
                      {attachmentsMedia?.map((item) => (
                        <Tooltip key={item.id} title={item.fileName} placement="top">
                          <div className={styles.mediaItem}>
                            <Image
                              src={item.fileUrl}
                              alt={item.fileName}
                              className={styles.mediaImage}
                              preview={{ mask: null }}
                            />
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                )}
              </div>
            ),
          },
          {
            key: "files",
            label: "File",
            children: (
              <div className={styles.filesContent}>
                {attachmentsFiles?.length === 0 ? (
                  <Empty description="Chưa có file nào" />
                ) : (
                  <div className={styles.fileList}>
                    {attachmentsFiles?.map((file) => (
                      <div key={file.id} className={styles.fileItem}>
                        <div className={styles.fileLeft}>
                          <span className={styles.fileIcon}>{getFileIcon(file.mimeType)}</span>
                          <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{file.fileName}</div>
                            <div className={styles.fileSize}>{file.fileSize}</div>
                          </div>
                        </div>
                        <Tooltip title="Tải xuống">
                          <button
                            className={styles.downloadBtn}
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
                            <Download size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </CollapsibleSection>
  );
};

export default MediaChannel;
