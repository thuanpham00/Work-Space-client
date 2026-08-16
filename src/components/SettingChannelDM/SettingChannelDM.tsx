import React, { type ReactNode } from "react";
import { Collapse, Space, Divider } from "antd";
import { PushpinOutlined, BgColorsOutlined, SmileOutlined, EditOutlined } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import { ChevronRight } from "lucide-react";

const ChatSettings: React.FC = () => {
  const handleItemClick = (title: string): void => {
    console.log(`Clicked: ${title}`);
  };

  const renderMenuItem = (icon: ReactNode, label: string, onClick?: () => void): ReactNode => (
    <div
      onClick={() => (onClick ? onClick() : handleItemClick(label))}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        cursor: "pointer",
        color: "#fff",
        fontSize: "14px",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = "0.7";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      <Space size={12}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span>{label}</span>
      </Space>

      <ChevronRight
        style={{
          fontSize: "12px",
          color: "#999",
        }}
      />
    </div>
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Thông tin về đoạn chat",
      children: <div>{renderMenuItem(<PushpinOutlined />, "Xem tin nhắn đã ghim")}</div>,
      style: {
        backgroundColor: "#2a2a2a",
        borderColor: "#404040",
      },
    },
    {
      key: "2",
      label: "Tuỳ chỉnh đoạn chat",
      children: (
        <div>
          {renderMenuItem(<BgColorsOutlined style={{ color: "#5B61FF" }} />, "Đổi chủ đề")}

          <Divider
            style={{
              margin: "8px 0",
              borderColor: "#404040",
            }}
          />

          {renderMenuItem(<SmileOutlined style={{ color: "#FFB800" }} />, "Thay đổi biểu tượng cảm xúc")}

          <Divider
            style={{
              margin: "8px 0",
              borderColor: "#404040",
            }}
          />

          {renderMenuItem(<EditOutlined />, "Chỉnh sửa biệt danh")}
        </div>
      ),
      style: {
        backgroundColor: "#2a2a2a",
        borderColor: "#404040",
      },
    },
    {
      key: "3",
      label: "File phương tiện và file",
      children: (
        <div
          style={{
            color: "#999",
            padding: "8px 0",
          }}
        >
          Không có file nào
        </div>
      ),
      style: {
        backgroundColor: "#2a2a2a",
        borderColor: "#404040",
      },
    },
    {
      key: "4",
      label: "Quyền riêng tư và hỗ trợ",
      children: (
        <div
          style={{
            color: "#999",
            padding: "8px 0",
          }}
        >
          Các tuỳ chọn về bảo mật và hỗ trợ
        </div>
      ),
      style: {
        backgroundColor: "#2a2a2a",
        borderColor: "#404040",
      },
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Collapse
        items={items}
        defaultActiveKey={["1"]}
        style={{
          backgroundColor: "transparent",
          border: "none",
        }}
      />
    </div>
  );
};

export default ChatSettings;
