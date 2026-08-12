import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";

interface ShiftCashDialogProps {
  mode: "open" | "close";
  onConfirm: (cash: number) => Promise<void>;
}

export default function ShiftCashDialog({
  mode,
  onConfirm,
}: ShiftCashDialogProps) {
  const [cash, setCash] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = mode === "open";

  const handleSubmit = async () => {
    const amount = Number(cash);

    if (!cash || Number.isNaN(amount) || amount < 0) {
      return;
    }

    try {
      setLoading(true);

      await onConfirm(amount);

      setCash("");
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button>
          {isOpen ? "فتح الشيفت" : "إغلاق الشيفت"}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOpen ? "فتح الشيفت" : "إغلاق الشيفت"}
          </DialogTitle>

          <DialogDescription>
            {isOpen
              ? "أدخل المبلغ الموجود في الكاش عند بداية الشيفت."
              : "أدخل المبلغ الموجود في الكاش عند إغلاق الشيفت."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {isOpen ? "Opening Cash" : "Closing Cash"}
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            placeholder="أدخل المبلغ"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !cash}
          >
            {loading
              ? "جاري التنفيذ..."
              : isOpen
                ? "فتح الشيفت"
                : "إغلاق الشيفت"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}