import { Col, Form, Input, App, Modal, Row, Select, Switch } from "antd";
import type { Rule } from "antd/es/form";
import React, { useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useQuery } from "react-query";
import type { ChannelBody } from "../../../types/channel.type";
import { channelApi } from "../../../apis/channel.api";
import { workspaceAPI } from "../../../apis/workspace.api";

const rules: Rule[] = [{ required: true }];

export interface ChannelModal {
  handleCreate: (workspaceId: string) => void;
}
interface ChannelModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const ChannelModal = React.forwardRef(({ onClose, onSubmitOk }: ChannelModalProps, ref) => {
  const [form] = Form.useForm<ChannelBody>();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");

  const { data: workspaceDetail } = useQuery({
    queryKey: ["workspace-categories", workspaceId],
    queryFn: () => workspaceAPI.getWorkspaceById(workspaceId),
    enabled: visible && !!workspaceId,
    staleTime: 1000 * 60 * 15,
  });

  const categories = useMemo(() => workspaceDetail?.data.data.workspace.categories ?? [], [workspaceDetail]);

  useImperativeHandle<any, ChannelModal>(
    ref,
    () => ({
      handleCreate(workspaceId: string) {
        form.resetFields();
        form.setFieldsValue({
          workspaceId,
          type: "text",
          isPrivate: false,
        });
        setWorkspaceId(workspaceId);
        setVisible(true);
      },
    }),
    [form],
  );

  useEffect(() => {
    if (!visible) return;

    const currentCategoryId = form.getFieldValue("categoryId");

    if (!currentCategoryId && categories.length > 0) {
      form.setFieldsValue({ categoryId: categories[0].id });
    }
  }, [categories, form, visible]);

  const submitForm = async () => {
    try {
      setLoading(true);
      const data = await form.validateFields();

      await channelApi.create(data);
      message.success("Thêm kênh chat thành công!");
      onSubmitOk();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    setVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      onCancel={() => {
        handleClose();
      }}
      open={visible}
      title={"Thêm kênh chat"}
      style={{ top: 20 }}
      width={700}
      confirmLoading={loading}
      onOk={submitForm}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Form.Item label="Workspace ID" name="workspaceId" hidden>
            <Input placeholder="" />
          </Form.Item>

          <Col span={12}>
            <Form.Item label="Category" name="categoryId" rules={rules}>
              <Select
                placeholder="Chọn chủ đề"
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Type" name="type" rules={rules}>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Name" name="name" rules={rules}>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="" rows={3} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Kênh riêng tư" name="isPrivate" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});
