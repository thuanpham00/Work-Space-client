/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useQuery } from "react-query";
import { useCallback, useEffect, useState } from "react";
import type { QueryBase } from "../types/query.type";
import { PAGE } from "../constants/config";
import { channelApi } from "../apis/channel.api";
import { AttachmentType, type Attachment } from "../types/attachment.type";

const ATTACHMENT_LIMIT = 9;

export default function useScrollAttachments({ channelId, token }: { channelId: string; token: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [query, setQuery] = useState<QueryBase>({
    limit: ATTACHMENT_LIMIT,
    page: PAGE,
    type: AttachmentType.IMAGE,
  });
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });

  const { data: dataAttachments, isFetching } = useQuery({
    queryKey: ["attachmentsChannel", channelId, query, token],
    queryFn: () => channelApi.getAttachmentsChannel(channelId as string, query),
    enabled: Boolean(channelId),
    staleTime: 60 * 1000,
  });

  const attachmentsData = (dataAttachments?.data?.data?.attachments || []) as Attachment[];
  const page = dataAttachments?.data?.data?.page as number;
  const total_page = dataAttachments?.data?.data?.total_page as number;

  const hasMore = pagination.page < pagination.total_page;

  useEffect(() => {
    if (!attachmentsData) return;
    if (page === PAGE) setAttachments(attachmentsData);
    else setAttachments((prev) => [...prev, ...attachmentsData]);
    setPagination({ page, total_page });
  }, [attachmentsData, page, total_page]);

  const fetchMore = useCallback(() => {
    setQuery((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, []);

  const addLocalAttachments = useCallback((newAttachments: Attachment[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  return {
    query,
    setQuery,
    pagination,
    setPagination,
    attachments,
    hasMore,
    fetchMore,
    isFetchingMore: isFetching,
    addLocalAttachments,
  };
}
