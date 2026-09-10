/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode } from "react";
import { Tabs, Image, Tooltip, Empty, Button, Spin } from "antd";
import { Download, FileText, FileImage, FileVideo, FileAudio, FileArchive, ChevronDown } from "lucide-react";
import styles from "./MediaChannel.module.scss";
import { AttachmentType, type Attachment } from "../../types/attachment.type";
import CollapsibleSection from "../CollapsibleSection/CollapsibleSection";
import { formatFileSize } from "../../utils/utils";

const getFileIcon = (mimeType: string): ReactNode => {
  if (mimeType.startsWith("image/")) return <FileImage size={18} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
  if (mimeType.startsWith("audio/")) return <FileAudio size={18} />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive size={18} />;
  return <FileText size={18} />;
};

interface Props {
  attachments: Attachment[];
  pagination: {
    page: number;
    total_page: number;
  };
  fetchMore: () => void;
  setQuery: (query: any) => void;
  query: any;
  isFetchingMore?: boolean;
}

const MediaChannel = ({ attachments, pagination, fetchMore, setQuery, query, isFetchingMore }: Props) => {
  const [activeTab, setActiveTab] = useState<"image" | "file">(AttachmentType.IMAGE);
  const hasMore = pagination.page < pagination.total_page;

  return (
    <CollapsibleSection title="File phương tiện và file">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as "image" | "file");
          setQuery({
            ...query,
            type: key,
            page: 1,
          });
        }}
        size="small"
        className={styles.tabs}
        items={[
          {
            key: "image",
            label: "Phương tiện",
          },
          {
            key: "file",
            label: "File",
          },
        ]}
      />

      <div className={styles.mediaContent}>
        {attachments?.length === 0 ? (
          <Empty description="Chưa có tệp phương tiện" />
        ) : (
          <>
            {activeTab === AttachmentType.FILE && (
              <div className={styles.fileList}>
                {attachments?.map((file) => (
                  <div key={file.id} className={styles.fileItem}>
                    <div className={styles.fileLeft}>
                      <span className={styles.fileIcon}>{getFileIcon(file.mimeType)}</span>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>{file.fileName}</div>
                        <div className={styles.fileSize}>{formatFileSize(file.fileSize)}</div>
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

            {activeTab === AttachmentType.IMAGE && (
              <Image.PreviewGroup>
                <div className={styles.mediaGrid}>
                  {attachments?.map((item) => (
                    <div className={styles.mediaItem} key={item.id}>
                      <Image
                        src={item.fileUrl}
                        alt={item.fileName}
                        className={styles.mediaImage}
                        preview={{ mask: null }}
                      />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            )}

            {hasMore && (
              <div className={styles.loadMoreWrapper}>
                <Button
                  type="text"
                  className={styles.loadMoreBtn}
                  onClick={fetchMore}
                  disabled={isFetchingMore}
                  icon={isFetchingMore ? <Spin size="small" /> : <ChevronDown size={16} />}
                >
                  {isFetchingMore ? "Đang tải..." : "Xem thêm"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default MediaChannel;
