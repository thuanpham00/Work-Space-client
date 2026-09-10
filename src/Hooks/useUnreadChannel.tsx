/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from "react-query";
import { channelApi } from "../apis/channel.api";
import { useEffect } from "react";
import { useUnreadStore } from "../store/unreadStore";

export function useUnreadCHannel(token?: string | null) {
  const loadDataUnreadChannel = useUnreadStore((state) => state.loadDataUnreadChannel);

  const { data: dataUnreadChannel } = useQuery({
    queryKey: ["unreadChannel", token],
    queryFn: () => channelApi.unreadChannel(),
    enabled: !!token,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  useEffect(() => {
    if (dataUnreadChannel) {
      loadDataUnreadChannel(dataUnreadChannel?.data?.data?.unreadFriends || []);
    }
  }, [dataUnreadChannel]);
}
