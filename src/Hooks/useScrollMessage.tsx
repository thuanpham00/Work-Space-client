/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { LIMIT, PAGE } from "../constants/config";
import type { QueryBase } from "../types/query.type";
import type { Message } from "../types/message.type";
import { useQuery } from "react-query";
import { useChannelStore } from "../store/channelStore";
import { useUserStore } from "../store/userStore";
import { channelApi } from "../apis/channel.api";

export default function useScrollMessage() {
  const channelId = useChannelStore((app) => app.channelId);
  const token = useUserStore((app) => app.accessToken);

  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState<QueryBase>({
    limit: LIMIT,
    page: PAGE,
  });
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });


  const { data: dataMessage } = useQuery({
    queryKey: ["messageChannel", channelId, query, token],
    queryFn: () => channelApi.getMessagesChannel(channelId as string, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000 * 1,
  });

  const conversationListData = dataMessage?.data?.data?.messages as Message[];
  const page = dataMessage?.data?.data?.page as number;
  const total_page = dataMessage?.data?.data?.total_page as number;

  useEffect(() => {
    if (!conversationListData) return;
    if (page === PAGE) setMessages(conversationListData);
    else setMessages((prev) => [...prev, ...conversationListData]);
    setPagination({ page, total_page });
  }, [conversationListData, page, total_page]);

  const fetchConversationDataMore = () => {
    if (pagination.page < pagination.total_page) {
      setQuery({
        page: pagination.page + 1,
        limit: LIMIT,
      });
    }
  };

  const scrollToBottom = () => {
    const scrollableDiv = document.getElementById("messagesScrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTop = 0;
    }
  };

  return { messages, setMessages, pagination, fetchConversationDataMore, scrollToBottom };
}
