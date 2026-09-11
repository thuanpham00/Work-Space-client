import { useEffect, useState } from "react";
import { App, Button, Col, Form, Input, Row, Spin, Switch } from "antd";
import { useQueryClient } from "react-query";
import { channelApi } from "../../../../../apis/channel.api";
import type { Channel, ChannelBody } from "../../../../../types/channel.type";
import styles from "../ChannelSettingsModal.module.scss";
import SelectorCategoryWorkspace from "../../../../../components/Selector/SelectorCategoryWorkspace";

interface ChannelInfoFormProps {
  channel: Channel;
  isLoading: boolean;
  onCancel: () => void;
}

const defaultJoinHelpText =
  "Khi bật, kênh sẽ được tự động join mặc định cho thành viên phù hợp trong workspace. Tùy chọn này không áp dụng cho kênh riêng tư.";

const ChannelInfoForm = ({ channel, isLoading, onCancel }: ChannelInfoFormProps) => {
  const [form] = Form.useForm<Partial<ChannelBody>>();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isPrivate = Form.useWatch("isPrivate", form);

  useEffect(() => {
    if (channel) {
      form.setFieldsValue({
        name: channel.name,
        description: channel.description,
        isPrivate: channel.isPrivate,
        isDefault: channel.isDefault,
        categoryId: channel.category.id,
      });
    }
  }, [channel, form]);

  useEffect(() => {
    if (isPrivate) {
      form.setFieldsValue({ isDefault: false });
    }
  }, [form, isPrivate]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await channelApi.update(channel.id, values);
      message.success("Cập nhật thông tin kênh thành công!");
      queryClient.invalidateQueries({ queryKey: ["channel-detail", channel.id] });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  return (
    <div className={styles.infoForm}>
      <Form layout="vertical" form={form}>
        <Row gutter={16} style={{ width: "100%" }}>
          <Col span={12}>
            <SelectorCategoryWorkspace workspaceId={channel.workspaceId} visible />
          </Col>

          <Col span={12}>
            <Form.Item label="Loại kênh">
              <Input value={channel?.type ?? ""} disabled />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Tên kênh"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên kênh" }]}
            >
              <Input placeholder="Nhập tên kênh" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Mô tả kênh" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Kênh riêng tư" name="isPrivate" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mặc định join"
              name="isDefault"
              valuePropName="checked"
              tooltip={defaultJoinHelpText}
            >
              <Switch disabled={Boolean(isPrivate)} />
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.formActions}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ChannelInfoForm;
