import { useMemo, useRef, useState } from "react";
import styles from "./SidebarWorkSpace.module.scss";
import type { WorkspaceType } from "../../../types/workspace.type";
import { Button } from "antd";
import { ChartBarStacked, Hash, Lock, Pencil, Ungroup } from "lucide-react";
import { CategoryChannelModal } from "./CategoryChannelModal";
import { queryClient } from "../../../main";
import { ChannelModal } from "./ChannelModal";
import { useChannelStore } from "../../../store/channelStore";

interface SidebarWorkSpaceProps {
  data: WorkspaceType;
  workspaceId: string;
}

export default function SidebarWorkSpace({ data, workspaceId }: SidebarWorkSpaceProps) {
  const modalCategoryChannelRef = useRef<CategoryChannelModal>(null);
  const modalChannelRef = useRef<ChannelModal>(null);
  const chooseChannelWorkspace = useChannelStore((app) => app.chooseChannelWorkspace);

  const groups = useMemo(
    () => data?.categories.sort((a, b) => a.position - b.position) ?? [],
    [data?.categories],
  );
  const [selected, setSelected] = useState<string>("");

  const firstChannelId = useMemo(() => {
    return groups.flatMap((group) => group.channels)[0]?.id ?? "";
  }, [groups]);

  const activeChannelId = selected || firstChannelId;

  if (!data) return null;

  const refreshDataWorkspaceDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
  };

  return (
    <aside className={styles.swSidebar}>
      <div className={styles.swTop}>
        <div className={styles.swTitle}>{data.name}</div>

        <div className={styles.swGroupActions}>
          <Button
            type="primary"
            className={`${styles.swPrimaryAction} ${styles.swTopicAction}`}
            title="Thêm chủ đề mới"
            onClick={() => modalCategoryChannelRef.current?.handleCreate(data.id)}
          >
            <ChartBarStacked size={16} />
          </Button>

          <Button
            type="primary"
            className={`${styles.swPrimaryAction} ${styles.swChannelAction}`}
            title="Thêm kênh chat"
            onClick={() => modalChannelRef.current?.handleCreate(data.id)}
          >
            <Ungroup size={14} />
          </Button>
        </div>
      </div>

      <div className={styles.swList}>
        {groups.map((group) => (
          <div className={styles.swGroup} key={group.id}>
            <div className={styles.swGroupHeader}>
              <span className={styles.swGroupTitle}>{group.name}</span>

              <Button
                type="link"
                className="p-0!"
                title="Chỉnh sửa chủ đề"
                onClick={() => modalCategoryChannelRef.current?.handleUpdate(group)}
              >
                <Pencil size={14} />
              </Button>
            </div>

            <ul className={styles.swChannels}>
              {group.channels.map((ch) => (
                <li
                  key={ch.id}
                  className={`${styles.swChannel} ${activeChannelId === ch.id ? styles.swSelected : ""}`}
                  onClick={() => {
                    setSelected(ch.id);
                    chooseChannelWorkspace(data.id, ch.id);
                  }}
                  title={ch.name}
                >
                  {ch.isPrivate ? (
                    <Lock className={styles.swHash} size={18} />
                  ) : (
                    <Hash className={styles.swHash} size={18} />
                  )}
                  <span className={styles.swName}>{ch.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <CategoryChannelModal
        ref={modalCategoryChannelRef}
        onSubmitOk={() => refreshDataWorkspaceDetail()}
        onClose={() => {}}
      />

      <ChannelModal
        ref={modalChannelRef}
        onSubmitOk={() => refreshDataWorkspaceDetail()}
        onClose={() => {}}
      />
    </aside>
  );
}
