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
import { useTranslation } from "react-i18next";
import { ExpensesApi } from "@/api/expensesApi";
import type { Expense, ExpenseType } from "@/types/expense";


const typeExpenseT: ExpenseType[] = [
  "Rent",
  "Electricity",
  "Water",
  "Gas",
  "Internet",
  "Salary",
  "Maintenance",
  "Purchases",
  "Other",
];

interface AddExpenseDialogProps {
  onSuccess: () => void;
}

export function AddExpenseDialog({ onSuccess }: AddExpenseDialogProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [typeExpense, setTypeExpense] =
    useState<ExpenseType>("Purchases");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await ExpensesApi.CreateExpense(
        {
          name,
          expenseDate: new Date( Date.now() - new Date().getTimezoneOffset() * 60000 ).toISOString().slice(0, -1),
          amount,
          type: typeExpense,
          notes,
      });
      onSuccess();
      setName("");
      setAmount(0);
      setNotes("");
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
        <div
          className="
            rounded-xl bg-black px-5 py-3
            text-sm font-semibold text-white
            hover:bg-zinc-500
            dark:bg-white dark:text-black cursor-pointer
          "
        >
          {t("ExpenseCreate")}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Expenses")}
          </DialogTitle>

          <DialogDescription>
            {t("ExpenseAddDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Expense")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ExpensePlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder={t("ExpensePlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />

          <select
          value={typeExpense}
          onChange={() => setTypeExpense(typeExpense)}
          className="select-auto">
            <option selected>{t("ExpensePlaceholderSelect")}</option>
            {
              typeExpenseT.map((typeE) => (
                <option value={typeE} key={typeE}>
                {t(typeE)}
                </option>
              ))
            }
          </select>

          <textarea value={notes} onChange={(e) => {setNotes(e.target.value)}} placeholder="Any Notes?">

          </textarea>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
          >
            {loading
              ? t("loading")
              : t("create")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface UpdateExpenseDialogProps {
  model: Expense;
  onSuccess: () => void;
}

export function UpdateExpenseDialog({
  model,
  onSuccess,
}: UpdateExpenseDialogProps) {
  const [name, setName] = useState(model.name);
  const [amount, setAmount] = useState(model.amount);
  const [notes, setNotes] = useState(model.notes);
  const [typeExpense, setTypeExpense] =
    useState<ExpenseType>(model.type);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await ExpensesApi.EditExpense({
        id: model.id,
        name,
        type: typeExpense,
        amount,
        notes,
        expenseDate: model.expenseDate
      });
      onSuccess();
      setName("");
      setAmount(0);
      setNotes("");
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
        <button className="update-btn">
          {t("update")}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Expenses")}
          </DialogTitle>

          <DialogDescription>
            {t("ExpenseUpdateDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Expense")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ExpensePlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder={t("ExpensePlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />

          <select
          value={typeExpense}
          onChange={() => setTypeExpense(typeExpense)}
          className="select-auto">
            <option selected>{t("ExpensePlaceholderSelect")}</option>
            {
              typeExpenseT.map((typeE) => (
                <option value={typeE} key={typeE}>
                {t(typeE)}
                </option>
              ))
            }
          </select>

          <textarea value={notes} onChange={(e) => {setNotes(e.target.value)}} placeholder="Any Notes?"></textarea>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
          >
            {loading
              ? t("loading")
              : t("update")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}