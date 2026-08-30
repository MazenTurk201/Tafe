import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExpensesApi } from "@/api/expensesApi";
import type { Expense } from "@/types/expense";
import { useTranslation } from "react-i18next";
import { AddExpenseDialog, UpdateExpenseDialog} from "@/components/Widgets/ExpenseDialog";

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpense] = useState<Expense[]>([]);
  const [delExpenses, setDelExpense] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const { t } = useTranslation();

  const loadExpenses = async () => {
    try {
      const data = await ExpensesApi.GetExpenses();
      setExpense(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedExpenses = async () => {
    try {
      const data = await ExpensesApi.GetDeletedExpenses();
      setDelExpense(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadExpenses(),
      loadDeletedExpenses(),
    ]);
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [data, deletedData] = await Promise.all([
          ExpensesApi.GetExpenses(),
          ExpensesApi.GetDeletedExpenses(),
        ]);

        if (!ignore) {
          setExpense(data);
          setDelExpense(deletedData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoadingD(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        loadExpenses();
        return;
      }

      try {
        setSearchLoading(true);

        const data = await ExpensesApi.GetExpensesbyDate(Date.UTC(2006,1,1).toString(),Date.now().toString());

        setExpense(data);
      } catch (error) {
        console.error("Failed to search expenses:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: number) => {
    try{
      await ExpensesApi.DeleteExpense(id);
      Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete expense");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await ExpensesApi.RestoreExpense(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore expense");
    }
  }

  const handleSearch = async (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      await loadExpenses();
      return;
    }

    try {
      setSearchLoading(true);

      const data = await ExpensesApi.GetExpensesbyDate(Date.UTC(2006,1,1).toString(),Date.now().toString());

      setExpense(data);
    } catch (error) {
      console.error("Failed to search expenses:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("Expense")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("ExpenseSubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddExpenseDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-x-5">

      <label>{t("from")}</label>

      <input
          type="date"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("from")}
          className="
            w-full rounded-xl border
            border-zinc-200 bg-white px-4 py-2
            outline-none focus:border-black
            md:max-w-xs
            dark:border-zinc-800 dark:bg-zinc-900
          "
        />

        <label>{t("to")}</label>

        <input
          type="date"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("ExpenseSearch")}
          className="
            w-full rounded-xl border
            border-zinc-200 bg-white px-4 py-2
            outline-none focus:border-black
            md:max-w-xs
            dark:border-zinc-800 dark:bg-zinc-900
          "
        />

        </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : expenses.length === 0 ? (
        <div
          className="
            rounded-2xl border border-dashed
            border-zinc-300 py-20 text-center
            dark:border-zinc-700 min-h-64 m-5
            flex items-center justify-center
          "
        >
          <p className="text-4xl font-semibold">
            {t("empty")}
          </p>

        </div>
      ) : (
        <>
        
        {searchLoading ? (
  <div className="py-5 text-center animate-pulse">
    {t("loading")}
  </div>
) : (
  <div className="tableCover">
    <table>
      <thead>
        <tr>
          <th>{t("name")}</th>
          <th>{t("id")}</th>
          <th>{t("amount")}</th>
          <th>{t("ExpenseDate")}</th>
          <th>{t("type")}</th>
          <th>{t("notes")}</th>
          <th>{t("funcs")}</th>
        </tr>
      </thead>

      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.name}</td>
            <td>{expense.id}</td>
            <td>{expense.amount}</td>
            <td>{new Date(expense.expenseDate).toISOString().split("T")[0].replaceAll("-", "/")}</td>
            <td>{t(expense.type)}</td>
            <td>{expense.notes}</td>

            <td>
              <UpdateExpenseDialog
                onSuccess={Refresh}
                model={{
                    id: expense.id,
                    name: expense.name,
                    amount: expense.amount,
                    expenseDate: expense.expenseDate,
                    type: expense.type,
                    notes: expense.notes
                }}
              />

              <button
                className="delete-btn"
                onClick={() => handleDelete(expense.id)}
              >
                {t("delete")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        </>
      )}

      {loadingD ? (
        <></>
      ) : delExpenses.length === 0 ? (
        <></>
      ) : (
        <details>
      <summary>{t("openDelted")}</summary>
        <div className="tableCover">
          <table>
            <thead>
            <tr>
                <th>{t("name")}</th>
                <th>{t("id")}</th>
                <th>{t("amount")}</th>
                <th>{t("ExpenseDate")}</th>
                <th>{t("type")}</th>
                <th>{t("notes")}</th>
            </tr>
            </thead>
            <tbody>
            {delExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.name}</td>
                <td>{expense.id}</td>
                <td>{expense.amount}</td>
                <td>{expense.expenseDate}</td>
                <td>{t(expense.type)}</td>
                <td>{expense.notes}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(expense.id)}}>{t("restore")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        </details>
      )}
    </main>
  );
}