import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { dashboardApi } from "../../api/dashboardApi";
import { getApiError } from "../../lib/api-error";
import DisplayCard from "../Widgets/DisplayCard";
import type { Dashboard } from "../../types/dashboard";
import { ShiftApi } from "@/api/shiftsApi";

export default function Main() {
  const { t, i18n } = useTranslation();

  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);


  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [hasActiveShift, setHasActiveShift] = useState(false);

  // =========================
  // Language Direction
  // =========================

  useEffect(() => {
    document.body.dir =
      i18n.language.startsWith("ar")
        ? "rtl"
        : "ltr";
  }, [i18n.language]);

  // =========================
  // Get Dashboard
  // =========================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        setDashboard(
          await dashboardApi.getSummary()
        );
      } catch (err) {
        console.error(err);
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Shifts

  useEffect(() => {
  const fetchShiftStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const status = await ShiftApi.GetStatus();

      setHasActiveShift(status);
    } catch (err) {
      console.error(err);
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  fetchShiftStatus();
}, []);

  return (
    <main className="flex min-h-full w-full flex-1 flex-col items-center gap-5 bg-white px-16 py-22 text-black dark:bg-black dark:text-white not-sm:p-5 md:pt-32">
      {hasActiveShift ? (
  <button 
  // onClick={handleCloseShift}
  >
    إغلاق الشيفت
  </button>
) : (
  <button 
  // onClick={handleOpenShift}
  >
    فتح الشيفت
  </button>
)}
      {/* Welcome */}
      <h1 className="relative bottom-10 text-xl">
        {t("welcome")}
      </h1>

      <h2 className="mb-4 text-lg font-bold">
          {t(
            "dashboards_list",
            "Dashboard"
          )}
        </h2>

      
        {/* Loading */}
        {loading && (
          <p className="animate-pulse text-gray-500">
            {t(
              "loading",
              "Loading Data..."
            )}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="font-semibold text-red-500">
            {t("error", "Error:")}{" "}
            {error}
          </p>
        )}

        {/* No Data */}
        {!loading &&
          !error &&
          !dashboard && (
            <p className="text-gray-400">
              {t(
                "no_dashboards",
                "No Data available."
              )}
            </p>
          )}

        {/* Data */}
        {!loading &&
          !error &&
          dashboard && (
            <div className="flex gap-5">
                {DisplayCard("Total VIPs", dashboard.totalVips.toString())}
                {DisplayCard("Total Active Orders", dashboard.totalActiveOrders.toString())}
                {DisplayCard("Total Cash Payments", dashboard.totalCashPayments.toString() + "$")}
                {DisplayCard("Total Sales", dashboard.totalSales.toString() + "$")}
                {DisplayCard("Total Orders", dashboard.totalOrders.toString())}
                {DisplayCard("Total Customers", dashboard.totalCustomers.toString())}
                {DisplayCard("Total Products", dashboard.totalProducts.toString())}
            </div>
          )}
    </main>
  );
}
