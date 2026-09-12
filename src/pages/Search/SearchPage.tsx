import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import SearchHeader from "./components/SearchHeader";
import SearchResultItem from "./components/SearchResultItem";
import { searchApi } from "../../apis/search.api";
import { useDebounce } from "../../Hooks/useDebounce";
import { PAGE } from "../../constants/config";
import type { SearchItem, SearchQuery } from "../../types/search.type";
import styles from "./SearchPage.module.scss";
import {
  FullProfileModal,
  type FullProfileModalRef,
} from "../Friend/components/FullProfileModal/FullProfileModal";
import { Spin } from "antd";

const SEARCH_LIMIT = 10;

type SearchTab = "all" | "users" | "workspaces";

const TABS: { key: SearchTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "users", label: "Mọi người" },
  { key: "workspaces", label: "Workspace" },
];

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<SearchQuery>("all");
  const debouncedKeyword = useDebounce(keyword, 200);
  const profileModalRef = useRef<FullProfileModalRef>(null);

  const [query, setQuery] = useState<{ limit: number; page: number; type: SearchQuery }>({
    limit: SEARCH_LIMIT,
    page: PAGE,
    type: "all",
  });
  const [items, setItems] = useState<SearchItem[]>([]);
  const [pagination, setPagination] = useState({ page: PAGE, totalPages: 0 });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["search", debouncedKeyword, query],
    queryFn: () =>
      searchApi.search({
        search: debouncedKeyword,
        limit: query.limit,
        page: query.page,
        type: query.type,
      }),
  });

  const result = data?.data?.data;
  const fetchedItems = result?.items ?? [];
  const total = result?.total ?? 0;

  useEffect(() => {
    if (!result) return;
    if (query.page === PAGE) {
      setItems(fetchedItems);
    } else {
      setItems((prev) => [...prev, ...fetchedItems]);
    }
    setPagination({ page: result.page, totalPages: result.totalPages });
  }, [result, query.page, fetchedItems]);

  const hasMore = pagination.page < pagination.totalPages;
  const isFirstLoad = isFetching && items.length === 0;

  const fetchMore = () => {
    setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleUserClick = useCallback((userId: string) => {
    profileModalRef.current?.openModal(userId);
  }, []);

  const handleFriendRequestChange = useCallback(() => {
    refetch();
  }, []);

  return (
    <div className={styles.container}>
      <SearchHeader value={keyword} onChange={setKeyword} />

      <div className={styles.countTopContainer}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab(tab.key as SearchQuery);
                setQuery({ limit: SEARCH_LIMIT, page: PAGE, type: tab.key as SearchQuery });
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.countTop}>
          Hiển thị {items.length} / {total} kết quả
        </div>
      </div>

      <div className={styles.body}>
        {isFirstLoad && (
          <div className={styles.empty}>
            <Spin size="large" tip="Loading..." />
          </div>
        )}

        {!isFirstLoad && items.length === 0 && debouncedKeyword.trim() !== "" && (
          <div className={styles.empty}>Không tìm thấy kết quả nào cho "{debouncedKeyword}".</div>
        )}

        {!isFirstLoad && items.length === 0 && debouncedKeyword.trim() === "" && (
          <div className={styles.empty}>Nhập từ khóa để bắt đầu tìm kiếm.</div>
        )}

        {!isFirstLoad && items.length > 0 && (
          <>
            <div className={styles.list}>
              {items.map((item) => (
                <SearchResultItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  keyword={debouncedKeyword}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>

            <div className={styles.footer}>
              {hasMore && (
                <button className={styles.loadMore} onClick={fetchMore} disabled={isFetching}>
                  {isFetching ? "Đang tải..." : "Xem thêm"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <FullProfileModal ref={profileModalRef} onFriendRequestChange={handleFriendRequestChange} />
    </div>
  );
}
