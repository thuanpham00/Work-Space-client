import { Form, Input, Button, App, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { path } from "../../utils/path";
import styles from "./auth.module.scss";
import { useMutation } from "react-query";
import type { RegisterBodyType } from "../../types/auth.type";
import { useState } from "react";
import { userAPI } from "../../apis/user.api";
import settings from "../../settings.json";
import { GenderType } from "../../types/user.type";

const PHONE_VN_REGEX = /^(0\d{9}|84\d{9})$/;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
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
    <div className={`${styles.wrapper} ${styles.formCompact} ${styles.wrapperCompact}`}>
      <h1 className={`${styles.heading} ${styles.titleLarge}`}>Đăng ký</h1>
      <p className={styles.subheading}>Tạo tài khoản để bắt đầu trò chuyện cùng team của bạn.</p>

      <Form layout="vertical" requiredMark={false} form={form} onFinish={handleSubmit}>
        <div className={styles.formGrid}>
          <Form.Item
            name="username"
            label="Tên tài khoản"
            rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}
          >
            <Input type="text" placeholder="Tên tài khoản" />
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
            <Input.Password placeholder="Mật khẩu của bạn" />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Tên đầy đủ"
            rules={[{ max: 50, message: "Tên tối đa 50 ký tự" }]}
          >
            <Input type="text" placeholder="Tên đầy đủ của bạn" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: PHONE_VN_REGEX,
                message: "Số điện thoại không hợp lệ (VD: 0912345678 hoặc 84912345678)",
              },
            ]}
          >
            <Input type="tel" placeholder="VD: 0912345678" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  const dob = new Date(value);
                  if (Number.isNaN(dob.getTime())) {
                    return Promise.reject(new Error("Ngày sinh không hợp lệ!"));
                  }
                  if (dob.getTime() > today.getTime()) {
                    return Promise.reject(new Error("Ngày sinh không được ở tương lai!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="date" placeholder="Ngày sinh của bạn" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select
              placeholder="Chọn giới tính"
              options={[
                { value: GenderType.MALE, label: "Nam" },
                { value: GenderType.FEMALE, label: "Nữ" },
                { value: GenderType.OTHER, label: "Khác" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item className="mb-0!">
          <Button type="primary" loading={loading} htmlType="submit" block className={styles.submitButton}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <p className={`${styles.footerText} ${styles.footerTextSmall}`}>version: {settings.version}</p>
    </div>
  );
}
