import { Form, Input, Button, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { path } from "../../utils/path";
import settings from "../../settings.json";
import type { LoginBodyType } from "../../types/auth.type";
import { useMutation } from "react-query";
import { useAppStore } from "../../store/store";
import { useEffect, useState } from "react";
import styles from "./auth.module.scss";
import { userAPI } from "../../apis/user.api";
import logo from "../../assets/image/chat.png";

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const { state } = useLocation();

  const { email, password } = state || {};

  useEffect(() => {
    if (email && password) {
      form.setFieldsValue({
        email,
        password,
      });
    }
  }, [email, password, form]);

  const loginMutation = useMutation({
    mutationFn: (body: LoginBodyType) => {
      return userAPI.login(body);
    },
  });

  const handleSubmit = async (values: LoginBodyType) => {
    try {
      setLoading(true);
      const res = await loginMutation.mutateAsync(values);
      message.success(res.data.message);
      setAccessToken(res.data.data.access_token);
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src={logo} alt="logo" />
        </div>
        <span className={styles.logoText}>WorkSpace</span>
      </div>

      <h1 className={styles.title}>
        Đăng nhập
        <span className={styles.wave}>&#128075;</span>
      </h1>

      <div className={styles.googleWrapper}>
        <button type="button" className={styles.googleButton}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className={styles.googleText}>Đăng nhập với Google</span>
        </button>
      </div>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>Đăng nhập với Email</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Form */}
      <Form layout="vertical" requiredMark={false} form={form} onFinish={handleSubmit}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
          <Input type="email" placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <div className={styles.formRow}>
          <a href="#" className={styles.forgotLink}>
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item className="mb-0!">
          <Button
            type="primary"
            htmlType="submit"
            block
            className={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <p className={styles.footerText}>
        Chưa có tài khoản?{" "}
        <Link to={path.register} className={styles.authLink}>
          Đăng ký
        </Link>
      </p>

      <p className={`${styles.footerText} ${styles.footerTextSmall}`}>version: {settings.version}</p>
    </div>
  );
}
