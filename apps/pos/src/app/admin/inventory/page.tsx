"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
  Space,
  Tabs,
} from "antd";
import {
  EditOutlined,
  PlusSquareOutlined,
  WarningOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  useGetProductsQuery,
  useGetCategoriesQuery, // Added category hook
  useUpdateProductMutation,
  type Product,
} from "@/store/api/apiSlice";
import Link from "next/link";

export default function InventoryLedger() {
  const {
    data: products,
    isLoading: productsLoading,
    refetch,
  } = useGetProductsQuery();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // View States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // Tracks selected category tab

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm] = Form.useForm();
  const [restockForm] = Form.useForm();

  // --- HANDLERS ---
  const openEditModal = (record: Product) => {
    setSelectedProduct(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const openRestockModal = (record: Product) => {
    setSelectedProduct(record);
    restockForm.resetFields();
    setIsRestockModalOpen(true);
  };

  const handleEditSubmit = async (values: Partial<Product>) => {
    if (!selectedProduct) return;
    try {
      await updateProduct({ _id: selectedProduct._id, ...values }).unwrap();
      message.success(`${values.name || "Product"} updated successfully!`);
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      message.error("Failed to update product.");
    }
  };

  const handleRestockSubmit = async (values: { addStock: number }) => {
    if (!selectedProduct) return;
    try {
      const newTotalStock = selectedProduct.stockQuantity + values.addStock;
      await updateProduct({
        _id: selectedProduct._id,
        stockQuantity: newTotalStock,
      }).unwrap();
      message.success(
        `Added ${values.addStock} units to ${selectedProduct.name}!`,
      );
      setIsRestockModalOpen(false);
      refetch();
    } catch (error) {
      message.error("Failed to restock product.");
    }
  };

  // --- DUAL FILTERING: TABS + SEARCH ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // Step 1: Filter by Category Tab
    let tabFiltered = products;
    if (activeTab !== "ALL") {
      tabFiltered = products.filter((product: any) => {
        // Handle Mongoose populate objects safely
        const categoryId =
          typeof product.category === "object"
            ? product.category._id
            : product.category;
        return categoryId === activeTab;
      });
    }

    // Step 2: Filter by Search Bar
    if (!searchText) return tabFiltered;

    const lowercasedSearch = searchText.toLowerCase();
    return tabFiltered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedSearch) ||
        product.sku.toLowerCase().includes(lowercasedSearch),
    );
  }, [products, activeTab, searchText]);

  // --- GENERATE CATEGORY TABS ---
  const tabItems = [
    { key: "ALL", label: "All Products" },
    ...(categories?.map((cat) => ({ key: cat._id, label: cat.name })) || []),
  ];

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      className: "font-semibold",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => <Tag color="default">{sku}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `Rs. ${price.toLocaleString()}`,
    },
    {
      title: "Current Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (stock: number) => (
        <Space>
          <span
            className={stock < 5 ? "font-bold text-red-600" : "font-semibold"}
          >
            {stock}
          </span>
          {stock < 5 && (
            <Tag color="error" icon={<WarningOutlined />}>
              Low
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Product) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<PlusSquareOutlined />}
            onClick={() => openRestockModal(record)}
          >
            Restock
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                icon={<ArrowLeftOutlined />}
                shape="circle"
                size="large"
              />
            </Link>
            <div className="">
              <h1 className="text-2xl font-bold text-gray-900">
                Inventory Ledger
              </h1>
              <p className="text-gray-500">
                Manage product details and restock inventory.
              </p>
            </div>
          </div>
        </div>

        <div className="w-80">
          <Input
            size="large"
            placeholder="Search by name or SKU..."
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        {/* CATEGORY TABS ROW */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-2"
        />

        {/* INVENTORY TABLE */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={productsLoading || categoriesLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        title="Edit Product Details"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="sku" label="SKU Code" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              name="price"
              label="Price (Rs.)"
              className="flex-1"
              rules={[{ required: true }]}
            >
              <InputNumber size="large" min={0} className="w-full" />
            </Form.Item>
            <Form.Item
              name="stockQuantity"
              label="Total Stock"
              className="flex-1"
              rules={[{ required: true }]}
            >
              <InputNumber size="large" min={0} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item className="mb-0 flex justify-end mt-6">
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* QUICK RESTOCK MODAL */}
      <Modal
        title={selectedProduct ? `Restock: ${selectedProduct.name}` : "Restock"}
        open={isRestockModalOpen}
        onCancel={() => setIsRestockModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={400}
      >
        <div className="mb-6 mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Current Stock Level:{" "}
          <strong className="text-gray-900">
            {selectedProduct?.stockQuantity}
          </strong>
        </div>
        <Form
          form={restockForm}
          layout="vertical"
          onFinish={handleRestockSubmit}
        >
          <Form.Item
            name="addStock"
            label="Units to Add"
            rules={[{ required: true }]}
          >
            <InputNumber size="large" min={1} className="w-full" autoFocus />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end mt-6">
            <Space>
              <Button onClick={() => setIsRestockModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-700"
                htmlType="submit"
                loading={isUpdating}
              >
                Confirm Restock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
