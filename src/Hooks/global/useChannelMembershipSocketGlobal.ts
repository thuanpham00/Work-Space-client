import { useEffect } from "react";
import { App } from "antd";
import { useQueryClient } from "react-query";
import { useBaseStore } from "../../store/baseStore";
import { useUserStore } from "../../store/userStore";
import { SOCKET_LISTEN_EVENT } from "../events";
import type {
  ChannelInviteResolvedPayload,
  ChannelInviteRevokedPayload,
  ChannelInviteWithdrawnPayload,
  ChannelInvitedPayload,
  ChannelRequestCancelledPayload,
  ChannelRequestResolvedPayload,
  ChannelRequestSentPayload,
  ChannelRequestWithdrawnPayload,
} from "../../types/channel.type";

/** Socket membership channel: B nhận resolved, A nhận withdrawn. Mỗi event đều invalidate cache (staleTime 5-15p). */
export function useChannelMembershipSocketGlobal() {
  const socket = useBaseStore((state) => state.socket);
  const accessToken = useUserStore((state) => state.accessToken);
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !accessToken) return;

    // Refresh list duyệt + list mời
    const invalidateChannelRequest = (channelId: string) => {
      queryClient.invalidateQueries({ queryKey: ["ChannelRequestList", channelId] });
      queryClient.invalidateQueries({ queryKey: ["friendInviteChannel", channelId] });
    };

    // Refresh sidebar/workspace
    const invalidateWorkspace = (workspaceId: string) => {
      queryClient.invalidateQueries({ queryKey: ["workspaceList", accessToken] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["unreadChannel", accessToken] });
    };

    // Refresh chuông
    const invalidateNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notificationList", accessToken] });
    };

    // Refresh invite (match prefix "invite")
    const invalidateInvite = () => {
      queryClient.invalidateQueries({ queryKey: ["invite"] });
    };

    // 1. B được mời → toast + refresh chuông/invite
    const handleChannelInvited = (data: ChannelInvitedPayload) => {
      notification.info({
        message: "Bạn được mời vào kênh",
        description: `${data.invitedByName} đã mời bạn vào ${data.channelName ?? "kênh chat"}`,
        placement: "topRight",
        duration: 4,
      });

      invalidateNotification();
      invalidateInvite();
    };

    // 2. Lời mời bị thu hồi → refresh chuông/invite
    const handleChannelInviteRevoked = (data: ChannelInviteRevokedPayload) => {
      console.log("handleChannelInviteRevoked", data);
      invalidateNotification();
      invalidateInvite();
    };

    // 3. B gửi yêu cầu → toast + refresh chuông/invite
    const handleChannelRequestSent = (data: ChannelRequestSentPayload) => {
      notification.info({
        message: "Yêu cầu tham gia được gửi",
        description: `Bạn đã gửi yêu cầu tham gia ${data.channelName ?? "kênh chat"}`,
        placement: "topRight",
        duration: 4,
      });
      invalidateNotification();
      invalidateInvite();
    };

    // 4. B hủy yêu cầu → refresh chuông/invite (đồng bộ tab khác)
    const handleChannelRequestCancelled = (data: ChannelRequestCancelledPayload) => {
      console.log("handleChannelRequestCancelled", data);
      invalidateNotification();
      invalidateInvite();
    };

    // 5. B accept/reject (tab khác của B) → accept: refresh workspace + toast; reject: gỡ trạng thái invite
    const handleChannelInviteResolved = (data: ChannelInviteResolvedPayload) => {
      const isAccepted = data.action === "accepted";

      if (isAccepted) {
        if (data.workspaceId) invalidateWorkspace(data.workspaceId);
        invalidateNotification();

        notification.success({
          message: "Đã tham gia kênh",
          description: `Bạn đã tham gia kênh ${data.channelName ?? "kênh chat"}`,
          placement: "topRight",
          duration: 4,
        });
      } else {
        invalidateNotification();
      }
      invalidateInvite();
    };

    // 6. B được duyệt/từ chối → toast + refresh (accept thêm workspace)
    const handleChannelRequestResolved = (data: ChannelRequestResolvedPayload) => {
      const isAccepted = data.action === "approved";

      if (isAccepted) {
        invalidateWorkspace(data.workspaceId as string);
      }
      notification[isAccepted ? "success" : "error"]({
        message: isAccepted ? "Yêu cầu tham gia đã được duyệt" : "Yêu cầu tham gia bị từ chối",
        description: `${data.resolvedByName} đã ${isAccepted ? "duyệt" : "từ chối"} yêu cầu vào ${data.channelName ?? "kênh chat"}`,
        placement: "topRight",
        duration: 4,
      });
      invalidateNotification();
      invalidateInvite();
    };

    // 7. A: biến động join-request (requested/cancelled/approved/rejected) → requested toast, approved refresh channelDetail
    const handleChannelRequestWithdrawn = (data: ChannelRequestWithdrawnPayload) => {
      if (data.action === "requested") {
        notification.info({
          message: "Bạn có yêu cầu tham gia kênh",
          description: `${data.requesterName} đã gửi yêu cầu tham gia ${data.channelName ?? "kênh chat"}`,
          placement: "topRight",
          duration: 4,
        });
      }

      if (data.action === "approved") {
        queryClient.invalidateQueries({ queryKey: ["channelDetail", data.channelId, accessToken] });
      }

      invalidateNotification();
      invalidateChannelRequest(data.channelId);
    };

    // 8. A: B accept/reject invite → toast + refresh list + channelDetail (nếu accepted)
    const handleChannelInviteWithdrawn = (data: ChannelInviteWithdrawnPayload) => {
      const isAccepted = data.action === "accepted";
      const actorName = data.actorName ?? "Người dùng";

      notification[isAccepted ? "success" : "info"]({
        message: isAccepted ? "Có thành viên mới tham gia" : "Lời mời bị từ chối",
        description: isAccepted
          ? `${actorName} đã tham gia ${data.channelName ?? "kênh chat"}`
          : `${actorName} đã từ chối lời mời vào ${data.channelName ?? "kênh chat"}`,
        placement: "topRight",
        duration: 4,
      });

      invalidateNotification();
      invalidateChannelRequest(data.channelId);
      if (isAccepted) {
        queryClient.invalidateQueries({ queryKey: ["channelDetail", data.channelId, accessToken] });
      }
    };

    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_INVITED, handleChannelInvited);
    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_REVOKED, handleChannelInviteRevoked);
    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_SENT, handleChannelRequestSent);
    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_CANCELLED, handleChannelRequestCancelled);

    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_RESOLVED, handleChannelInviteResolved);
    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_RESOLVED, handleChannelRequestResolved);

    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_WITHDRAWN, handleChannelInviteWithdrawn);
    socket.on(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_WITHDRAWN, handleChannelRequestWithdrawn);

    return () => {
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_INVITED, handleChannelInvited);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_REVOKED, handleChannelInviteRevoked);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_SENT, handleChannelRequestSent);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_CANCELLED, handleChannelRequestCancelled);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_RESOLVED, handleChannelInviteResolved);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_RESOLVED, handleChannelRequestResolved);

      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_INVITE_WITHDRAWN, handleChannelInviteWithdrawn);
      socket.off(SOCKET_LISTEN_EVENT.CHANNEL_REQUEST_WITHDRAWN, handleChannelRequestWithdrawn);
    };
  }, [socket, accessToken, notification, queryClient]);
}
