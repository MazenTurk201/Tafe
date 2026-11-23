import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { dashboardApi } from "../../api/dashboardApi";
import { getApiError } from "../../lib/api-error";
import DisplayCard from "../Widgets/DisplayCard";
import type { Dashboard } from "../../types/dashboard";
import { ShiftApi } from "@/api/shiftsApi";
import ShiftCashDialog from "../Widgets/ShiftCashDialog";
import ApexChart from "../Widgets/Charts";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "../Utilties/changeMode";

export default function Main() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

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


const handleOpenShift = async (cash: number) => {
  try {
    setLoading(true);
    setError(null);

    await ShiftApi.OpenShift(cash);

    setHasActiveShift(true);
  } catch (err) {
    console.error(err);
    setError(getApiError(err));
    throw err;
  } finally {
    setLoading(false);
  }
};

const handleCloseShift = async (cash: number) => {
  try {
    setLoading(true);
    setError(null);

    await ShiftApi.CloseShift(cash);

    setHasActiveShift(false);
  } catch (err) {
    console.error(err);
    setError(getApiError(err));
    throw err;
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="flex min-h-full w-full flex-1 flex-col items-center gap-5 px-16 py-22 text-black dark:text-white not-sm:p-5 md:pt-32">

{hasActiveShift ? (
  <ShiftCashDialog
    mode="close"
    onConfirm={handleCloseShift}
  />
) : (
  <ShiftCashDialog
    mode="open"
    onConfirm={handleOpenShift}
  />
)}
      <br />

      {/* Welcome */}
      <h1 className="text-xl mt-10 font-bold">
        {t("welcome")}
      </h1>

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
            <div className="flex justify-items-center">
            <ApexChart
              series={
                [
                  {
                    name: 'Coffee',
                    data: [42, 48, 51, 39, 55, 60, 58, 44, 50, 63, 66, 59, 52, 57],
                  },
                  {
                    name: 'Mango',
                    data: [28, 35, 22, 41, 33, 26, 38, 45, 31, 24, 36, 42, 29, 34],
                  },
                ]
              }
              options={
              {
                chart: {
                  height: 350,
                  type: 'area',
                  background: 'transparent',
                },
                dataLabels: {
                  enabled: false,
                },
                stroke: {
                  curve: 'smooth',
                },
                title: {
                  text: t("salesChart", "Sales Chart"),
                  align: 'left',
                },
                xaxis: {
                  type: 'datetime',
                  categories: [
                    '2025-06-01',
                    '2025-06-02',
                    '2025-06-03',
                    '2025-06-04',
                    '2025-06-05',
                    '2025-06-06',
                    '2025-06-07',
                    '2025-06-08',
                    '2025-06-09',
                    '2025-06-10',
                    '2025-06-11',
                    '2025-06-12',
                    '2025-06-13',
                    '2025-06-14',
                  ],
                },
                yaxis: {
                  labels: {
                    formatter: function (val) {
                      return val + ' GWh'
                    },
                  },
                },
                tooltip: {
                  x: {
                    format: 'dd MMM yyyy',
                  },
                },
                legend: {
                  position: 'top',
                },
                grid: {
                  borderColor: "#00000000",
                },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                  }
                },
                theme: {
                  mode: theme === 'dark' ? 'dark' : 'light',
                },
                colors: ['#C58B4E', '#B5573A'],
                } as ApexOptions
            }/>
            <div className="grid min-h-full w-full flex-1 grid-cols-2 gap-5 text-black dark:text-white">
                {DisplayCard("Total VIPs", dashboard.totalVips.toString())}
                {DisplayCard("Total Active Orders", dashboard.totalActiveOrders.toString())}
                {DisplayCard("Total Cash Payments", dashboard.totalCashPayments.toString() + "$")}
                {DisplayCard("Total Sales", dashboard.totalSales.toString() + "$")}
                {DisplayCard("Total Orders", dashboard.totalOrders.toString())}
                {DisplayCard("Total Customers", dashboard.totalCustomers.toString())}
                {DisplayCard("Total Products", dashboard.totalProducts.toString())}
            </div>
            </div>
          )}
    </main>
  );
}
