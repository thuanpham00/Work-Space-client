import { Empty, Input, List, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "./AddFriendModal.module.scss";
import { useQuery } from "react-query";
import { userAPI } from "../../../../apis/user.api";
import type { ListUserParamsType } from "../../../../types/user.type";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { FriendStatusRow } from "../StatusUser/StatusUsers";
import { FullProfileModal, type FullProfileModalRef } from "../FullProfileModal/FullProfileModal";
import { queryClient } from "../../../../main";

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
    const [query, setQuery] = useState<ListUserParamsType>({ page: 1, limit: 10, search: "" });
    const [selectedUserId, setSelectedUserId] = useState("");
    const profileModalRef = useRef<FullProfileModalRef>(null);

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

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setSearch("");
      setSelectedUserId("");
    };

    const handleOpenProfile = (userId: string) => {
      flushSync(() => {
        setSelectedUserId(userId);
      });
      profileModalRef.current?.openModal();
    };

    const handleFriendRequestChange = () => {
      queryClient.invalidateQueries({ queryKey: ["listUser"] });
      onSubmitOk?.();
    };

    return (
      <>
        <Modal
          onCancel={handleClose}
          open={visible}
          title="Thêm bạn bè"
          style={{ top: 20 }}
          width={600}
          footer={null}
          mask={{ closable: false }}
        >
          <div className={styles.searchSection}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm theo tên hoặc username"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.resultCount}>Kết quả tìm thấy: {total}</div>
            <List
              dataSource={listUser}
              className={`${styles.list} ${styles.listWrapper}`}
              renderItem={(u) => (
                <List.Item className={styles.listItem} onClick={() => handleOpenProfile(u.id)}>
                  <FriendStatusRow friend={u} />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="Không tìm thấy user" /> }}
            />
          </div>
        </Modal>

        <FullProfileModal
          ref={profileModalRef}
          userId={selectedUserId}
          enableFriendRequest
          onFriendRequestChange={handleFriendRequestChange}
          onMessageClick={handleClose}
        />
      </>
    );
  },
);

AddFriendModal.displayName = "AddFriendModal";
