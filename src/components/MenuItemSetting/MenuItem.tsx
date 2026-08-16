import type { ReactNode } from "react";
import styles from "./MenuItem.module.scss";

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  right?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

const MenuItemSetting = ({ icon, label, right, danger = false, onClick }: MenuItemProps) => {
  const hasRight = right != null;

  return (
    <div className={`${styles.menuItem} ${danger ? styles.dangerItem : ""}`} onClick={onClick}>
      <div className={styles.menuLeft}>
        <span className={`${styles.menuIcon} ${danger ? styles.dangerIcon : ""}`}>{icon}</span>
        <span className={styles.menuLabel}>{label}</span>
      </div>
      {hasRight && <div className={styles.menuRight}>{right}</div>}
    </div>
  );
};

export default MenuItemSetting;
