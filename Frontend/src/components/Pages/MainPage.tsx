import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ApexOptions } from "apexcharts";

import { dashboardApi } from "../../api/dashboardApi";
import { getApiError } from "../../lib/api-error";
import type { Dashboard } from "../../types/dashboard";
import { ShiftApi } from "@/api/shiftsApi";
import ShiftCashDialog from "../Widgets/ShiftCashDialog";
import ApexChart from "../Widgets/Charts";
import { useTheme } from "../Utilties/changeMode";

const CURRENCY = "$";

/* ========================= Small UI pieces ========================= */

function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 py-10 text-center text-sm text-stone-400 dark:border-stone-700">
      <span className="text-3xl">{icon}</span>
      <p>{text}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        accent
          ? "border-transparent bg-linear-to-br from-[#C58B4E] to-[#B5573A] text-white"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl text-2xl ${
          compact ? "h-10 w-10" : "h-12 w-12"
        } ${accent ? "bg-white/20" : "bg-[#C58B4E]/15"}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`truncate text-sm ${
            accent ? "text-white/80" : "text-stone-500 dark:text-stone-400"
          }`}
        >
          {label}
        </p>
        <p className={`truncate font-bold ${compact ? "text-xl" : "text-2xl"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
  );
}

/* ========================= Page ========================= */

export default function Main() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasActiveShift, setHasActiveShift] = useState(false);
  const [shiftError, setShiftError] = useState<string | null>(null);

  const isArabic = i18n.language.startsWith("ar");

  // Language direction
  useEffect(() => {
    document.body.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  // Dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        setDashboard(await dashboardApi.getSummary());
      } catch (err) {
        console.error(err);
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Shift status
  useEffect(() => {
    const fetchShiftStatus = async () => {
      try {
        setShiftError(null);
        setHasActiveShift(await ShiftApi.GetStatus());
      } catch (err) {
        console.error(err);
        setShiftError(getApiError(err));
      }
    };
    fetchShiftStatus();
  }, []);

  const handleOpenShift = async (cash: number) => {
    try {
      setShiftError(null);
      await ShiftApi.OpenShift(cash);
      setHasActiveShift(true);
    } catch (err) {
      console.error(err);
      setShiftError(getApiError(err));
      throw err;
    }
  };

  const handleCloseShift = async (cash: number) => {
    try {
      setShiftError(null);
      await ShiftApi.CloseShift(cash);
      setHasActiveShift(false);
    } catch (err) {
      console.error(err);
      setShiftError(getApiError(err));
      throw err;
    }
  };

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(i18n.language, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [i18n.language]
  );

  /* ---------- Chart (TODO: بدّل الداتا دي بداتا حقيقية من الـ API) ---------- */
  const chartDates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d.toISOString().slice(0, 10);
      }),
    []
  );

  const chartSeries = [
    {
      name: t("coffee", "Coffee"),
      data: [42, 48, 51, 39, 55, 60, 58, 44, 50, 63, 66, 59, 52, 57],
    },
    {
      name: t("mango", "Mango"),
      data: [28, 35, 22, 41, 33, 26, 38, 45, 31, 24, 36, 42, 29, 34],
    },
  ];

  const chartOptions = {
    chart: {
      height: 320,
      type: "area",
      background: "transparent",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { type: "datetime", categories: chartDates },
    yaxis: {
      labels: { formatter: (val: number) => `${val}${CURRENCY}` },
    },
    tooltip: { x: { format: "dd MMM yyyy" } },
    legend: { position: "top" },
    grid: { borderColor: "#00000000" },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05 },
    },
    theme: { mode: theme === "dark" ? "dark" : "light" },
    colors: ["#C58B4E", "#B5573A"],
  } as ApexOptions;

  const quickActions = [
    { to: "/orders", icon: "🧾", label: t("Orders", "Orders") },
    { to: "/menu", icon: "☕", label: t("menu", "Menu") },
    { to: "/products", icon: "🍰", label: t("Products", "Products") },
    { to: "/expenses", icon: "💸", label: t("Expenses", "Expenses") },
  ];

  return (
    <main className="flex min-h-full w-full flex-1 flex-col gap-6 px-4 pt-24 pb-10 text-stone-900 sm:px-8 md:pt-32 lg:px-16 dark:text-stone-100">
      {/* ========== Header ========== */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("welcome")}</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {today}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              hasActiveShift
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-stone-500/15 text-stone-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                hasActiveShift ? "animate-pulse bg-emerald-500" : "bg-stone-400"
              }`}
            />
            {hasActiveShift
              ? t("shiftOpen", "Shift Open")
              : t("shiftClosed", "Shift Closed")}
          </span>

          <ShiftCashDialog
            mode={hasActiveShift ? "close" : "open"}
            onConfirm={hasActiveShift ? handleCloseShift : handleOpenShift}
          />
        </div>
      </header>

      {/* ========== Errors ========== */}
      {(error || shiftError) && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {t("error", "Error:")} {error ?? shiftError}
        </div>
      )}

      {/* ========== Stats ========== */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : !error && !dashboard ? (
        <p className="text-center text-stone-400">
          {t("no_dashboards", "No Data available.")}
        </p>
      ) : (
        dashboard && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                accent
                icon="💰"
                label={t("totalSales", "Total Sales")}
                value={`${dashboard.totalSales}${CURRENCY}`}
              />
              <StatCard
                icon="💵"
                label={t("totalCash", "Cash Payments")}
                value={`${dashboard.totalCashPayments}${CURRENCY}`}
              />
              <StatCard
                icon="🔥"
                label={t("activeOrders", "Active Orders")}
                value={dashboard.totalActiveOrders.toString()}
              />
              <StatCard
                icon="🧾"
                label={t("totalOrders", "Total Orders")}
                value={dashboard.totalOrders.toString()}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                compact
                icon="👥"
                label={t("totalCustomers", "Customers")}
                value={dashboard.totalCustomers.toString()}
              />
              <StatCard
                compact
                icon="⭐"
                label={t("totalVips", "VIPs")}
                value={dashboard.totalVips.toString()}
              />
              <StatCard
                compact
                icon="🍽️"
                label={t("totalProducts", "Products")}
                value={dashboard.totalProducts.toString()}
              />
            </div>
          </>
        )
      )}

      {/* ========== Chart + Top products ========== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title={t("salesChart", "Sales Chart")} className="lg:col-span-2">
          {/* TODO: بدّل chartSeries / chartDates بداتا المبيعات الحقيقية */}
          <ApexChart series={chartSeries} options={chartOptions} />
        </Panel>

        <Panel title={t("topProducts", "Top Selling")}>
          {/* TODO: هات أكتر المنتجات مبيعاً من الـ API واعملها map هنا */}
          <EmptyState icon="🏆" text={t("noTopProducts", "No data yet")} />
        </Panel>
      </div>

      {/* ========== Recent orders + Low stock ========== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title={t("recentOrders", "Recent Orders")}
          className="lg:col-span-2"
          action={
            <Link
              to="/orders"
              className="text-sm font-medium text-[#B5573A] hover:underline"
            >
              {t("viewAll", "View all")}
            </Link>
          }
        >
          {/* TODO: جدول آخر الطلبات (رقم الطلب، الترابيزة، الإجمالي، الحالة) */}
          <EmptyState icon="🧾" text={t("noRecentOrders", "No recent orders")} />
        </Panel>

        <Panel
          title={t("lowStock", "Low Stock")}
          action={
            <Link
              to="/ingredients"
              className="text-sm font-medium text-[#B5573A] hover:underline"
            >
              {t("viewAll", "View all")}
            </Link>
          }
        >
          {/* TODO: المكونات اللي قربت تخلص */}
          <EmptyState icon="📦" text={t("stockOk", "Everything is in stock")} />
        </Panel>
      </div>

      {/* ========== Quick actions ========== */}
      <Panel title={t("quickActions", "Quick Actions")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex flex-col items-center gap-2 rounded-xl bg-stone-100 py-5 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-[#C58B4E]/20 dark:bg-stone-800 dark:hover:bg-[#C58B4E]/25"
            >
              <span className="text-3xl">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </Panel>
    </main>
  );
}