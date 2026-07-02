"use client";

import { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLoginMutation } from "@/store/api/apiSlice";

const { Title, Text } = Typography;

interface LoginValues {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginValues) => {
    try {
      const response = await login(values).unwrap();
      Cookies.set("pos_admin_token", response.data.token, { expires: 0.5 }); // 12 hours
      message.success(`Welcome back, ${response.data.user.name}`);
      router.push("/");
    } catch (error: unknown) {
      message.error("Invalid credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-lg">
            <LockOutlined className="text-2xl text-white" />
          </div>
          <Title level={2} className="!mb-1 tracking-tight text-gray-900">
            Secure Terminal Access
          </Title>
          <Text className="text-gray-500">
            Sign in with your email or phone number
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleLogin} size="large">
          <Form.Item
            name="identifier"
            rules={[
              {
                required: true,
                message: "Please enter your email or phone number",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400 mr-2" />}
              placeholder="Email or Phone Number"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold shadow-md"
          >
            Authorize System Access
          </Button>
        </Form>
      </div>
    </div>
  );
}
