import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductsApi } from "@/api/productsApi";
import type { Product } from "@/types/product";
import { useTranslation } from "react-i18next";
import { AddProductDialog, IngredientProductDialog, UpdateProductDialog} from "@/components/Widgets/ProductDialog";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProduct] = useState<Product[]>([]);
  const [delProducts, setDelProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  const loadProducts = async () => {
    try {
      const data = await ProductsApi.GetProducts();
      setProduct(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedProducts = async () => {
    try {
      const data = await ProductsApi.GetDeletedProducts();
      setDelProduct(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadProducts(),
      loadDeletedProducts(),
    ]);
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [data, deletedData] = await Promise.all([
          ProductsApi.GetProducts(),
          ProductsApi.GetDeletedProducts(),
        ]);

        if (!ignore) {
          setProduct(data);
          setDelProduct(deletedData);
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
      await ProductsApi.DeleteProduct(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete product");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await ProductsApi.RestoreProduct(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore product");
    }
  }

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("Product")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("ProductSubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddProductDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : products.length === 0 ? (
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
              <th>{t("id")}</th>
              <th>{t("price")}</th>
              <th>{t("Category")}</th>
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.id}</td>
                <td>{product.price} $</td>
                <td>{product.category.name}</td>
                <td>
                  <UpdateProductDialog onSuccess={Refresh} model={ { id: product.id, name:  product.name, price: product.price, CategoryId: product.category.id } }  />
                  <IngredientProductDialog onSuccess={Refresh} model={ { id: product.id, name:  product.name, price: product.price, CategoryId: product.category.id } }  />
                  <button className="delete-btn" onClick={() => {handleDelete(product.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingD ? (
        <></>
      ) : delProducts.length === 0 ? (
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
              <th>{t("func")}</th>
            </tr>
            </thead>
            <tbody>
            {delProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.id}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(product.id)}}>{t("restore")}</button>
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