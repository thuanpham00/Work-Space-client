import { Search, X } from "lucide-react";
import styles from "./SearchHeader.module.scss";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function SearchHeader({ value, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inputBox}>
        <Search size={18} className={styles.icon} />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng hoặc không gian làm việc..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onChange("")}
            aria-label="Xóa"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
