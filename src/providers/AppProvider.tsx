import { ConfigProvider, theme as antdTheme, App as AntApp } from "antd";
import type { ReactNode } from "react";
import { useBaseStore } from "../store/baseStore";

type Props = { children: ReactNode };

const AppProvider = ({ children }: Props) => {
  const isDarkMode = useBaseStore((s) => s.isDarkMode);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, // theme gốc của antd
        token: {
          colorPrimary: "#ef4815",
          colorPrimaryHover: "#f76235",
          colorText: isDarkMode ? "#ffffff" : "#111827",
          borderRadius: 8,
        }, // cấu hình 1 chỗ thì các component Antd khác sẽ tự theo // có thể set màu dựa tren isDarkMode
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
};

export default AppProvider;

/**
 *
 * algorithm điều khiển theme gốc của Antd
  theme.css điều khiển CSS variables cho phần UI tự viết của bạn
 _antd-theme.scss chỉ là lớp override bổ sung, nên nếu bạn dùng màu hardcode trong đó thì nó sẽ không tự theo dark mode nữa
 */

 /**
  * import { App } from "antd";
  const { message } = App.useApp();  // lấy instance gắn với ConfigProvider
  message.success("Lưu thành công");   // dùng theme hiện tại
  */