import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SuppliersApi } from "@/api/suppliersApi";
import type { PurchaseInvoices } from "@/types/supplier";
import { useTranslation } from "react-i18next";
import { AddSupplierDialog} from "@/components/Widgets/SupplierDialog";

interface InvoicesBySuppliersPageProps {
  id: number;
}

export default function InvoicesBySuppliersPage({id} : InvoicesBySuppliersPageProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<PurchaseInvoices[]>([]);
  const [loading, setLoading] = useState(true);
//   const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  const loadSuppliers = async () => {
    try {
      const data = await SuppliersApi.GetPurchaseInvoicesBySupplier(id);
      setInvoices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

//   const loadDeletedSuppliers = async () => {
//     try {
//       const data = await SuppliersApi.();
//       setDelSupplier(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoadingD(false);
//     }
//   };

  const Refresh = async () => {
    await Promise.all([
      loadSuppliers(),
    //   loadDeletedSuppliers(),
    ]);
  };

//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       try {
//         // const [data, deletedData] = await Promise.all([
//         const [data] = await Promise.all([
//           SuppliersApi.GetSuppliers(),
//         //   SuppliersApi.GetDeletedSuppliers(),
//         ]);

//         if (!ignore) {
//           setSupplier(data);
//         //   setDelSupplier(deletedData);
//         }
//       } catch (error) {
//         console.error(error);
//       } finally {
//         if (!ignore) {
//           setLoading(false);
//           setLoadingD(false);
//         }
//       }
//     })();

//     return () => {
//       ignore = true;
//     };
//   }, []);

  useEffect(()=>{
    Refresh();
  },[]);

  const handleDelete = async (id: number) => {
    try{
      await SuppliersApi.DeletePurchaseInvoices(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete supplier");
    }
  }

//   const handleRestore = async (id: number) => {
//     try{
//       await SuppliersApi.RestoreSupplier(id);
//       await Refresh();
//     } catch (error){
//       console.error(error);
//       alert("Failed to restore supplier");
//     }
//   }

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
          <AddSupplierDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : invoices.length === 0 ? (
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
              <th>{t("id")}</th>
              <th>{t("invoiceNumber")}</th>
              <th>{t("supplierId")}</th>
              <th>{t("supplierName")}</th>
              <th>{t("total")}</th>
              <th>{t("createdAt")}</th>
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.supplierId}</td>
                <td>{invoice.supplierName}</td>
                <td>{invoice.total}</td>
                <td>{invoice.createdAt}</td>
                <td>
                  <Link to={`/invoices/${invoice.id}`} className="ingredient-btn">{t("transactions")}</Link>
                  <button className="delete-btn" onClick={() => {handleDelete(invoice.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {/* {loadingD ? (
        <></>
      ) : delSuppliers.length === 0 ? (
        <></>
      ) : (
        <details>
      <summary>{t("openDelted")}</summary>
        <div className="tableCover">
          <table>
            <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("phone")}</th>
              <th>{t("email")}</th>
              <th>{t("address")}</th>
              <th>{t("func")}</th>
            </tr>
            </thead>
            <tbody>
            {delSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(supplier.id)}}>{t("restore")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        </details>
      )} */}
    </main>
  );
}
