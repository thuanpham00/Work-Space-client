import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/theme.css"; // 1. Theme tokens (CSS vars) - phải đầu tiên
import "./styles/main.scss"; // 2. SCSS (dùng CSS vars từ theme.css)
import "./index.css"; // 3. Tailwind + base styles
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động refetch khi focus lại cửa sổ, bất kể dữ liệu còn fresh hay đã stale.
      retry: 0, // gọi lại api khi thất bại (0 lần)
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);