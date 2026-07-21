/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Button, Divider, Empty, Input, List, message, Modal } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import React, { useEffect, useImperativeHandle, useState } from "react";
import styles from "./AddFriendModal.module.scss";
import { useMutation, useQuery } from "react-query";
import { userAPI } from "../../../apis/user.api";
import type { ListUserParamsType, UserType } from "../../../types/user.type";
import { useDebounce } from "../../../Hooks/useDebounce";
import { useAppStore } from "../../../store/store";
import { X } from "lucide-react";
import { friendApi } from "../../../apis/friend.api";
import { queryClient } from "../../../main";

export interface AddFriendRef {
  handleOpen: () => void;
}

interface AddFriendModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const AddFriendModal = React.forwardRef<AddFriendRef, AddFriendModalProps>(
  ({ onClose, onSubmitOk }, ref) => {
    const isDarkMode = useAppStore((s) => s.isDarkMode);
    const [visible, setVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const [search, setSearch] = useState("");
    const [sending, setSending] = useState(false);
    const [query, setQuery] = useState<ListUserParamsType>({ page: 1, limit: 10, search: "" });
    const [addressId, setAddressId] = useState<string | null>(null);
    const [typeStatus, setTypeStatus] = useState<"add" | "cancel">("add");

    useImperativeHandle(
      ref,
      () => ({
        handleOpen() {
          setVisible(true);
        },
      }),
      [],
    );

    const { data } = useQuery({
      queryKey: ["listUser", query],
      queryFn: () => userAPI.list(query),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
    });

    const listUser = data?.data.data.users ?? [];
    const total = data?.data.data.total ?? 0;

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
      setQuery((prev) => ({
        ...prev,
        page: 1,
        search: debouncedSearch.trim(),
      }));
    }, [debouncedSearch]);

    useEffect(() => {
      if (listUser.length > 0) {
        setAddressId(listUser[0].id);
      }
    }, [listUser]);

    const addFriendMutation = useMutation({
      mutationFn: (friendId: string) => friendApi.addFriend(friendId),
    });

    const handleSendRequest = async () => {
      if (!addressId) return;
      setSending(true);
      try {
        await addFriendMutation.mutateAsync(addressId);
        message.success(
          `Đã ${typeStatus === "add" ? "gửi lời mời kết bạn" : "hủy lời mời"} tới ${dataUser?.data.data.user.fullName}`,
        );
        setConfirmVisible(false);
        refetch();
        onSubmitOk?.();
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      } catch (error) {
        console.log(error);
        message.error(`Có lỗi xảy ra khi ${typeStatus === "add" ? "gửi lời mời kết bạn" : "hủy lời mời"}`);
      } finally {
        setSending(false);
      }
    };

    const { data: dataUser, refetch } = useQuery({
      queryKey: ["infoUser", addressId],
      queryFn: () => userAPI.infoUserStatus(addressId as string),
      staleTime: 1000 * 60 * 5,
      enabled: !!addressId,
    });

    const selectedUser = dataUser?.data.data.user as UserType;

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setConfirmVisible(false);
      setSearch("");
      setSending(false);
      setAddressId(null);
      setTypeStatus("add");
    };

    return (
      <div>
        <Modal
          onCancel={handleClose}
          open={visible}
          title="Thêm bạn bè"
          style={{ top: 20 }}
          width={1200}
          footer={null}
          maskClosable={false}
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
                  const isSelected = addressId === u.id;
                  return (
                    <List.Item
                      onClick={() => setAddressId(u.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? (isDarkMode ? "#333" : "#f0f5ff") : undefined,
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
              {dataUser ? (
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

                  {selectedUser.receivedFriendRequests && selectedUser.receivedFriendRequests.length > 0 ? (
                    <>
                      <Button
                        block
                        type="primary"
                        loading={sending}
                        onClick={() => {
                          setTypeStatus("cancel");
                          setConfirmVisible(true);
                        }}
                      >
                        <X />
                        Hủy lời mời
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      block
                      loading={sending}
                      onClick={() => {
                        setTypeStatus("add");
                        setConfirmVisible(true);
                      }}
                    >
                      Kết bạn
                    </Button>
                  )}
                </div>
              ) : (
                <Empty description="Chọn user bên trái để xem chi tiết" style={{ marginTop: 80 }} />
              )}
            </div>
          </div>
        </Modal>

        <Modal
          open={confirmVisible}
          title={typeStatus === "add" ? "Xác nhận gửi lời mời kết bạn" : "Xác nhận hủy lời mời kết bạn"}
          onCancel={() => setConfirmVisible(false)}
          onOk={handleSendRequest}
          okText={typeStatus === "add" ? "Gửi kết bạn" : "Hủy lời mời"}
          cancelText="Hủy"
          confirmLoading={sending}
          destroyOnClose
        >
          <p style={{ marginBottom: 0 }}>
            Xác nhận {typeStatus === "add" ? "Gửi lời mời kết bạn" : "Hủy lời mời"} tới{" "}
            <b>{selectedUser?.fullName}</b> không?
          </p>
        </Modal>
      </div>
    );
  },
);
