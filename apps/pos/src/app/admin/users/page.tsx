"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  type SystemUser,
} from "@/store/api/apiSlice";

interface CreateUserValues {
  name: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  email?: string;
  password?: string;
}

export default function UsersManagement() {
  const { data: users, isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: CreateUserValues) => {
    // Add this line to verify the form is capturing the password correctly
    console.log("Submitting these values to API:", values);
    try {
      await createUser(values).unwrap();
      message.success("User created successfully!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create user.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      message.success("User removed from system.");
    } catch (error) {
      message.error("Failed to delete user.");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "font-semibold",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag
          color={
            role === "ADMIN"
              ? "purple"
              : role === "MANAGER"
                ? "blue"
                : "default"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: SystemUser) => (
        <Popconfirm
          title="Delete the user"
          description={`Are you sure you want to delete ${record.name}?`}
          onConfirm={() => handleDelete(record._id)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger type="text" icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">
            Manage terminal access and staff roles.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-indigo-600"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Staff
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Register New Staff Account"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              name="phone"
              label="Phone Number"
              className="flex-1"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              name="role"
              label="System Role"
              className="flex-1"
              initialValue="STAFF"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="STAFF">Terminal Staff</Select.Option>
                <Select.Option value="MANAGER">Store Manager</Select.Option>
                <Select.Option value="ADMIN">System Admin</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Address">
            <Input size="large" type="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Temporary Password"
            rules={[
              { required: true, message: "Please enter a temporary password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            extra={
              <span className="text-xs text-gray-400">
                Users can change this later from their profile.
              </span>
            }
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end mt-6">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-indigo-600"
                loading={isCreating}
              >
                Create Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
