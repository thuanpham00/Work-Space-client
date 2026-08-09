import { Col, Form, Input, message, Modal, Row } from "antd";
import type { Rule } from "antd/es/form";
import React, { useImperativeHandle, useState } from "react";

const rules: Rule[] = [{ required: true }];

export interface SettingChannelModal {
  handleOpen: () => void;
}
interface SettingChannelModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const SettingChannelModal = React.forwardRef(
  ({ onClose, onSubmitOk }: SettingChannelModalProps, ref) => {
    const [form] = Form.useForm<any>();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedSettingChannel, setSelectedSettingChannel] = useState<any>();

    useImperativeHandle<any, SettingChannelModal>(
      ref,
      () => ({
        handleOpen() {
          form.resetFields();
          setVisible(true);
          setSelectedSettingChannel(undefined);
        },
      }),
      [],
    );

    const getPayload = () => {
      const { ...rest } = form.getFieldsValue();
      return { SettingChannel: rest };
    };

    const submitForm = async () => {
      try {
        setLoading(true);
        const valid = await form.validateFields();
        const data = getPayload();
        let res: any = undefined;
        // switch (status) {
        //   case "create":
        //     res = await SettingChannelApi.create(data);
        //     message.success("Create SettingChannel successfully!");
        //     break;
        //   case "update":
        //     res = await SettingChannelApi.update(selectedSettingChannel?.id || 0, data);
        //     message.success("Update SettingChannel successfully!");
        //     break;
        // }
        onSubmitOk();
        handleClose();
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setSelectedSettingChannel(undefined);
    };

    return (
      <Modal
        onCancel={() => {
          handleClose();
        }}
        visible={visible}
        title={"Cài đặt channel"}
        style={{ top: 20 }}
        width={700}
        confirmLoading={loading}
        onOk={submitForm}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Username" name="username" rules={rules}>
                <Input placeholder="" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Name" name="name" rules={rules}>
                <Input placeholder="" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phone" name="phone" rules={rules}>
                <Input placeholder="" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input placeholder="" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  },
);
