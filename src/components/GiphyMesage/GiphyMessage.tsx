/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { gf } from "../../utils/giphy";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./GyphyMessage.module.scss";
import type { TypeDisplayMessage } from "../../types/message.type";

interface GiphyProps {
  show: TypeDisplayMessage | null;
  onSubmit: (gif: any) => void;
}

const LIMIT = 30;

export default function GifPicker({ show, onSubmit }: GiphyProps) {
  const [gifs, setGifs] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Refs để tránh stale closure trong IntersectionObserver
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const inFlightRef = useRef(false);

  const loadGifs = useCallback(async (currentOffset: number) => {
    // Chặn duplicate call khi đang fetch
    if (inFlightRef.current || !hasMoreRef.current) return;
    inFlightRef.current = true;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await gf.trending({
        offset: currentOffset,
        limit: LIMIT,
      });

      // Dedup theo id để tránh trùng key do effect chạy 2 lần với cùng offset
      setGifs((prev) => {
        const seen = new Set(prev.map((g: any) => g.id));
        const fresh = res.data.filter((g: any) => !seen.has(g.id));
        return [...prev, ...fresh];
      });

      const nextOffset = currentOffset + LIMIT;
      setOffset(nextOffset);

      if (res.data.length < LIMIT) {
        hasMoreRef.current = false;
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadGifs(0);
  }, [loadGifs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadGifs(offset);
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [offset, loadGifs]);

  return (
    <div className={`${styles.wrapper} ${show === "gif" ? styles.show : styles.hide}`}>
      <div className={styles.gifGrid}>
        {gifs.map((gif: any) => (
          <img
            key={gif.id}
            src={gif.images.fixed_width.url}
            className={styles.gifItem}
            onClick={() => {
              onSubmit(gif);
            }}
          />
        ))}

        <div ref={loadMoreRef} />

        {loading && <p>Loading...</p>}
      </div>
    </div>
  );
}
