import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SuppliersApi } from "@/api/suppliersApi";
import type { PurchaseInvoicesBySupplier } from "@/types/supplier";
import { useTranslation } from "react-i18next";
import { AddSupplierDialog } from "@/components/Widgets/SupplierDialog";
// import { AddSupplierDialog, UpdateSupplierDialog} from "@/components/Widgets/SupplierDialog";

export default function SuppliersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSupplier] = useState<PurchaseInvoicesBySupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadSuppliers = async () => {
    try {
      const data = await SuppliersApi.GetPurchaseInvoicesBySupplier(id ? parseInt(id) : 0);
      setSupplier(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await SuppliersApi.GetPurchaseInvoicesBySupplier(id ? parseInt(id) : 0);

        if (!ignore) {
          setSupplier(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id: number) => {
    try{
      await SuppliersApi.DeleteSupplier(id);
      await loadSuppliers();
    } catch (error){
      console.error(error);
      alert("Failed to delete supplier");
    }
  }

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("Supplier")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("SupplierSubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddSupplierDialog onSuccess={loadSuppliers}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : suppliers.length === 0 ? (
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
        <div className="tableCover">
          <table>
            <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("from")}</th>
              <th>{t("total")}</th>
              <th>{t("itemsCount")}</th>
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.invoiceNumber}</td>
                <td>{new Date(supplier.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>{supplier.total}</td>
                <td>{supplier.items.length}</td>
                <td className="funcRow">
                  <Link to={`/suppliers/${supplier.supplierId}/${supplier.id}/Details`} className="ingredient-btn py-2 px-3 my-2">{t("details")}</Link>
                  {/* <UpdateSupplierDialog onSuccess={Refresh} model={supplier} /> */}
                  <button className="delete-btn" onClick={() => {handleDelete(supplier.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
