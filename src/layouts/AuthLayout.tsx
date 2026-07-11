import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      className={`min-h-screen bg-[var(--color-bg)] flex items-center justify-center relative overflow-hidden`}
    >
      <div
        className={`w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl p-6 max-w-lg`}
      >
        <Outlet />
      </div>
    </div>
  );
}
