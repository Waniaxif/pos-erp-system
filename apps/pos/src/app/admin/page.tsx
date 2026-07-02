"use client";

import { Form, Input, InputNumber, Button, Select, message, Tabs } from "antd";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateProductMutation,
} from "@/store/api/apiSlice";
import Link from "next/link";
import { LineChartOutlined } from "@ant-design/icons";

interface CategoryFormValues {
  name: string;
  description?: string;
}

interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
}

export default function AdminPage() {
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreatingCat }] =
    useCreateCategoryMutation();
  const [createProduct, { isLoading: isCreatingProd }] =
    useCreateProductMutation();

  const [categoryForm] = Form.useForm();
  const [productForm] = Form.useForm();

  const handleCreateCategory = async (values: CategoryFormValues) => {
    try {
      // Auto-generate a slug from the name if you didn't add a field for it
      const payload = {
        ...values,
        slug: values.name.toLowerCase().replace(/ /g, "-"),
      };
      await createCategory(payload).unwrap();
      message.success("Category created successfully!");
      categoryForm.resetFields();
    } catch (error) {
      message.error("Failed to create category. Name might already exist.");
    }
  };

  const handleCreateProduct = async (values: ProductFormValues) => {
    try {
      await createProduct(values).unwrap();
      message.success("Product added successfully!");
      productForm.resetFields();
    } catch (error) {
      message.error("Failed to create product. SKU might already exist.");
    }
  };

  const categoryOptions =
    categories?.map((cat) => ({
      label: cat.name,
      value: cat._id,
    })) || [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Store Administration
          </h1>
          <Link href="/admin/orders">
            <Button type="default" size="large" className="shadow-sm">
              View Order History
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button type="default" size="large" icon={<LineChartOutlined />}>
              Sales Analytics
            </Button>
          </Link>
          <Link href="/">
            <Button type="default">Back to POS</Button>
          </Link>
        </div>

        <Tabs defaultActiveKey="1">
          {/* CATEGORY TAB */}
          <Tabs.TabPane tab="Manage Categories" key="1">
            <div className="max-w-md pt-4">
              <h2 className="mb-4 text-lg font-semibold">Add New Category</h2>
              <Form
                form={categoryForm}
                layout="vertical"
                onFinish={handleCreateCategory}
              >
                <Form.Item
                  name="name"
                  label="Category Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., Beverages, Snacks, Electronics" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} placeholder="Optional details..." />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreatingCat}
                  className="bg-blue-600"
                >
                  Create Category
                </Button>
              </Form>
            </div>
          </Tabs.TabPane>

          {/* PRODUCT TAB */}
          <Tabs.TabPane tab="Manage Products" key="2">
            <div className="max-w-md pt-4">
              <h2 className="mb-4 text-lg font-semibold">Add New Product</h2>
              <Form
                form={productForm}
                layout="vertical"
                onFinish={handleCreateProduct}
              >
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., Wireless Earbuds" />
                </Form.Item>
                <Form.Item
                  name="sku"
                  label="SKU (Barcode/ID)"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., WE-1001" />
                </Form.Item>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select a category"
                    options={categoryOptions}
                    loading={isCategoriesLoading}
                    disabled={categoryOptions.length === 0}
                  />
                </Form.Item>
                <div className="flex gap-4">
                  <Form.Item
                    name="price"
                    label="Price (Rs.)"
                    rules={[{ required: true }]}
                    className="w-1/2"
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                  <Form.Item
                    name="stockQuantity"
                    label="Initial Stock"
                    rules={[{ required: true }]}
                    className="w-1/2"
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </div>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreatingProd}
                  className="bg-blue-600"
                >
                  Add Product
                </Button>
              </Form>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </main>
  );
}
