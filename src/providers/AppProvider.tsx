import { ConfigProvider, theme as antdTheme } from "antd";
import { useAppStore } from "../store/store";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

const AppProvider = ({ children }: Props) => {
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 12,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AppProvider;