/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, App, Modal } from "antd";
import React, { useImperativeHandle, useState } from "react";
import type { CategoryChannel, CategoryChannelBody } from "../../../types/CategoryChannel.type";
import type { ModalStatus } from "../../../types/utils.type";
import { workspaceAPI } from "../../../apis/workspace.api";
import type { Rule } from "antd/es/form";

const rules: Rule[] = [{ required: true }];

export interface CategoryChannelModal {
  handleCreate: (workspaceId: string) => void;
  handleUpdate: (CategoryChannel: CategoryChannel) => void;
}
interface CategoryChannelModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

type FormCategory = {
  name: string;
  workspaceId: string;
};

export const CategoryChannelModal = React.forwardRef(
  ({ onClose, onSubmitOk }: CategoryChannelModalProps, ref) => {
    const [form] = Form.useForm<FormCategory>();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState<ModalStatus>("create");
    const [selectedCategoryChannel, setSelectedCategoryChannel] = useState<CategoryChannel>();

    useImperativeHandle<any, CategoryChannelModal>(
      ref,
      () => ({
        handleCreate(workspaceId: string) {
          form.setFieldsValue({ workspaceId });
          setVisible(true);
          setStatus("create");
          setSelectedCategoryChannel(undefined);
          console.log("handleCreate", workspaceId);
        },
        handleUpdate(CategoryChannel: CategoryChannel) {
          form.setFieldsValue({ ...CategoryChannel });
          setVisible(true);
          setStatus("update");
          setSelectedCategoryChannel(CategoryChannel);
        },
      }),
      [form],
    );

    const getPayload = () => {
      const { ...rest } = form.getFieldsValue();
      return { category: rest };
    };

    const submitForm = async () => {
      try {
        setLoading(true);
        await form.validateFields();
        const data = getPayload();

        const body: CategoryChannelBody = {
          name: data.category.name,
          workspaceId: data?.category.workspaceId,
        };

        switch (status) {
          case "create":
            await workspaceAPI.createCategory(body);
            message.success("Thêm chủ đề thành công!");
            break;
          case "update":
            await workspaceAPI.updateCategory(selectedCategoryChannel?.id || "", body);
            message.success("Cập nhật chủ đề thành công!");
            break;
        }
        onSubmitOk();
        handleClose();
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setSelectedCategoryChannel(undefined);
      form.resetFields();
    };

    return (
      <Modal
        onCancel={() => {
          handleClose();
        }}
        open={visible}
        title={status == "create" ? "Tạo chủ đề kênh chat" : "Cập nhật chủ đề kênh chat"}
        style={{ top: 20 }}
        width={700}
        confirmLoading={loading}
        onOk={submitForm}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Workspace ID" name="workspaceId" hidden>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item label="Tên chủ đề" name="name" rules={rules}>
            <Input placeholder="" />
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);
