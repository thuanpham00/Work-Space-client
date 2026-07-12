import { Avatar, Button, Divider, Empty, Input, List, message, Modal } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import React, { useEffect, useImperativeHandle, useState } from "react";
import styles from "./AddFriendModal.module.scss";
import { useQuery } from "react-query";
import { userAPI } from "../../../apis/user.api";
import type { ListUserParamsType, UserType } from "../../../types/user.type";
import { useDebounce } from "../../../Hooks/useDebounce";

export interface AddFriendRef {
  handleOpen: () => void;
}

interface AddFriendModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const AddFriendModal = React.forwardRef<AddFriendRef, AddFriendModalProps>(
  ({ onClose, onSubmitOk }, ref) => {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [sending, setSending] = useState(false);
    const [query, setQuery] = useState<ListUserParamsType>({ page: 1, limit: 10, search: "" });

    useImperativeHandle(
      ref,
      () => ({
        handleOpen() {
          setVisible(true);
        },
      }),
      [],
    );

    useEffect(() => {
      if (!visible) {
        setSearch("");
        setSelectedUser(null);
        setSending(false);
      }
    }, [visible]);

    const { data } = useQuery({
      queryKey: ["listUser", query],
      queryFn: () => userAPI.list(query),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
    });

    const listUser = data?.data.data.users ?? [];
    const total = data?.data.data.total ?? 0;

    const handleClose = () => {
      onClose?.();
      setVisible(false);
    };

    const handleSendRequest = async () => {
      if (!selectedUser) return;
      setSending(true);
      await new Promise((r) => setTimeout(r, 600));
      setSending(false);
      message.success(`Đã gửi lời mời kết bạn tới ${selectedUser.fullName}`);
      onSubmitOk?.();
      handleClose();
    };

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
      setQuery((prev) => ({
        ...prev,
        page: 1,
        search: debouncedSearch.trim(),
      }));
    }, [debouncedSearch]);

    return (
      <Modal
        onCancel={handleClose}
        open={visible}
        title="Thêm bạn bè"
        style={{ top: 20 }}
        width={1200}
        footer={null}
      >
        <div style={{ display: "flex", gap: 16, minHeight: 420 }}>
          <div style={{ flex: "0 0 65%" }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm theo tên hoặc username"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ marginTop: 12, fontSize: 14, color: "#888" }}>Kết quả tìm thấy: {total}</div>
            <List
              style={{ marginTop: 12, maxHeight: 500, overflowY: "auto" }}
              dataSource={listUser}
              className={styles.list}
              renderItem={(u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <List.Item
                    onClick={() => setSelectedUser(u)}
                    style={{
                      cursor: "pointer",
                      background: isSelected ? "#f0f5ff" : undefined,
                      padding: "8px 12px",
                      borderRadius: 6,
                      transition: "background-color 0.15s",
                    }}
                  >
                    <List.Item.Meta
                      className={styles.listItem}
                      avatar={<Avatar src={u.avatar}>{u.username.charAt(0)}</Avatar>}
                      title={u.username}
                      description={u.fullName}
                    />
                  </List.Item>
                );
              }}
              locale={{ emptyText: <Empty description="Không tìm thấy user" /> }}
            />
          </div>

          <div style={{ flex: "0 0 calc(35% - 16px)", paddingLeft: 16, borderLeft: "1px solid #f0f0f0" }}>
            {selectedUser ? (
              <div>
                <div style={{ textAlign: "center" }}>
                  <Avatar size={88} src={selectedUser.avatar}>
                    {selectedUser.fullName.charAt(0)}
                  </Avatar>
                  <h3 style={{ marginTop: 12, marginBottom: 4 }}>{selectedUser.fullName}</h3>
                  <div style={{ color: "#888" }}>@{selectedUser.username}</div>
                </div>
                <Divider style={{ margin: "16px 0" }} />
                <p style={{ marginBottom: 8 }}>
                  <b>Bio:</b> {selectedUser.bio ?? "-"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <b>Email:</b> {selectedUser.email ?? "-"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <b>Phone:</b> {selectedUser.phone ?? "-"}
                </p>
                <Divider style={{ margin: "16px 0" }} />
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  block
                  loading={sending}
                  onClick={handleSendRequest}
                >
                  Kết bạn
                </Button>
              </div>
            ) : (
              <Empty description="Chọn user bên trái để xem chi tiết" style={{ marginTop: 80 }} />
            )}
          </div>
        </div>
      </Modal>
    );
  },
);
