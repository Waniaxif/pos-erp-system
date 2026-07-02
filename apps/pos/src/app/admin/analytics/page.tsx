"use client";

import { useGetOrdersQuery } from "@/store/api/apiSlice";
import { Card, Col, Row, Statistic, Spin, Typography, Button } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import type { Order } from "@pos/types";
import Link from "next/link";

const { Title } = Typography;

// --- Data Aggregation Helpers ---
// In a production app with massive data, this should be done on the Express backend.
// For our current scale, aggregating on the frontend is perfectly efficient.

const calculateKPIs = (orders: Order[]) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalItemsSold = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => itemSum + item.cartQuantity, 0),
    0,
  );
  const averageOrderValue =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalItemsSold,
    averageOrderValue,
  };
};

const getDailyRevenue = (orders: Order[]) => {
  const dailyData: Record<string, number> = {};

  orders.forEach((order) => {
    const date = new Date(order.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!dailyData[date]) dailyData[date] = 0;
    dailyData[date] += order.total;
  });

  // Convert to array for Recharts
  return Object.keys(dailyData)
    .map((date) => ({
      date,
      revenue: dailyData[date],
    }))
    .reverse(); // Reverse to show chronological order if backend sorts by newest
};

export default function AnalyticsDashboard() {
  const { data: orders, isLoading } = useGetOrdersQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
        <Spin size="large" tip="Compiling Analytics..." />
      </div>
    );
  }

  const safeOrders = orders || [];
  const kpis = calculateKPIs(safeOrders);
  const dailyRevenueData = getDailyRevenue(safeOrders);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 text-gray-800">
      <div className=" mx-auto max-w-7xl">
        <div className="flex  gap-4">
          <Link href="/admin">
            <Button icon={<ArrowLeftOutlined />} shape="circle" size="large" />
          </Link>
          <Title level={2} className="mb-8 text-[#2C3E50]">
            Restaurant Performance
          </Title>
        </div>

        {/* TOP LEVEL KPIs */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-none shadow-sm rounded-xl">
              <Statistic
                title="Total Revenue"
                value={kpis.totalRevenue}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#E67E22", fontWeight: "bold" }} // Elegant food industry orange
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-none shadow-sm rounded-xl">
              <Statistic
                title="Total Orders"
                value={kpis.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#2C3E50", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-none shadow-sm rounded-xl">
              <Statistic
                title="Average Order Value"
                value={kpis.averageOrderValue}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: "#27AE60", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-none shadow-sm rounded-xl">
              <Statistic
                title="Growth (Est.)"
                value={12.5}
                precision={1}
                prefix={<ArrowUpOutlined />}
                suffix="%"
                valueStyle={{ color: "#27AE60", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        {/* CHARTS SECTION */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title="Daily Revenue Trend"
              className="border-none shadow-sm rounded-xl"
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyRevenueData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280" }}
                      tickFormatter={(val) => `Rs.${val}`}
                    />
                    {/* <RechartsTooltip
                      formatter={(
                        value: string | number | (string | number)[],
                      ) => {
                        const numericValue =
                          typeof value === "number" ? value : Number(value);
                        return [`Rs. ${numericValue.toFixed(2)}`, "Revenue"];
                      }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    /> */}
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#E67E22"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#E67E22",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Revenue Comparison"
              className="border-none shadow-sm rounded-xl"
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyRevenueData.slice(-7)}
                    margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#F3F4F6" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#34495E"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </main>
  );
}
