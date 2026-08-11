import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  Order,
  OrderStatus,
} from "../../../types/order";

import { ordersApi } from "../../../api/ordersApi";
import StatusBadge from "../../Sections/Orders/StatusBadge";

const statuses: OrderStatus[] = [
  "Pending",
  "Preparing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;

    try {
      const data = await ordersApi.getById(
        Number(id)
      );

      setOrder(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const changeStatus = async (
    status: OrderStatus
  ) => {
    if (!order) return;

    try {
      const updated =
        await ordersApi.updateStatus({
          id: order.id,
          status,
        });

      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Failed to change order status");
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm("Delete this item?")) return;

    try {
      const updated =
        await ordersApi.deleteItem(itemId);

      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Failed to delete item");
    }
  };

  const deleteOrder = async () => {
    if (!order) return;

    if (
      !confirm(
        `Delete order #${order.orderNumber}?`
      )
    ) {
      return;
    }

    try {
      await ordersApi.deleteOrder(order.id);

      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        Order not found
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl px-5 py-8">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/orders"
            className="text-sm text-zinc-500 hover:text-black"
          >
            ← Orders
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              #{order.orderNumber}
            </h1>

            <StatusBadge status={order.status} />
          </div>
        </div>

        <button
          onClick={deleteOrder}
          className="
            rounded-xl bg-red-500 px-4 py-2
            text-sm font-semibold text-white
            hover:bg-red-600
          "
        >
          Delete Order
        </button>
      </div>

      {/* Info */}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Info
          title="Type"
          value={order.orderType}
        />

        <Info
          title="Table"
          value={order.tableName ?? "—"}
        />

        <Info
          title="Customer"
          value={
            order.customerName ?? "Walk-in"
          }
        />

        <Info
          title="Cashier"
          value={
            order.cashierName ?? "—"
          }
        />
      </div>

      {/* Status */}

      <section
        className="
          mb-6 rounded-2xl border
          border-zinc-200 bg-white p-5
          dark:border-zinc-800 dark:bg-zinc-900
        "
      >
        <h2 className="mb-4 font-bold">
          Change Status
        </h2>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              disabled={order.status === status}
              onClick={() =>
                changeStatus(status)
              }
              className={`
                rounded-xl px-4 py-2 text-sm
                ${
                  order.status === status
                    ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Items */}

      <section
        className="
          overflow-hidden rounded-2xl border
          border-zinc-200 bg-white
          dark:border-zinc-800 dark:bg-zinc-900
        "
      >
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-bold">
            Order Items
          </h2>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-5"
            >
              <div className="flex-1">
                <p className="font-semibold">
                  {item.productName ??
                    `Product #${item.productId}`}
                </p>

                {item.notes && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-zinc-500">
                  Qty
                </p>

                <p className="font-semibold">
                  {item.quantity}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-500">
                  Total
                </p>

                <p className="font-bold">
                  {item.total.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteItem(item.id)
                }
                className="
                  rounded-lg px-3 py-2
                  text-red-500 hover:bg-red-50
                  dark:hover:bg-red-500/10
                "
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}

        <div className="border-t border-zinc-200 p-5 dark:border-zinc-800">
          <div className="ml-auto max-w-sm space-y-2">
            <Total
              title="Subtotal"
              value={order.subTotal}
            />

            <Total
              title="Discount"
              value={-order.discount}
            />

            <Total
              title="Tax"
              value={order.tax}
            />

            <Total
              title="Service"
              value={order.service}
            />

            <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold dark:border-zinc-700">
              <span>Total</span>

              <span>
                {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl border border-zinc-200
        bg-white p-4
        dark:border-zinc-800 dark:bg-zinc-900
      "
    >
      <p className="text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function Total({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">
        {title}
      </span>

      <span>
        {value.toFixed(2)}
      </span>
    </div>
  );
}