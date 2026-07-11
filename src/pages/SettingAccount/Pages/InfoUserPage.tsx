import { Avatar, Button, Col, DatePicker, Form, Input, message, Radio, Row } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, CameraOutlined } from "@ant-design/icons";
import styles from "./InfoUserPage.module.scss";
import { useMutation, useQuery } from "react-query";
import { authAPI } from "../../../apis/auth.api";
import { useEffect } from "react";
import { getAccessTokenFromLS } from "../../../utils/auth";
import type { GenderType, UserType } from "../../../types/user.type";
import type { Dayjs } from "dayjs";
import type { UpdateUserBodyType } from "../../../types/auth.type";
import { queryClient } from "../../../main";
import dayjs from "dayjs";

export default function InfoUserPage() {
  const [form] = Form.useForm();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => authAPI.getProfile(),
    enabled: getAccessTokenFromLS() !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const infoUser = data?.data.data.user;

  useEffect(() => {
    if (infoUser) {
      form.setFieldsValue({
        fullName: infoUser.fullName,
        username: infoUser.username,
        email: infoUser.email,
        phone: infoUser.phone,
        bio: infoUser.bio,
        dateOfBirth: infoUser.dateOfBirth ? dayjs(infoUser.dateOfBirth) : null,
        gender: infoUser.gender || "MALE",
      });
    }
  }, [data]);

  const updateUser = useMutation({
    mutationFn: (data: UpdateUserBodyType) => authAPI.update(data),
  });

  const updateAvatar = useMutation({
    mutationFn: (file: File) => authAPI.uploadAvatar(file),
  });

  const onFinish = async (values: Omit<UserType, "avatar">) => {
    const valid = await form.validateFields();
    if (!valid) return;

    const data: UpdateUserBodyType = {
      fullName: values.fullName,
      phone: values.phone,
      dateOfBirth: (values.dateOfBirth as Dayjs)?.format("YYYY-MM-DD"),
      gender: values.gender as GenderType,
      bio: values.bio,
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

  const handleReset = () => {
    if (!infoUser) return;

    form.setFieldsValue({
      fullName: infoUser?.fullName,
      username: infoUser?.username,
      email: infoUser?.email,
      phone: infoUser?.phone,
      bio: infoUser?.bio,
      dateOfBirth: infoUser?.dateOfBirth ? dayjs(infoUser.dateOfBirth) : null,
      gender: infoUser?.gender || "MALE",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.avatarColumn}>
        <Avatar size={96} src={infoUser?.avatar} className={styles.avatar}>
          {infoUser?.username.charAt(0)}
        </Avatar>
        <Button type="default" icon={<CameraOutlined />} className={styles.uploadButton}>
          Đổi ảnh đại diện
        </Button>
      </div>

      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item label="Tên đăng nhập" name="username">
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="example@email.com" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[
                {
                  validator: (_, value) => {
                    if (value && value.isAfter(dayjs())) {
                      return Promise.reject(new Error("Ngày sinh không được lớn hơn ngày hiện tại"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                allowClear={false}
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
                className="w-full!"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="gender" label="Giới tính">
              <Radio.Group>
                <Radio value="MALE">Nam</Radio>
                <Radio value="FEMALE">Nữ</Radio>
                <Radio value="OTHER">Khác</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Mô tả" name="bio">
              <Input.TextArea rows={3} maxLength={200} showCount placeholder="Giới thiệu ngắn về bạn" />
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
