import { Button, Checkbox, Col, Form, message, Row, Select } from "antd";
import styles from "./InfoUserPage.module.scss";
import type { UserType } from "../../../types/user.type";
import { useEffect } from "react";
import type { UpdateUserBodyType } from "../../../types/auth.type";
import { userAPI } from "../../../apis/user.api";
import { useMutation } from "react-query";
import { queryClient } from "../../../main";
import { StatusUser } from "../../../types/friend.type";

const { Option } = Select;

export default function SettingDisplayPage({ infoUser }: { infoUser: UserType }) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.setFieldsValue({
      status: infoUser.status,
      privacySettings: infoUser.privacySettings,
    });
  };

  useEffect(() => {
    if (infoUser) {
      form.setFieldValue("status", infoUser.status);
      form.setFieldValue("privacySettings", infoUser.privacySettings);
    }
  }, [infoUser]);

  const updateUser = useMutation({
    mutationFn: (data: UpdateUserBodyType) => userAPI.update(data),
  });

  const onFinish = async () => {
    const valid = await form.validateFields();
    if (!valid) return;

    const data: UpdateUserBodyType = {
      status: valid.status,
      privacySettings: valid.privacySettings,
    };

    updateUser.mutate(data, {
      onSuccess: () => {
        message.success("Cập nhật thông tin thành công");
        queryClient.invalidateQueries({ queryKey: ["me"] });
      },
      onError: () => {
        message.error("Cập nhật thông tin thất bại");
      },
    });
  };

  return (
    <div>
      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row>
          <Col span={24}>
            <Form.Item name="status" label="Trạng thái tài khoản">
              <Select style={{ width: "100%" }}>
                <Option value={StatusUser.ONLINE}>Online</Option>
                <Option value={StatusUser.OFFLINE}>Offline</Option>
                <Option value={StatusUser.BUSY}>Busy</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <h3 style={{ marginBottom: 16, marginTop: 8 }}>Cấu hình hiển thị thông tin cá nhân</h3>
            <Row gutter={[6, 6]}>
              <Col span={6}>
                <Form.Item name={["privacySettings", "showEmail"]} valuePropName="checked">
                  <Checkbox>Hiển thị Email</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["privacySettings", "showPhone"]} valuePropName="checked">
                  <Checkbox>Hiển thị Số điện thoại</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={["privacySettings", "showBirthday"]} // cấu hình thế này sẽ ra { privacySettings: { showEmail: true, showPhone: false, showBirthday: true, showGender: false } }
                  valuePropName="checked"
                >
                  <Checkbox>Hiển thị Ngày sinh</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["privacySettings", "showGender"]} valuePropName="checked">
                  <Checkbox>Hiển thị Giới tính</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <div className={styles.actions}>
          <Button onClick={handleReset}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
}
