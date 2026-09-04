import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SuppliersApi } from "@/api/suppliersApi";
import type { Supplier } from "@/types/supplier";
import { useTranslation } from "react-i18next";
import { AddSupplierDialog, UpdateSupplierDialog} from "@/components/Widgets/SupplierDialog";

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSupplier] = useState<Supplier[]>([]);
  const [delSuppliers, setDelSupplier] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  const loadSuppliers = async () => {
    try {
      const data = await SuppliersApi.GetSuppliers();
      setSupplier(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedSuppliers = async () => {
    try {
      const data = await SuppliersApi.GetDeletedSuppliers();
      setDelSupplier(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadSuppliers(),
      loadDeletedSuppliers(),
    ]);
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [data, deletedData] = await Promise.all([
          SuppliersApi.GetSuppliers(),
          SuppliersApi.GetDeletedSuppliers(),
        ]);

        if (!ignore) {
          setSupplier(data);
          setDelSupplier(deletedData);
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

  const handleDelete = async (id: number) => {
    try{
      await SuppliersApi.DeleteSupplier(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete supplier");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await SuppliersApi.RestoreSupplier(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore supplier");
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
          <AddSupplierDialog onSuccess={Refresh}/>
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
              <th>{t("phone")}</th>
              <th>{t("email")}</th>
              <th>{t("address")}</th>
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td><a href={`http://wa.me/${supplier.phone}`} target="_blank" rel="noopener noreferrer">{supplier.phone}</a></td>
                <td><a href={`mailto:${supplier.email}`} target="_blank" rel="noopener noreferrer">{supplier.email}</a></td>
                <td>{supplier.address}</td>
                <td>
                  <Link to={`/suppliers/${supplier.id}`} className="ingredient-btn">{t("transactions")}</Link>
                  <UpdateSupplierDialog onSuccess={Refresh} model={supplier} />
                  <button className="delete-btn" onClick={() => {handleDelete(supplier.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingD ? (
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
      )}
    </main>
  );
}
