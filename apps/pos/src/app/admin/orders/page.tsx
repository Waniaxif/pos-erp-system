"use client";

import { useState } from "react";
import { useGetOrdersQuery } from "@/store/api/apiSlice";
import { Table, Tag, Button, Typography, Spin, Modal, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Order, CartItem } from "@pos/types";
import Link from "next/link";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function OrderHistory() {
  const { data: orders, isLoading } = useGetOrdersQuery();

  // Local state for the modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  // Main table columns
  const columns: ColumnsType<Order> = [
    {
      title: "Receipt ID",
      dataIndex: "_id",
      key: "_id",
      render: (text: string) => (
        <span className="font-mono text-gray-500">
          {text.substring(text.length - 8).toUpperCase()}
        </span>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date: string) => (
        <span className="font-medium text-gray-700">
          {new Date(date).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      title: "Items",
      key: "items",
      render: (_, record) => (
        <span>
          {record.items.reduce((total, item) => total + item.cartQuantity, 0)}{" "}
          items
        </span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total",
      key: "total",
      render: (total: number) => (
        <span className="font-bold text-indigo-600">
          Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (
        <Tag
          color={method === "CASH" ? "green" : "blue"}
          className="rounded-md px-2 font-bold"
        >
          {method}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          className="text-indigo-500 hover:text-indigo-700"
          onClick={() => handleViewReceipt(record)}
        >
          View
        </Button>
      ),
    },
  ];

  // Modal inner table columns (for the purchased items)
  const itemColumns: ColumnsType<CartItem> = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: CartItem) => (
        <div>
          <div className="font-bold text-gray-800">{text}</div>
          <div className="text-xs text-gray-400">SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "cartQuantity",
      key: "cartQuantity",
      align: "center",
    },
    {
      title: "Unit Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => `Rs. ${price.toLocaleString()}`,
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      render: (_, record) => (
        <span className="font-bold">
          Rs. {(record.price * record.cartQuantity).toLocaleString()}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spin size="large" tip="Loading transaction history..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                icon={<ArrowLeftOutlined />}
                shape="circle"
                size="large"
              />
            </Link>
            <Title level={2} className="!mb-0">
              Transaction History
            </Title>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white px-4 py-2 shadow-sm">
            <span className="text-gray-500">Total Orders: </span>
            <span className="font-bold text-gray-900">
              {orders?.length || 0}
            </span>
          </div>
        </div>

        {/* GLASSMORPHIC TABLE CONTAINER */}
        <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            pagination={{ pageSize: 10, position: ["bottomCenter"] }}
            className="overflow-hidden rounded-xl bg-white/50"
          />
        </div>
      </div>

      {/* RECEIPT DETAILS MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            Receipt Details
            <Tag color="purple" className="ml-2 font-mono">
              #
              {selectedOrder?._id
                .substring(selectedOrder._id.length - 8)
                .toUpperCase()}
            </Tag>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Print Receipt
          </Button>,
          <Button key="close" type="primary" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={700}
        styles={{
          body: { padding: "20px 0" },
          mask: { backdropFilter: "blur(4px)" }, // Adds a glass effect to the modal background
        }}
      >
        {selectedOrder && (
          <div>
            <div className="mb-4 flex justify-between px-6 text-sm text-gray-500">
              <div>
                <p>
                  <strong>Terminal:</strong> {selectedOrder.cashierId}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <strong>Status:</strong>{" "}
                  <Tag color="green">{selectedOrder.status}</Tag>
                </p>
                <p>
                  <strong>Payment:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>
            </div>

            <Table
              columns={itemColumns}
              dataSource={selectedOrder.items}
              rowKey="_id"
              pagination={false}
              size="small"
              className="mb-4 px-4"
            />

            <Divider className="my-4" />

            <div className="flex flex-col items-end px-6 space-y-1 text-sm">
              <div className="flex w-48 justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>
                  Rs.{" "}
                  {selectedOrder.subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex w-48 justify-between text-gray-500">
                <span>Tax (16%):</span>
                <span>
                  Rs.{" "}
                  {selectedOrder.tax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mt-2 flex w-64 justify-between border-t pt-2 text-lg font-black text-gray-900">
                <span>Total:</span>
                <span>
                  Rs.{" "}
                  {selectedOrder.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
