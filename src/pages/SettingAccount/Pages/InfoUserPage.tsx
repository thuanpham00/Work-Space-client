import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Row,
  Upload,
  type GetProp,
  type UploadProps,
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./InfoUserPage.module.scss";
import { useMutation, useQuery } from "react-query";
import { useEffect, useState } from "react";
import { getAccessTokenFromLS } from "../../../utils/auth";
import type { GenderType, UserType } from "../../../types/user.type";
import type { Dayjs } from "dayjs";
import type { UpdateUserBodyType } from "../../../types/auth.type";
import { queryClient } from "../../../main";
import dayjs from "dayjs";
import { userAPI } from "../../../apis/user.api";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export default function InfoUserPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const avatarUrl = Form.useWatch("avatar", form);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => userAPI.getProfile(),
    enabled: getAccessTokenFromLS() !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const infoUser = data?.data?.data?.user;

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
        avatar: infoUser.avatar || undefined,
      });
    }
  }, [data]);

  const updateUser = useMutation({
    mutationFn: (data: UpdateUserBodyType) => userAPI.update(data),
  });

  const updateAvatar = useMutation({
    mutationFn: (formData: FormData) => userAPI.uploadAvatar(formData),
  });

  const onFinish = async (values: UserType) => {
    const valid = await form.validateFields();
    if (!valid) return;

    const data: UpdateUserBodyType = {
      fullName: values.fullName,
      phone: values.phone,
      dateOfBirth: (values.dateOfBirth as Dayjs)?.format("YYYY-MM-DD"),
      gender: values.gender as GenderType,
      bio: values.bio,
    };

    if (values.avatar && values.avatar !== infoUser?.avatar) {
      data.avatar = values.avatar;
    }

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
      avatar: infoUser?.avatar || undefined,
    });
  };

  // validate ảnh trước upload
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ chấp nhận file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  // theo dõi trạng thái upload
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      const url = info.file.response.data.data.url;
      setLoading(false);
      if (url) {
        form.setFieldValue("avatar", url);
      }
    } else if (info.file.status === "error") {
      setLoading(false);
      message.error("Upload ảnh thất bại");
    }
  };

  // upload ảnh
  const customRequest: UploadProps["customRequest"] = ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("avatar", file as Blob);
    updateAvatar.mutate(formData, {
      onSuccess: (res) => onSuccess?.(res),
      onError: (err) => onError?.(err as Error),
    });
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className={styles.page}>
      <div className={styles.avatarColumn}>
        <h3>Ảnh đại diện</h3>
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          onChange={handleChange}
        >
          {avatarUrl ? (
            <img
              draggable={false}
              src={avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100px", borderRadius: "100%", objectFit: "cover" }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </div>

      <Form form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Row gutter={[12, 12]}>
          <Form.Item name="avatar" hidden>
            <Input />
          </Form.Item>

          <Col span={12}>
            <Form.Item label="Tên đăng nhập" name="username">
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Họ và tên" name="fullName">
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Email" name="email">
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
