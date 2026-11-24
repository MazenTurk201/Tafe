import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SuppliersApi } from "@/api/suppliersApi";
import { useTranslation } from "react-i18next";
import type { PurchaseInvoicesBySupplierItems } from "@/types/supplier";
import { ReceiptApi } from "@/api/receiptApi";
import { getUsernameFromToken } from "@/components/Utilties/UserNameFromToken";
import type { ReceiptData } from "@/types/receipt";

export default function SuppliersPageEnvoiceDetails() {
  const { id } = useParams();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSupplier] = useState<PurchaseInvoicesBySupplierItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // const loadSuppliers = async () => {
  //   try {
  //     const data = await SuppliersApi.GetPurchaseInvoicesBySupplierItems(id ? parseInt(id) : 0, itemId ? parseInt(itemId) : 0);
  //     setSupplier(data);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await SuppliersApi.GetPurchaseInvoicesBySupplierItems(id ? parseInt(id) : 0, itemId ? parseInt(itemId) : 0);

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

  const receiptData = {
  cashierName: getUsernameFromToken()?.toString() ?? "Unknown",
  customerName: "Walk-in Customer",
  discount: 0,
  invoiceNumber: "INV-001",
  issuedAt: new Date().toISOString(),
  orderType: "Dine-in",
  paymentMethod: "Cash",
  tableNumber: "5",
  taxRate: 10,
  items: suppliers.map((supplier) => ({
    name: supplier.ingredientName,
    quantity: supplier.quantity,
    unitPrice: supplier.unitPrice
  }))
};

const downloadReceipt = async (data: ReceiptData) => {
  try {
    const pdfBlob = await ReceiptApi.GetReceipt(data);

    const url = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.invoiceNumber}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Receipt download failed:", error);
  }
};

  // const handleDelete = async (id: number) => {
  //   try{
  //     await SuppliersApi.DeleteSupplier(id);
  //     await loadSuppliers();
  //   } catch (error){
  //     console.error(error);
  //     alert("Failed to delete supplier");
  //   }
  // }

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
          <button onClick={() => downloadReceipt(receiptData)}>
            {t("DownloadPDF")}
          </button>
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
  

  {/*
  <button onClick={async () => {
    try {
      await ReceiptApi.PrintReceipt(receiptData);
      console.log("Print job submitted successfully");
    } catch (error) {
      console.error("Printing failed:", error);
    }
  }}>
    Print Receipt
  </button> */}
          <table>
            <thead>
            <tr>
              <th>{t("id")}</th>
              <th>{t("name")}</th>
              <th>{t("quantity")}</th>
              <th>{t("unitPrice")}</th>
              <th>{t("total")}</th>
              {/* <th>{t("funcs")}</th> */}
            </tr>
            </thead>
            <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.ingredientId}</td>
                <td>{supplier.ingredientName}</td>
                <td>{supplier.quantity}</td>
                <td>{supplier.unitPrice}</td>
                <td>{supplier.total}</td>
                {/* <td className="funcRow">
                  <button className="delete-btn" onClick={() => {handleDelete(supplier.id)}}>{t("delete")}</button>
                </td> */}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
