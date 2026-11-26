import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { getApiError } from "@/lib/api-error";

interface ShiftCashDialogProps {
  mode: "open" | "close";
  onConfirm: (cash: number) => Promise<void>;
}

export default function ShiftCashDialog({
  mode,
  onConfirm,
}: ShiftCashDialogProps) {
  const { t } = useTranslation();

  const [cash, setCash] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = mode === "open";
  const amount = Number(cash);
  const isValid = cash !== "" && !Number.isNaN(amount) && amount >= 0;

  const title = isOpen
    ? t("openShift", "فتح الشيفت")
    : t("closeShift", "إغلاق الشيفت");

  const handleOpenChange = (value: boolean) => {
    if (loading) return; // متقفلش وهو بيبعت
    setOpen(value);
    if (!value) {
      setCash("");
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setError(null);
      await onConfirm(amount);
      setCash("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError(getApiError(err)); // الديالوج يفضل مفتوح ويعرض الغلط
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
            isOpen
              ? "bg-linear-to-br from-[#C58B4E] to-[#B5573A]"
              : "bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
          }`}
        >
          {title}
        </button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isOpen
                ? t("openShiftDesc", "أدخل المبلغ الموجود في الكاش عند بداية الشيفت.")
                : t("closeShiftDesc", "أدخل المبلغ الموجود في الكاش عند إغلاق الشيفت.")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <label
              htmlFor="shift-cash"
              className="mb-2 block text-sm font-medium text-stone-600 dark:text-stone-300"
            >
              {isOpen
                ? t("openingCash", "الكاش عند الفتح")
                : t("closingCash", "الكاش عند الإغلاق")}
            </label>

            <input
              id="shift-cash"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              autoFocus
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder={t("enterAmount", "أدخل المبلغ")}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg font-semibold outline-none transition focus:border-[#C58B4E] focus:ring-2 focus:ring-[#C58B4E]/30 dark:border-stone-700 dark:bg-stone-900"
            />

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="rounded-xl border border-stone-300 px-5 py-2 text-sm font-medium transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              {t("cancel", "إلغاء")}
            </button>

            <button
              type="submit"
              disabled={loading || !isValid}
              className="rounded-xl bg-linear-to-br from-[#C58B4E] to-[#B5573A] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("processing", "جاري التنفيذ...") : title}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}