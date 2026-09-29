import { useMemo, useRef, useState } from "react";
import styles from "./SidebarWorkSpace.module.scss";
import type { WorkspaceMemberRole, WorkspaceType } from "../../../../types/workspace.type";
import { Button, Tooltip } from "antd";
import { FolderPlus, Hash, Lock, Pencil, Plus, UserRoundPlus } from "lucide-react";
import { CategoryChannelModal } from "../CategoryChannelModal/CategoryChannelModal";
import { queryClient } from "../../../../main";
import { useChannelStore } from "../../../../store/channelStore";
import type { WorkspaceMemberModalRef } from "../ChannelMemberModal/ChannelMemberModal";
import WorkspaceMemberModal from "../ChannelMemberModal/ChannelMemberModal";
import { ChannelModal } from "../ChannelModal/ChannelModal";

interface SidebarWorkSpaceProps {
  data: WorkspaceType;
  workspaceId: string;
}

export default function SidebarWorkSpace({ data, workspaceId }: SidebarWorkSpaceProps) {
  const modalCategoryChannelRef = useRef<CategoryChannelModal>(null);
  const modalChannelRef = useRef<ChannelModal>(null);
  const modalMemberRef = useRef<WorkspaceMemberModalRef>(null);
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
        <div className={styles.swTitleRow}>
          <div className={styles.swTitle}>{data.name}</div>
          <Tooltip title="Thành viên workspace">
            <Button
              type="text"
              className={styles.swMemberBtn}
              onClick={() => modalMemberRef.current?.handleOpen()}
              aria-label="Xem thành viên workspace"
            >
              <UserRoundPlus size={18} />
            </Button>
          </Tooltip>
        </div>

        <div className={styles.swGroupActions}>
          <Button
            type="primary"
            className={`${styles.swPrimaryAction} ${styles.swTopicAction}`}
            onClick={() => modalCategoryChannelRef.current?.handleCreate(data.id)}
            aria-label="Thêm chủ đề mới"
            title="Thêm chủ đề mới"
          >
            <FolderPlus size={16} />
            <span className={styles.swActionLabel}>Chủ đề</span>
          </Button>

          <Button
            type="primary"
            className={`${styles.swPrimaryAction} ${styles.swChannelAction}`}
            onClick={() => modalChannelRef.current?.handleCreate(data.id)}
            aria-label="Thêm kênh chat mới"
            title="Thêm kênh chat mới"
          >
            <Plus size={14} />
            <span className={styles.swActionLabel}>Kênh chat</span>
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
                    chooseChannelWorkspace(
                      data.id,
                      ch.id,
                      ch.name || "",
                      data.role as WorkspaceMemberRole,
                      ch.role,
                    );
                  }}
                  title={ch.name}
                >
                  {ch.isPrivate ? (
                    <Lock className={styles.swHash} size={16} />
                  ) : (
                    <Hash className={styles.swHash} size={16} />
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

      <WorkspaceMemberModal ref={modalMemberRef} />
    </aside>
  );
}
