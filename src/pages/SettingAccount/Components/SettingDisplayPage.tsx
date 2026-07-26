import { Button, Checkbox, Col, Form, Row, Select } from "antd";
import styles from "./InfoUserPage.module.scss";
import { statusUser } from "../../../types/friend.type";
import type { UserType } from "../../../types/user.type";
import { useEffect } from "react";

const { Option } = Select;

export default function SettingDisplayPage({ infoUser }: { infoUser: UserType }) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
  };
  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };

  useEffect(() => {
    if (infoUser) {
      form.setFieldValue("status", infoUser.status);
    }
  }, [infoUser]);

  return (
    <div>
      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row>
          <Col span={24}>
            <Form.Item name="status" label="Trạng thái tài khoản">
              <Select style={{ width: "100%" }}>
                <Option value={statusUser.ONLINE}>Online</Option>
                <Option value={statusUser.OFFLINE}>Offline</Option>
                <Option value={statusUser.BUSY}>Busy</Option>
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
