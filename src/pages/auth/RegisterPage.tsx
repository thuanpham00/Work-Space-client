import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../utils/path";
import styles from "./auth.module.scss";
import { useMutation } from "react-query";
import type { RegisterBodyType } from "../../types/auth.type";
import { useState } from "react";
import { userAPI } from "../../apis/user.api";
import logo from "../../assets/image/chat.png";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (body: RegisterBodyType) => {
      return userAPI.register(body);
    },
  });

  const handleSubmit = async (values: RegisterBodyType) => {
    try {
      setLoading(true);
      const res = await registerMutation.mutateAsync(values);
      message.success(res.data.message);
      form.resetFields();
      navigate(path.login, {
        state: {
          email: values.email,
          password: values.password,
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src={logo} alt="logo" />
        </div>
        <span className={styles.logoText}>WorkSpace</span>
      </div>

      <h1 className={`${styles.title} ${styles.titleLarge}`}>
        Đăng ký
        <span className={styles.wave}>&#128075;</span>
      </h1>

      <Form layout="vertical" requiredMark={false} form={form} onFinish={handleSubmit}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Vui lòng nhập username!" }]}
        >
          <Input type="text" placeholder="Username" />
        </Form.Item>
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

        <Form.Item className="mb-0!">
          <Button type="primary" loading={loading} htmlType="submit" block className={styles.submitButton}>
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
