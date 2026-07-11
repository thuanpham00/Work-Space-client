import { Form, Input, Button, Col, Row } from "antd";
import { Link } from "react-router-dom";
import { path } from "../../utils/path";
import styles from "./auth.module.scss";

export default function RegisterPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg className={styles.logoSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <span className={styles.logoText}>WorkSpace</span>
      </div>

      <h1 className={`${styles.title} ${styles.titleLarge}`}>
        Đăng ký
        <span className={styles.wave}>&#128075;</span>
      </h1>

      <Form layout="vertical" requiredMark={false}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Vui lòng nhập username!" }]}
            >
              <Input type="text" placeholder="Username" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input type="email" placeholder="Email" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm Password" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="!mb-0">
          <Button type="primary" htmlType="submit" block className={styles.submitButton}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      {/* Login link */}
      <p className={styles.footerText}>
        Đã có tài khoản?{" "}
        <Link to={path.login} className={styles.authLink}>
          Đăng nhập
        </Link>
      </p>

      {/* Copyright */}
      <p className={`${styles.footerText} ${styles.footerTextSmall}`}>2026 WorkSpace. All rights reserved.</p>
    </div>
  );
}
