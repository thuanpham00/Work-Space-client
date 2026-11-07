import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./CollapsibleSection.module.scss";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Section chiếm toàn bộ chiều cao còn lại của container cha (flex) */
  fill?: boolean;
}

const CollapsibleSection = ({ title, defaultOpen = false, children, fill = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.sectionBlock} ${fill ? styles.sectionBlockFill : ""}`}>
      <div className={styles.sectionHeaderRow} onClick={() => setOpen((v) => !v)}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <ChevronRight size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </div>
      <div
        className={`${styles.collapsible} ${open ? styles.collapsibleOpen : ""} ${
          fill && open ? styles.collapsibleFill : ""
        }`}
      >
        <div className={styles.collapsibleInner}>{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
