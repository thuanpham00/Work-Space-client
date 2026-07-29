import { gf } from "../../utils/giphy";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { TypeDisplayMessage } from "../Composer/Composer";
import styles from "./GyphyMessage.module.scss";

interface GyphyProps {
  show: TypeDisplayMessage | null;
}

const LIMIT = 30;

const GifPicker = forwardRef<HTMLDivElement, GyphyProps>(({ show }, ref) => {
  const [gifs, setGifs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadGifs = async (currentOffset: number) => {
    if (loading || !hasMore) return;

    setLoading(true);

    const res = await gf.trending({
      offset: currentOffset,
      limit: LIMIT,
    });

    setGifs((prev) => [...prev, ...res.data]);

    setOffset(currentOffset + LIMIT);

    if (res.data.length < LIMIT) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadGifs(0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadGifs(offset);
        }
      },
      {
        threshold: 0.1, // 10% diện tích của element được quan sát xuất hiện trong vùng nhìn thấy, thì callback sẽ chạy.
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [offset, loading, hasMore]);

  return (
    <div ref={ref} className={`${styles.wrapper} ${show === "gif" ? styles.show : styles.hide}`}>
      <div className={styles.gifGrid}>
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_width.url}
            className={styles.gifItem}
            onClick={() => {
              console.log(gif.images.original.url);
            }}
          />
        ))}

        <div ref={loadMoreRef} />

        {loading && <p>Loading...</p>}
      </div>
    </div>
  );
});

GifPicker.displayName = "GifPicker";

export default GifPicker;
