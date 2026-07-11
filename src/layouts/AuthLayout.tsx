import { Outlet, useLocation } from "react-router-dom";
import { path } from "../utils/path";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === path.login;

  console.log(isLogin);

  return (
    <div
      className={`min-h-screen bg-[var(--color-bg)] flex items-center justify-center relative overflow-hidden`}
    >
      <div
        className={`w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl p-6 ${isLogin ? "max-w-lg" : "max-w-3xl"}`}
      >
        <Outlet />
      </div>
    </div>
  );
}
