"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, message, Card, Typography, Divider } from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import { useUpdatePasswordMutation } from "@/store/api/apiSlice";
import Link from "next/link";

const { Title, Text } = Typography;

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityProfile() {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadToken = () => {
      const token = Cookies.get("pos_admin_token");
      if (token && isMounted) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserId(payload._id);
        } catch (error) {
          console.error("Token decoding failed.");
        }
      }
    };
    loadToken();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePasswordUpdate = async (values: PasswordValues) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match!");
      return;
    }

    if (!userId) {
      message.error("Authentication session lost. Please log in again.");
      return;
    }

    try {
      await updatePassword({
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      message.success("Security credentials updated successfully.");
      form.resetFields();
    } catch (error: unknown) {
      message.error("Failed to update password.");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between ">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button icon={<ArrowLeftOutlined />} shape="circle" size="large" />
          </Link>
          <div className="">
            <Title level={2} className="!mb-1 text-gray-900 font-bold">
              Security Settings
            </Title>
            <Text className="text-gray-500">
              Manage your account access and secure your credentials.
            </Text>
          </div>
        </div>
        <Link href="/admin/users">
          <Button
            icon={<PlusOutlined />}
            className="bg-indigo-600 font-bold px-8 h-10"
            type="primary"
            shape="round"
            size="large"
          >
            Create Staff
          </Button>
        </Link>
      </div>

      <Card
        bordered={false}
        className="shadow-sm border border-gray-100 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6 text-indigo-600">
          <SafetyCertificateOutlined className="text-2xl" />
          <h3 className="text-lg font-bold m-0 text-gray-800">
            Update Password
          </h3>
        </div>

        <Divider className="my-4" />

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          size="large"
          className="max-w-md mt-6"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Current password is required" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "New password is required" },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: "Please confirm your new password" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="bg-indigo-600 font-bold px-8 h-10"
            >
              Update Credentials
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
