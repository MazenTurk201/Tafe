import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IngredientsApi } from "@/api/ingredientsApi";
import type { Ingredient } from "@/types/ingredient";
import { useTranslation } from "react-i18next";
import { AddIngredientDialog, UpdateIngredientDialog} from "@/components/Widgets/IngredientDialog";

export default function IngredientsPage() {
  const navigate = useNavigate();
  const [ingredients, setIngredient] = useState<Ingredient[]>([]);
  const [delIngredients, setDelIngredient] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await IngredientsApi.GetIngredients();
      setIngredient(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  };
  const loadDeletedIngredients = async () => {
    try {
      setLoadingD(true);
      const data = await IngredientsApi.GetDeletedIngredients();
      setDelIngredient(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadIngredients(),
      loadDeletedIngredients(),
    ]);
  }

  useEffect(() => {
    Refresh();
  }, []);

  const handleDelete = async (id: number) => {
    try{
      await IngredientsApi.DeleteIngredient(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete ingredient");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await IngredientsApi.RestoreIngredient(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore ingredient");
    }
  }

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("Ingredient")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("IngredientSubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddIngredientDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : ingredients.length === 0 ? (
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
              <th>{t("Unit")}</th>
              <th>{t("quantity")}</th>
              <th>{t("minQuantityAlert")}</th>
              <th>{t("funcs")}</th>
            </tr>
            </thead>
            <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td>{ingredient.id}</td>
                <td>{ingredient.unit.name} Id: ({ingredient.unit.id})</td>
                <td>{ingredient.quantity}</td>
                <td>{ingredient.minQuantityAlert}</td>
                <td>
                  <UpdateIngredientDialog id={ingredient.id} onSuccess={Refresh} model={{minQuantityAlert: ingredient.minQuantityAlert, name: ingredient.name, unitId: ingredient.unit.id}}/>
                  <button className="delete-btn" onClick={() => {handleDelete(ingredient.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingD ? (
        <></>
      ) : delIngredients.length === 0 ? (
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
            {delIngredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td>{ingredient.id}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(ingredient.id)}}>{t("restore")}</button>
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