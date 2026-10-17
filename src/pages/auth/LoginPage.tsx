import { Form, Input, Button, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import settings from "../../settings.json";
import type { LoginBodyType } from "../../types/auth.type";
import { useMutation } from "react-query";
import { useEffect, useState } from "react";
import styles from "./auth.module.scss";
import { userAPI } from "../../apis/user.api";
import { useUserStore } from "../../store/userStore";

export default function LoginPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
      setUser(res.data.data.user);
      
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${styles.formCompact} ${styles.wrapperCompact}`}>
      <h1 className={styles.heading}>Đăng nhập</h1>
      <p className={styles.subheading}>Chào mừng quay lại! Vui lòng nhập thông tin của bạn.</p>

      <div className={styles.socialRow}>
        <button type="button" className={styles.socialButton} aria-label="Đăng nhập với Google">
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
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
        </button>
        <button type="button" className={styles.socialButton} aria-label="Đăng nhập với Facebook">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
        <button type="button" className={styles.socialButton} aria-label="Đăng nhập với Apple">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        </button>
      </div>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>hoặc đăng nhập với email</span>
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

      <p className={`${styles.footerText} ${styles.footerTextSmall}`}>version: {settings.version}</p>
    </div>
  );
}
