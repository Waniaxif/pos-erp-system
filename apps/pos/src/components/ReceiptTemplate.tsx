import React from "react";
import type { Order } from "@pos/types";

interface ReceiptTemplateProps {
  order: Order | null;
}

export default function ReceiptTemplate({ order }: ReceiptTemplateProps) {
  if (!order) return null;

  return (
    <div
      id="printable-receipt"
      className="hidden print:block w-[80mm] p-4 text-black bg-white text-sm"
    >
      {/* HEADER */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-black uppercase tracking-widest">
          Your Restaurant
        </h2>
        <p className="text-xs">123 Main Street, Food District</p>
        <p className="text-xs">Tel: +92 300 0000000</p>
        <p className="text-xs mt-2 border-b border-black pb-2 border-dashed">
          Terminal: {order.cashierId}
        </p>
      </div>

      {/* METADATA */}
      <div className="flex justify-between text-xs font-bold mb-4">
        <span>
          Receipt: #{order._id.substring(order._id.length - 6).toUpperCase()}
        </span>
        <span>
          {new Date(order.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* ITEMS LIST */}
      <div className="border-b border-black pb-2 mb-2 border-dashed">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="pb-1">Qty</th>
              <th className="pb-1">Item</th>
              <th className="pb-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item._id} className="align-top">
                <td className="pt-2">{item.cartQuantity}x</td>
                <td className="pt-2 pr-2">{item.name}</td>
                <td className="pt-2 text-right">
                  {(item.price * item.cartQuantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="flex flex-col items-end text-xs space-y-1 mb-4">
        <div className="flex justify-between w-full">
          <span>Subtotal:</span>
          <span>
            Rs.{" "}
            {order.subtotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between w-full">
          <span>Tax (16%):</span>
          <span>
            Rs.{" "}
            {order.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between w-full text-base font-black mt-1 pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>
            Rs.{" "}
            {order.total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between w-full text-xs mt-2">
          <span>Paid via {order.paymentMethod}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center mt-6 text-xs">
        <p className="font-bold">Thank you for dining with us!</p>
        <p>Please visit again.</p>
        <div className="mt-8">*** END OF RECEIPT ***</div>
      </div>
    </div>
  );
}
