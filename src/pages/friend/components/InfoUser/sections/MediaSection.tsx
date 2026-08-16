import { useState, type ReactNode } from "react";
import { Tabs, Image, Tooltip, Empty } from "antd";
import { Download, FileText, FileImage, FileVideo, FileAudio, FileArchive } from "lucide-react";
import styles from "./MediaSection.module.scss";
import CollapsibleSection from "../../../../../components/CollapsibleSection/CollapsibleSection";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  mimeType: string;
}

const MOCK_MEDIA: MediaItem[] = [
  { id: "1", url: "https://picsum.photos/seed/discord1/300", type: "image", name: "photo1.jpg" },
  { id: "2", url: "https://picsum.photos/seed/discord2/300", type: "image", name: "photo2.jpg" },
  { id: "3", url: "https://picsum.photos/seed/discord3/300", type: "image", name: "photo3.jpg" },
  { id: "4", url: "https://picsum.photos/seed/discord4/300", type: "image", name: "photo4.jpg" },
  { id: "5", url: "https://picsum.photos/seed/discord5/300", type: "image", name: "photo5.jpg" },
  { id: "6", url: "https://picsum.photos/seed/discord6/300", type: "image", name: "photo6.jpg" },
  { id: "7", url: "https://picsum.photos/seed/discord7/300", type: "image", name: "photo7.jpg" },
  { id: "8", url: "https://picsum.photos/seed/discord8/300", type: "image", name: "photo8.jpg" },
  { id: "9", url: "https://picsum.photos/seed/discord9/300", type: "image", name: "photo9.jpg" },
];

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "BaoCaoThang12.pdf", size: "2.4 MB", mimeType: "application/pdf" },
  { id: "2", name: "ThietKeLogo.png", size: "1.1 MB", mimeType: "image/png" },
  { id: "3", name: "DemoVideo.mp4", size: "12.8 MB", mimeType: "video/mp4" },
  { id: "4", name: "GhiAmCuocHop.mp3", size: "3.2 MB", mimeType: "audio/mpeg" },
  { id: "5", name: "SourceCode.zip", size: "5.6 MB", mimeType: "application/zip" },
];

const getFileIcon = (mimeType: string): ReactNode => {
  if (mimeType.startsWith("image/")) return <FileImage size={18} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
  if (mimeType.startsWith("audio/")) return <FileAudio size={18} />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive size={18} />;
  return <FileText size={18} />;
};

const MediaSection = () => {
  const [activeTab, setActiveTab] = useState("media");

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
                {MOCK_MEDIA.length === 0 ? (
                  <Empty description="Chưa có tệp phương tiện" />
                ) : (
                  <Image.PreviewGroup>
                    <div className={styles.mediaGrid}>
                      {MOCK_MEDIA.map((item) => (
                        <Tooltip key={item.id} title={item.name} placement="top">
                          <div className={styles.mediaItem}>
                            <Image
                              src={item.url}
                              alt={item.name}
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
                {MOCK_FILES.length === 0 ? (
                  <Empty description="Chưa có file nào" />
                ) : (
                  <div className={styles.fileList}>
                    {MOCK_FILES.map((file) => (
                      <div key={file.id} className={styles.fileItem}>
                        <div className={styles.fileLeft}>
                          <span className={styles.fileIcon}>{getFileIcon(file.mimeType)}</span>
                          <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{file.name}</div>
                            <div className={styles.fileSize}>{file.size}</div>
                          </div>
                        </div>
                        <Tooltip title="Tải xuống">
                          <button className={styles.downloadBtn} onClick={() => window.open("#", "_blank")}>
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

export default MediaSection;
