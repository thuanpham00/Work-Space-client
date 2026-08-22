import { useState } from "react";
import MenuItemSetting from "../MenuItemSetting/MenuItem";
import { BgColorsOutlined } from "@ant-design/icons";
import { App, Button, Modal } from "antd";
import styles from "./ChangeBackgroundChannel.module.scss";

const DEFAULT_BG_COLOR = "#09090b";

type PresetType = "theme" | "basic";

interface ThemePreset {
  id: string;
  type: PresetType;
  color: string;
  name: string;
  url?: string;
}

const PRESETS: ThemePreset[] = [
  { id: "blue", type: "basic", color: "#5865F2", name: "Xanh Blurple" },
  { id: "green", type: "basic", color: "#3BA55D", name: "Xanh lá" },
  { id: "yellow", type: "basic", color: "#FAA61A", name: "Vàng" },
  { id: "red", type: "basic", color: "#F04747", name: "Đỏ" },
  { id: "purple", type: "basic", color: "#9266CC", name: "Tím" },
  { id: "primary", type: "basic", color: "#ef4815", name: "Mặc định" },
  {
    id: "winter-girl",
    type: "theme",
    url: "https://picsum.photos/seed/winter/600",
    color: "#7BAFD4",
    name: "Winter Girl",
  },
  {
    id: "anime-night",
    type: "theme",
    url: "https://picsum.photos/seed/animenight/600",
    color: "#2A2356",
    name: "Anime Night",
  },
  {
    id: "anime-school",
    type: "theme",
    url: "https://picsum.photos/seed/animeschool/600",
    color: "#E8A87C",
    name: "Anime School",
  },
  {
    id: "pink-room",
    type: "theme",
    url: "https://picsum.photos/seed/pinkroom/600",
    color: "#F8B8C4",
    name: "Pink Room",
  },
  {
    id: "purple-curtain",
    type: "theme",
    url: "https://picsum.photos/seed/purplecurtain/600",
    color: "#9266CC",
    name: "Purple Curtain",
  },
  {
    id: "cherry",
    type: "theme",
    url: "https://picsum.photos/seed/cherry/600",
    color: "#F04747",
    name: "Cherry Blossom",
  },
  {
    id: "ocean",
    type: "theme",
    url: "https://picsum.photos/seed/ocean/600",
    color: "#3BA55D",
    name: "Ocean",
  },
  {
    id: "sunset",
    type: "theme",
    url: "https://picsum.photos/seed/sunset/600",
    color: "#FAA61A",
    name: "Sunset",
  },
  {
    id: "forest",
    type: "theme",
    url: "https://picsum.photos/seed/forest/600",
    color: "#3BA55D",
    name: "Forest",
  },
  {
    id: "neon-city",
    type: "theme",
    url: "https://picsum.photos/seed/neoncity/600",
    color: "#5B61FF",
    name: "Neon City",
  },
];

const BASIC_PRESETS = PRESETS.filter((p) => p.type === "basic");
const BG_PRESETS = PRESETS.filter((p) => p.type === "theme");

interface Applied {
  url: string;
  bgColor: string;
  accent: string;
  presetId?: string;
}

interface Props {
  onThemeChange?: (bgColor: string, accent: string, url: string) => void;
  configChannel?: { backgroundUrl: string; backgroundColor: string; accent: string };
}

export default function ChangeBackgroundChannel({ onThemeChange, configChannel }: Props) {
  const { message } = App.useApp();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [backgroundUrlDraft, setBackgroundUrlDraft] = useState<string>(configChannel?.backgroundUrl || "");
  const [backgroundColorDraft, setBackgroundColorDraft] = useState<string>(
    configChannel?.backgroundColor || "",
  );
  const [accentDraft, setAccentDraft] = useState<string>(configChannel?.accent || "");

  const handlePickPreset = (preset: ThemePreset) => {
    const next: Applied =
      preset.type === "theme" && preset.url
        ? { url: preset.url, bgColor: "", accent: preset.color, presetId: preset.id }
        : { url: "", bgColor: DEFAULT_BG_COLOR, accent: preset.color, presetId: preset.id };
    setBackgroundUrlDraft?.(next.url);
    setBackgroundColorDraft?.(next.bgColor);
    setAccentDraft?.(next.accent);
  };

  const handleOpenModal = () => {
    setThemeModalOpen(true);
  };

  const handleCancel = () => {
    setBackgroundUrlDraft?.(configChannel?.backgroundUrl || ""); // lấy configDraft từ cha - giá trị gốc
    setBackgroundColorDraft?.(configChannel?.backgroundColor || ""); // lấy configDraft từ cha
    setAccentDraft?.(configChannel?.accent || "");
    setThemeModalOpen(false);
  };

  const handleConfirm = () => {
    setThemeModalOpen(false);
    message.success("Đã đổi chủ đề đoạn chat");
    onThemeChange?.(backgroundUrlDraft || "", backgroundColorDraft || "", accentDraft || "");
  };

  return (
    <div>
      <MenuItemSetting
        icon={<BgColorsOutlined style={{ color: "#5B61FF" }} />}
        label="Đổi chủ đề & hình nền"
        onClick={handleOpenModal}
      />

      <Modal
        title="Đổi chủ đề & hình nền"
        open={themeModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        styles={{
          body: {
            maxHeight: "75vh",
            overflowY: "auto",
          },
        }}
      >
        <p className={styles.modalDesc}>Chọn màu đoạn chat và hình nền.</p>

        <div className={styles.modalBody}>
          <div className={styles.leftPane}>
            <div className={styles.sectionLabel}>Chủ đề</div>
            <div className={styles.themeGrid}>
              {BG_PRESETS.map((preset) => {
                const isActive = backgroundUrlDraft === preset.color;
                return (
                  <div
                    key={preset.id}
                    className={`${styles.themeSwatch}`}
                    style={
                      {
                        backgroundImage: `url(${preset.url})`,
                        "--accent": preset.color,
                      } as React.CSSProperties
                    }
                    onClick={() => handlePickPreset(preset)}
                    title={preset.name}
                  >
                    <span className={styles.bgOverlay} />
                    {isActive && <span className={styles.bgCheck}>✓</span>}
                  </div>
                );
              })}
            </div>

            <div className={styles.sectionLabel}>Màu sắc</div>
            <div className={styles.colorGrid}>
              {BASIC_PRESETS.map((preset) => {
                const isActive = accentDraft === preset.color;
                return (
                  <div
                    key={preset.id}
                    className={`${styles.colorSwatch}`}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => handlePickPreset(preset)}
                    title={preset.name}
                  >
                    <span className={styles.bgOverlay} />
                    {isActive && <span className={styles.bgCheck}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.rightPane}>
            <div className={styles.sectionLabel}>Xem trước</div>
            <div
              className={`${styles.preview}`}
              style={
                {
                  backgroundColor: backgroundUrlDraft || undefined,
                  backgroundImage: backgroundUrlDraft || undefined ? `url(${backgroundUrlDraft})` : undefined,
                  "--accent": accentDraft || undefined,
                } as React.CSSProperties
              }
            >
              <div className={`${styles.previewBubble} ${styles.previewBubbleMe}`}>hello!</div>
              <div className={styles.previewBubble}>hi!</div>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" onClick={handleConfirm}>
            Chọn
          </Button>
        </div>
      </Modal>
    </div>
  );
}
