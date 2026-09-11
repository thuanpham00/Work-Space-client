/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, Form, Input, App, Modal, Row, Switch } from "antd";
import type { Rule } from "antd/es/form";
import React, { useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useQuery } from "react-query";
import type { ChannelBody } from "../../../types/channel.type";
import { channelApi } from "../../../apis/channel.api";
import { workspaceAPI } from "../../../apis/workspace.api";
import SelectorCategoryWorkspace from "../../../components/Selector/SelectorCategoryWorkspace";

const rules: Rule[] = [{ required: true }];
const defaultJoinHelpText =
  "Khi bật, kênh sẽ được tự động join mặc định cho thành viên phù hợp trong workspace. Tùy chọn này không áp dụng cho kênh riêng tư.";

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
  const isPrivate = Form.useWatch("isPrivate", form);

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
          isDefault: false,
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

  useEffect(() => {
    if (isPrivate) {
      form.setFieldsValue({ isDefault: false });
    }
  }, [form, isPrivate]);

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
      centered
      mask={{ closable: false }}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Form.Item label="Workspace ID" name="workspaceId" hidden>
            <Input placeholder="" />
          </Form.Item>

          <Col span={12}>
            <SelectorCategoryWorkspace workspaceId={workspaceId} visible={visible} />
          </Col>

          <Col span={12}>
            <Form.Item label="Loại" name="type" rules={rules}>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Tên kênh" name="name" rules={rules}>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea placeholder="" rows={3} />
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
