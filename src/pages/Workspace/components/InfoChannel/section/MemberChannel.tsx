import { useCallback } from "react";
import {
  MessageSquare,
  MoreHorizontal,
  Phone,
  UserCircle,
  UserPlus,
  UserX,
  Video,
} from "lucide-react";
import { Dropdown, type MenuProps } from "antd";
import CollapsibleSection from "../../../../../components/CollapsibleSection/CollapsibleSection";
import AvatarFallback from "../../../../../components/AvatarFallback/AvatarFallback";
import {
  RoleMemberChannel,
  type MemberChannel as MemberChannelType,
} from "../../../../../types/channel.type";
import type { StatusUser } from "../../../../../types/friend.type";
import styles from "./MemberChannel.module.scss";

interface MemberChannelProps {
  members: MemberChannelType[];
}

export default function MemberChannel({ members }: MemberChannelProps) {
  const getMemberMenuItems = useCallback(
    (member: MemberChannelType): MenuProps["items"] => [
      {
        key: "message",
        label: "Nhắn tin",
        icon: <MessageSquare size={16} />,
        onClick: () => console.log("Nhắn tin", member.userId),
      },
      {
        key: "profile",
        label: "Xem trang cá nhân",
        icon: <UserCircle size={16} />,
        onClick: () => console.log("Xem trang cá nhân", member.userId),
      },
      {
        key: "block",
        label: "Chặn",
        icon: <UserX size={16} />,
        onClick: () => console.log("Chặn", member.userId),
      },
      {
        key: "call",
        label: "Gọi thoại",
        icon: <Phone size={16} />,
        onClick: () => console.log("Gọi thoại", member.userId),
      },
      {
        key: "video",
        label: "Chat video",
        icon: <Video size={16} />,
        onClick: () => console.log("Chat video", member.userId),
      },
    ],
    [],
  );

  const handleAddMember = useCallback(() => {
    console.log("Thêm thành viên");
  }, []);

  return (
    <CollapsibleSection title="Thành viên trong kênh" defaultOpen>
      <div className={styles.memberList}>
        {members.map((member) => (
          <div key={member.userId} className={styles.memberItem}>
            <AvatarFallback
              src={member.avatar}
              alt={member.displayName}
              size={32}
              status={member.status as StatusUser}
              showStatus={false}
            />

            <div className={styles.memberInfo}>
              <span className={styles.memberName}>{member.displayName}</span>
              <span className={styles.memberDesc}>
                {member.role === RoleMemberChannel.ADMIN ? "Người tạo kênh" : "Thành viên"}
              </span>
            </div>

            <Dropdown
              menu={{ items: getMemberMenuItems(member) }}
              trigger={["click"]}
              placement="leftTop"
            >
              <button
                type="button"
                className={styles.menuBtn}
                title="Tuỳ chọn"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>
        ))}

        <button type="button" className={styles.addMemberBtn} onClick={handleAddMember}>
          <UserPlus size={18} />
          <span>Thêm thành viên</span>
        </button>
      </div>
    </CollapsibleSection>
  );
}
