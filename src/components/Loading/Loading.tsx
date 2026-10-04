import { Spin } from "antd";
import type { ReactNode } from "react";
import styles from "./Loading.module.scss";

interface LoadingProps {
  tip?: string;
  size?: "small" | "default" | "large";
  children?: ReactNode;
}

const Loading = ({ tip = "Loading...", size = "default", children }: LoadingProps) => {
  return (
    <div className={styles.wrapper}>
      <Spin size={size} tip={tip}>
        {children}
      </Spin>
    </div>
  );
};

export default Loading;
