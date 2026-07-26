import { Button, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import styles from "./ChangePasswordPage.module.scss";
import type { ChangePasswordBodyType } from "../../../types/auth.type";
import { useMutation } from "react-query";
import { userAPI } from "../../../apis/user.api";

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordPage() {
  const [form] = Form.useForm();

  const changePassword = useMutation({
    mutationFn: (data: ChangePasswordBodyType) => userAPI.changePassword(data),
  });

  const onFinish = (values: ChangePasswordValues) => {
    const data: ChangePasswordBodyType = {
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };
    changePassword.mutate(data, {
      onSuccess: () => {
        message.success("Đổi mật khẩu thành công");
        form.resetFields();
      },
    });
  };

  return (
    <div className={styles.page}>
      <p className={styles.heading}>Đổi mật khẩu</p>
      <p className={styles.description}>
        Để bảo mật tài khoản, mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa và chữ số.
      </p>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            // {
            //   pattern: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
            //   message: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa và chữ số",
            // },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmNewPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block className={styles.submit}>
          Đổi mật khẩu
        </Button>
      </Form>
    </div>
  );
}
