import type { OrderStatus } from "../../../types/order";

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const styles: Record<OrderStatus, string> = {
    Pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",

    Preparing:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

    Ready:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

    Delivered:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",

    Completed:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",

    Cancelled:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}