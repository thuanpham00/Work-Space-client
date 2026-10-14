import { Link } from "react-router-dom";
import { Button } from "antd";
import { Home } from "lucide-react";
import styles from "./NotFoundPage.module.scss";
import { path } from "../../utils/path";

export default function NotFoundPage() {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.notFoundCard}>
        <div className={styles.illustration}>
          <span className={styles.bigText}>404</span>
          <div className={styles.glow} />
          <div className={styles.glowTwo} />
        </div>

        <h1 className={styles.title}>Không tìm thấy trang</h1>

        <p className={styles.description}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại đường
          dẫn hoặc quay về trang chủ.
        </p>

        <div className={styles.actions}>
          <Link to={path.orgin} className={styles.homeLink}>
            <Button type="primary" icon={<Home size={16} />} className={styles.primaryBtn}>
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
