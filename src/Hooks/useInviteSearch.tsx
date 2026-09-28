/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { workspaceAPI } from "../apis/workspace.api";
import { useDebounce } from "./useDebounce";
import { PAGE } from "../constants/config";
import type { InviteSearchItem } from "../types/workspace.type";

const PAGE_SIZE = 20;

export function useInviteSearch(workspaceId: string | null) {
  const [query, setQuery] = useState({ page: PAGE, limit: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const debounced = useDebounce(searchInput, 400);

  const [items, setItems] = useState<InviteSearchItem[]>([]);
  const [pagination, setPagination] = useState({ page: PAGE, totalPages: 0 });

  useEffect(() => {
    setSearchInput("");
    setQuery({ page: PAGE, limit: PAGE_SIZE });
    setItems([]);
    setPagination({ page: PAGE, totalPages: 0 });
  }, [workspaceId]);

  useEffect(() => {
    setQuery({ page: PAGE, limit: PAGE_SIZE });
    setItems([]);
  }, [debounced]);

  const {
    data: dataQuery,
    isFetching,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["inviteSearch", workspaceId, debounced, query],
    queryFn: () =>
      workspaceAPI.searchInviteMembers(workspaceId as string, {
        search: debounced,
        ...query,
      }),
    enabled: Boolean(workspaceId) && debounced.trim().length > 0,
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });

  const result = dataQuery?.data?.data;
  const fetchedItems = result?.items as InviteSearchItem[];
  const totalPages = result?.totalPages ?? 0;
  const page = result?.page ?? 1;

  // Accumulate items theo page; reset khi page = 1
  useEffect(() => {
    if (!result) return;
    if (query.page === PAGE) {
      setItems(fetchedItems);
    } else {
      setItems((prev) => [...prev, ...fetchedItems]);
    }
    setPagination({ page: page, totalPages });
  }, [fetchedItems, page, totalPages]);

  const hasMore = pagination.page < pagination.totalPages;

  const fetchMore = () => {
    if (hasMore && !isFetching) {
      setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return {
    items,
    isLoading,
    isFetching,
    hasMore,
    searchInput,
    setSearchInput,
    refetch,
    fetchMore,
  };
}
