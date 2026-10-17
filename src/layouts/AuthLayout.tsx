import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { path } from "../utils/path";
import styles from "./AuthLayout.module.scss";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isRegister = pathname === path.register;

  const heroTitle = isRegister ? "Hi there, let's get you started!" : "Welcome back!";
  const heroSubtitle = isRegister
    ? "Create your account and start collaborating with your team in seconds."
    : "Sign in to continue your conversations and pick up right where you left off.";
  const headerCtaLabel = isRegister ? "Đăng nhập" : "Đăng ký";
  const headerCtaPath = isRegister ? path.login : path.register;

  return (
    <div className={styles.shell}>
      {/* Panel trái: Form */}
      <section className={styles.formPanel}>
        <header className={styles.formHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link to={headerCtaPath} className={styles.headerLink}>
            {headerCtaLabel}
          </Link>
        </header>

        <div className={styles.formContent}>
          <Outlet />
        </div>
      </section>

      {/* Panel phải: Hero */}
      <aside className={styles.heroPanel}>
        <div className={styles.heroOverlay} />
        {/* Slot để gắn asset 3D sau */}
        <div className={styles.heroImage} />
        <div className={styles.heroCopy}>
          <h2 className={styles.heroTitle}>{heroTitle}</h2>
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
        </div>
      </aside>
    </div>
  );
}
