"use client";

import { useMemo, useState } from "react";
import {
  useGetProductsQuery,
  useCreateOrderMutation,
  type CreateOrderResponse,
} from "@/store/api/apiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/store/cartSlice";
import { Button, message, Spin, InputNumber, Tag, Input } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  WarningOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ReceiptTemplate from "@/components/ReceiptTemplate";
import type { Order } from "@pos/types";

export default function CashRegister() {
  const { data: products, isLoading } = useGetProductsQuery();
  const [createOrder, { isLoading: isProcessing }] = useCreateOrderMutation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products by searching name or SKU/Barcode string
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm.trim()) return products;
    const cleanSearch = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(cleanSearch) ||
        product.sku.toLowerCase().includes(cleanSearch),
    );
  }, [products, searchTerm]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    try {
      const orderPayload: Partial<Order> = {
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.taxAmount,
        total: cart.total,
        paymentMethod: "CASH",
        status: "COMPLETED",
        cashierId: "Terminal 01",
      };

      // Type asserted safely to bypass missing property alerts
      const response = await createOrder(orderPayload).unwrap();
      setLastOrder(response);

      message.success(
        `Payment of Rs. ${cart.total.toLocaleString()} received!`,
      );
      dispatch(clearCart());

      setTimeout(() => {
        window.print();
      }, 150);
    } catch (error) {
      message.error("Checkout transaction failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <Spin size="large" description="Loading Register..." />
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-800">
      {/* THERMAL PRINT ENGINE ELEMENT */}
      <ReceiptTemplate order={lastOrder} />

      {/* LEFT PANE: PRODUCT GRID */}
      <section className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Terminal 01
          </h1>
          {/* SEARCH COMPONENT INPUT */}
          <div className="flex-1 max-w-xl">
            <Input
              size="large"
              placeholder="Search by product name or barcode item code..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm rounded-xl border-gray-200"
            />
          </div>
          <Link href="/admin">
            <Button type="primary" className="bg-indigo-600 shadow-md">
              Admin Control Center
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts?.map((product) => {
            // Compute visual remaining stock level dynamically in memory
            const cartItem = cart.items.find((i) => i._id === product._id);
            const currentCartQty = cartItem ? cartItem.cartQuantity : 0;
            const liveStock = product.stockQuantity - currentCartQty;

            return (
              <div
                key={product._id}
                onClick={() => {
                  if (liveStock > 0) {
                    dispatch(addToCart(product));
                  } else {
                    message.warning("Insufficient items remaining in stock!");
                  }
                }}
                className={`cursor-pointer rounded-2xl border bg-white/40 p-5 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-white/60 hover:shadow-xl ${
                  liveStock === 0
                    ? "opacity-60 border-red-200"
                    : "border-gray-300 "
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-lg font-bold leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        liveStock < 5
                          ? "bg-red-100 text-red-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      Stock: {liveStock}
                    </span>
                    {liveStock < 5 && liveStock > 0 && (
                      <Tag
                        color="error"
                        icon={<WarningOutlined />}
                        className="m-0 text-[10px] uppercase font-bold rounded-md"
                      >
                        Low Stock
                      </Tag>
                    )}
                    {liveStock == 0 && (
                      <Tag
                        color="error"
                        icon={<WarningOutlined />}
                        className="m-0 text-[10px] uppercase font-bold rounded-md"
                      >
                        No Stock
                      </Tag>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-4">
                  {product.sku}
                </p>
                <div className="text-2xl font-black text-indigo-600">
                  Rs. {product.price.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT PANE: CART SIDEBAR */}
      <aside className="w-96 flex flex-col border-l border-white/50 bg-white/50 backdrop-blur-xl shadow-2xl">
        <div className="p-6 border-b border-white/50">
          <h2 className="text-2xl font-bold">Current Order</h2>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <p>Scan or select products to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl bg-white/70 p-4 shadow-sm backdrop-blur-sm border border-white/50"
                >
                  <div className="flex justify-between font-bold">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="shrink-0">
                      Rs. {(item.price * item.cartQuantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item._id,
                              quantity: item.cartQuantity - 1,
                            }),
                          )
                        }
                      />

                      {/* Numeric Manual Input box */}
                      <InputNumber
                        size="small"
                        min={1}
                        max={item.stockQuantity}
                        value={item.cartQuantity}
                        className="w-16 rounded-md text-center font-bold"
                        controls={false}
                        onChange={(val) => {
                          if (val !== null) {
                            dispatch(
                              updateQuantity({
                                id: item._id,
                                quantity: Math.floor(val),
                              }),
                            );
                          }
                        }}
                      />

                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => dispatch(addToCart(item))}
                        disabled={item.cartQuantity >= item.stockQuantity}
                      />
                    </div>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => dispatch(removeFromCart(item._id))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOTALS & CHECKOUT */}
        <div className="bg-white/80 p-6 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-white/60">
          <div className="space-y-2 text-sm font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                Rs.{" "}
                {cart.subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (16%)</span>
              <span>
                Rs.{" "}
                {cart.taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="my-4 border-t border-gray-200"></div>
          <div className="mb-6 flex justify-between text-2xl font-black text-gray-900">
            <span>Total</span>
            <span>
              Rs.{" "}
              {cart.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={isProcessing}
            className="h-14 rounded-xl bg-indigo-600 text-lg font-bold shadow-lg hover:bg-indigo-700"
            disabled={cart.items.length === 0}
            onClick={handleCheckout}
          >
            Pay Rs.{" "}
            {cart.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Button>
        </div>
      </aside>
    </main>
  );
}
