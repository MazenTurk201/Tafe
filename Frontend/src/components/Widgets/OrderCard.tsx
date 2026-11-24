import { Link } from "react-router-dom";
import type { Order } from "@/types/order";
import StatusBadge from "@/components/Sections/Orders/StatusBadge";
import { useTranslation } from "react-i18next";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/orders/${order.id}`}
      className="
        block rounded-2xl border border-zinc-200
        bg-white p-5 shadow-sm
        transition hover:-translate-y-1 hover:shadow-lg
        dark:border-zinc-800 dark:bg-zinc-900
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">
            {t("order")}
          </p>

          <h2 className="text-lg font-bold">
            #{order.orderNumber}
          </h2>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-zinc-500">{t("type")}</p>
          <p className="font-medium">
            {order.orderType}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">{t("table")}</p>
          <p className="font-medium">
            {order.tableName ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">{t("customer")}</p>
          <p className="font-medium">
            {order.customerName ?? "Walk-in"}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">{t("items")}</p>
          <p className="font-medium">
            {order.items.length}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex justify-between">
          <span className="text-zinc-500">
            {t("total")}
          </span>

          <span className="text-xl font-bold">
            {order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}