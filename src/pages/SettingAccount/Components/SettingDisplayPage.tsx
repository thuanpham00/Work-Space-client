/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Checkbox, Col, Form, Row, Select, App } from "antd";
import styles from "./InfoUserPage.module.scss";
import type { Setting, UpdateSettingsBodyType } from "../../../types/user.type";
import { useEffect } from "react";
import { userAPI } from "../../../apis/user.api";
import { useMutation } from "react-query";
import { queryClient } from "../../../main";
import { WorkMode, WorkspaceInvitePolicy } from "../../../types/user.type";

const { Option } = Select;

export default function SettingDisplayPage({ settings }: { settings: Setting }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleReset = () => {
    if (!settings) return;
    form.setFieldsValue({
      workMode: settings.workMode,
      showEmail: settings.showEmail,
      showPhone: settings.showPhone,
      showDateOfBirth: settings.showDateOfBirth,
      showGender: settings.showGender,
      workspaceInvitePolicy: settings.workspaceInvitePolicy,
    });
  };

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        workMode: settings.workMode,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        showDateOfBirth: settings.showDateOfBirth,
        showGender: settings.showGender,
        workspaceInvitePolicy: settings.workspaceInvitePolicy,
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: (data: UpdateSettingsBodyType) => userAPI.updateSettings(data),
  });

  const onFinish = async () => {
    const valid = await form.validateFields();
    if (!valid) return;

    const data: UpdateSettingsBodyType = {
      workMode: valid.workMode,
      showEmail: valid.showEmail,
      showPhone: valid.showPhone,
      showDateOfBirth: valid.showDateOfBirth,
      showGender: valid.showGender,
      workspaceInvitePolicy: valid.workspaceInvitePolicy,
    };

    updateSettings.mutate(data, {
      onSuccess: () => {
        message.success("Cập nhật cài đặt thành công");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      },
      onError: () => {
        message.error("Cập nhật cài đặt thất bại");
      },
    });
  };

  return (
    <div>
      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row>
          <Col span={24}>
            <Form.Item name="workMode" label="Chế độ làm việc">
              <Select style={{ width: "100%" }}>
                <Option value={WorkMode.ONLINE}>Online</Option>
                <Option value={WorkMode.OFFLINE}>Offline</Option>
                <Option value={WorkMode.BUSY}>Busy</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="workspaceInvitePolicy" label="Ai có thể mời bạn vào Workspace">
              <Select style={{ width: "100%" }}>
                <Option value={WorkspaceInvitePolicy.EVERYONE}>Mọi người</Option>
                <Option value={WorkspaceInvitePolicy.FRIENDS_ONLY}>Chỉ bạn bè</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <h3 style={{ marginBottom: 16, marginTop: 8 }}>Cấu hình hiển thị thông tin cá nhân</h3>
            <Row gutter={[6, 6]}>
              <Col span={6}>
                <Form.Item name="showEmail" valuePropName="checked">
                  <Checkbox>Hiển thị Email</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="showPhone" valuePropName="checked">
                  <Checkbox>Hiển thị Số điện thoại</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="showDateOfBirth" valuePropName="checked">
                  <Checkbox>Hiển thị Ngày sinh</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="showGender" valuePropName="checked">
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
