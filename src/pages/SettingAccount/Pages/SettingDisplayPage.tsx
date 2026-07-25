import { Button, Col, Form, Row, Select } from "antd";
import styles from "./InfoUserPage.module.scss";

export default function SettingDisplayPage() {
  const [form] = Form.useForm();

  const handleReset = () => {};
  const onFinish = () => {};

  return (
    <div>
      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Form.Item name="Trạng thái tài khoản" label="Trạng thái tài khoản">
              <Select>
                <Select.Option value={1}>1</Select.Option>
                <Select.Option value={2}>2</Select.Option>
                <Select.Option value={3}>3</Select.Option>
                <Select.Option value={4}>4</Select.Option>
              </Select>
            </Form.Item>
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
