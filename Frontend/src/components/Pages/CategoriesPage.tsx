import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoriesApi } from "@/api/categoriesApi";
import type { Category } from "@/types/category";
import { useTranslation } from "react-i18next";
import { AddCategoryDialog, UpdateCategoryDialog} from "@/components/Widgets/CategoryDialog";


export default function CategoriesPage() {
  const navigate = useNavigate();
  const [Categories, setCategory] = useState<Category[]>([]);
  const [delCategories, setDelCategory] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoriesApi.GetCategories();
      setCategory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  };
  const loadDeletedCategories = async () => {
    try {
      setLoadingD(true);
      const data = await CategoriesApi.GetDeletedCategories();
      setDelCategory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadCategories(),
      loadDeletedCategories(),
    ]);
  }

  useEffect(() => {
    Refresh();
  }, []);

  const handleDelete = async (id: number) => {
    try{
      await CategoriesApi.DeleteCategory(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete category");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await CategoriesApi.RestoreCategory(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore category");
    }
  }

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("CategorySubTitle")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("CategorySubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddCategoryDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : Categories.length === 0 ? (
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
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {Categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.id}</td>
                <td>
                  <UpdateCategoryDialog id={category.id} onSuccess={Refresh} />
                  <button className="delete-btn" onClick={() => {handleDelete(category.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingD ? (
        <></>
      ) : delCategories.length === 0 ? (
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
            {delCategories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.id}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(category.id)}}>{t("restore")}</button>
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