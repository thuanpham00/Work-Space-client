import { useState } from "react";
import styles from "./SidebarWorkSpace.module.scss";
import type { WorkspaceType } from "../../../types/workspace.type";
import { Button } from "antd";
import { Plus } from "lucide-react";

type Group = {
  title: string;
  channels: string[];
};

const groups: Group[] = [
  {
    title: "BMD",
    channels: [
      "official",
      "dev",
      "bmd-training",
      "bmd-frontend",
      "yeu-cau-deploy",
      "yêu-cầu-frontend",
      "yêu-cầu-backend",
      "yêu-cầu-qc",
      "bmd-task",
    ],
  },
  {
    title: "Project",
    channels: [
      "apjsc",
      "285-kaf",
      "302-ichimoku",
      "303-intage",
      "309-qlsxcc",
      "320-minh-global",
      "369-abn",
      "noi-bo-erp",
    ],
  },
  {
    title: "Console",
    channels: ["bmd-report", "khach-hang-thao-tac", "reopen-log"],
  },
];

interface SidebarWorkSpaceProps {
  data: WorkspaceType;
}

export default function SidebarWorkSpace({ data }: SidebarWorkSpaceProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => (init[g.title] = true));
    return init;
  });
  const [selected, setSelected] = useState<string>("bmd-report");
  if (!data) return null;

  return (
    <aside className={styles.swSidebar}>
      <div className={styles.swTop}>
        <div className={styles.swTitle}>{data.name}</div>

        <Button type="link" className="p-0!" title="Thêm chủ đề mới">
          <Plus size={16} />
        </Button>
      </div>

      <div className={styles.swList}>
        {groups.map((group) => (
          <div className={styles.swGroup} key={group.title}>
            <div
              className={styles.swGroupHeader}
              onClick={() => setExpanded((s) => ({ ...s, [group.title]: !s[group.title] }))}
            >
              <span className={`${styles.swCaret} ${expanded[group.title] ? styles.swCaretOpen : ""}`}>
                ▾
              </span>
              <span className={styles.swGroupTitle}>{group.title}</span>
            </div>

            {expanded[group.title] && (
              <ul className={styles.swChannels}>
                {group.channels.map((ch) => (
                  <li
                    key={ch}
                    className={`${styles.swChannel} ${selected === ch ? styles.swSelected : ""}`}
                    onClick={() => setSelected(ch)}
                    title={ch}
                  >
                    <span className={styles.swHash}>#</span>
                    <span className={styles.swName}>{ch}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
