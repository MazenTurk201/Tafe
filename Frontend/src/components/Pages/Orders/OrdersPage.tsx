import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShiftApi } from "@/api/shiftsApi";
import type { Order } from "@/types/order";
import { ordersApi } from "@/api/ordersApi";
import OrderCard from "@/components/Widgets/OrderCard";

type Filter =
  | "all"
  | "active"
  | "today"
  | "deleted";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hasActiveShift, setHasActiveShift] = useState(false);

  

  // Shifts

  useEffect(() => {
  const fetchShiftStatus = async () => {
    try {
      setLoading(true);

      const status = await ShiftApi.GetStatus();

      setHasActiveShift(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchShiftStatus();
}, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      let data: Order[];

      switch (filter) {
        case "all":
          data = await ordersApi.getAll();
          break;

        case "today":
          data = await ordersApi.getToday();
          break;

        case "deleted":
          data = await ordersApi.getDeleted();
          break;

        default:
          data = await ordersApi.getActive();
      }

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.orderNumber,
        order.customerName,
        order.tableName,
        order.status,
        order.orderType,
      ]
        .filter(Boolean)
        .some((x) =>
          String(x).toLowerCase().includes(value)
        )
    );
  }, [orders, search]);

  return (
    <main className="w-full px-5 py-8">
    {hasActiveShift ? 
    <>
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="mt-1 text-zinc-500">
            Manage cafe orders
          </p>
        </div>

        <Link
          to="/orders/new"
          className="
            rounded-xl bg-black px-5 py-3
            text-sm font-semibold text-white
            hover:bg-zinc-800
            dark:bg-white dark:text-black
          "
        >
          + New Order
        </Link>
      </div>

      {/* Filters */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <div className="flex flex-wrap gap-2">
          {[
            ["active", "Active"],
            ["today", "Today"],
            ["all", "All"],
            ["deleted", "Deleted"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() =>
                setFilter(value as Filter)
              }
              className={`
                rounded-xl px-4 py-2 text-sm font-medium
                ${
                  filter === value
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search orders..."
          className="
            ml-auto w-full rounded-xl border
            border-zinc-200 bg-white px-4 py-2
            outline-none focus:border-black
            md:max-w-xs
            dark:border-zinc-800 dark:bg-zinc-900
          "
        />
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="
            rounded-2xl border border-dashed
            border-zinc-300 py-20 text-center
            dark:border-zinc-700
          "
        >
          <p className="text-lg font-semibold">
            No orders found
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            There are no orders matching your filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
            />
          ))}
        </div>
      )}
    </>
    : <div className="h-dvh flex justify-center items-center text-center text-2xl font-bold pb-30 animate-pulse">Open Shift Plz..</div> }
      
    </main>
  );
}