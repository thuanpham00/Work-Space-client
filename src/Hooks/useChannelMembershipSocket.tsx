import { useEffect } from "react";
import { App } from "antd";
import { useQueryClient } from "react-query";
import { useBaseStore } from "../store/baseStore";
import { useUserStore } from "../store/userStore";
import type {
  ChannelInviteResolvedPayload,
  ChannelInviteRevokedPayload,
  ChannelInvitedPayload,
  ChannelRequestResolvedPayload,
} from "../types/channel.type";

/**
 * ============================================================================
 *  Nhóm 1 — Socket listener cho NGƯỜI BỊ TÁC ĐỘNG
 * ============================================================================
 *
 *  Server emit các event sau vào room `user:{userId}`:
 *    - channel_invited          : user được mời vào channel
 *    - channel_invite_revoked   : lời mời bị thu hồi
 *    - channel_request_resolved : yêu cầu tham gia được duyệt / từ chối
 *    - channel_invite_resolved  : lời mời được accept / reject (đồng bộ tab khác)
 *    - workspace_updated        : membership workspace đổi → sidebar refresh
 *
 *  Mỗi event đều yêu cầu invalidate cache phía client, vì các query của
 *  client có staleTime khá dài (5–15 phút) nên không tự refetch.
 */
export function useChannelMembershipSocket() {
  const socket = useBaseStore((state) => state.socket);
  const accessToken = useUserStore((state) => state.accessToken);
  const currentUserId = useUserStore((state) => state.user?.id);
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !accessToken) return;

    /** Invalidate cache liên quan tới channel (detail + messages + requests) */
    const invalidateChannel = (channelId: string) => {
      queryClient.invalidateQueries({ queryKey: ["channelDetail", channelId, accessToken] });
      queryClient.invalidateQueries({ queryKey: ["infoChannel", channelId] });
      queryClient.invalidateQueries({ queryKey: ["messageChannel", channelId] });
      queryClient.invalidateQueries({ queryKey: ["attachmentsChannel", channelId] });
    };

    /** Invalidate toàn bộ cache liên quan tới workspace + danh sách workspace */
    const invalidateWorkspace = (workspaceId: string) => {
      queryClient.invalidateQueries({ queryKey: ["workspaceList", accessToken] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["unreadChannel", accessToken] });
    };

    const invalidateNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notificationList", accessToken] }); // nhận thông báo thì gọi server lấy data mới còn khi thao tác trên client thì cập nhật cache lại
    };

    // ko truyền param vào query key để nó match mọi query có prefix invite
    const invalidateInvite = () => {
      queryClient.invalidateQueries({ queryKey: ["invite"] }); // nhận thông báo thì gọi server lấy data mới còn khi thao tác trên client thì cập nhật cache lại
    };

    // ========== 1. Được mời vào channel ==========
    // refresh thông báo + toast
    const handleChannelInvited = (data: ChannelInvitedPayload) => {
      notification.info({
        message: "Bạn được mời vào kênh",
        description: `${data.invitedByName} đã mời bạn vào ${data.channelName ?? "kênh"}`,
        placement: "topRight",
        duration: 6,
      });

      invalidateNotification();
      invalidateInvite();
    };

    // ========== 2. Lời mời bị thu hồi ==========
    // refresh thông báo
    const handleChannelInviteRevoked = (data: ChannelInviteRevokedPayload) => {
      console.log("handleChannelInviteRevoked", data);
      invalidateNotification();
      invalidateInvite();
    };

    // // ========== 3. Lời mời được accept / reject (đồng bộ tab khác) ==========
    const handleChannelInviteResolved = (data: ChannelInviteResolvedPayload) => {
      const isAccepted = data.action === "accepted";

      if (data.actorId === currentUserId && isAccepted) {
        invalidateWorkspace(data.workspaceId as string);
        invalidateNotification();

        notification.success({
          message: "Đã tham gia kênh",
          description: `Bạn đã tham gia kênh ${data.channelName ?? "kênh"}`,
          placement: "topRight",
          duration: 6,
        });
      }
      invalidateInvite();
    };

    // // ========== 4. Yêu cầu tham gia được duyệt / từ chối ==========
    const handleChannelRequestResolved = (data: ChannelRequestResolvedPayload) => {
      const isAccepted = data.action === "approved";

      if (isAccepted) {
        invalidateWorkspace(data.workspaceId as string);
        invalidateNotification();

        notification.success({
          message: isAccepted ? "Yêu cầu tham gia đã được duyệt" : "Yêu cầu tham gia bị từ chối",
          description: `${data.resolvedByName} đã ${isAccepted ? "duyệt" : "từ chối"} yêu cầu vào ${data.channelName ?? "kênh"}`,
          placement: "topRight",
          duration: 6,
        });
      }
      invalidateInvite();
    };

    socket.on("channel_invited", handleChannelInvited);
    socket.on("channel_invite_revoked", handleChannelInviteRevoked);
    socket.on("channel_invite_resolved", handleChannelInviteResolved);
    socket.on("channel_request_resolved", handleChannelRequestResolved);

    return () => {
      socket.off("channel_invited", handleChannelInvited);
      socket.off("channel_invite_revoked", handleChannelInviteRevoked);
      socket.off("channel_invite_resolved", handleChannelInviteResolved);
      socket.off("channel_request_resolved", handleChannelRequestResolved);
    };
  }, [socket, accessToken, currentUserId, notification, queryClient]);
}
