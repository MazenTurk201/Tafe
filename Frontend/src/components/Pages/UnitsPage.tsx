import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitsApi } from "@/api/unitsApi";
import type { Unit } from "@/types/unit";
import { useTranslation } from "react-i18next";
import { AddUnitDialog, UpdateUnitDialog} from "@/components/Widgets/UnitDialog";

export default function UnitsPage() {
  const navigate = useNavigate();
  const [units, setUnit] = useState<Unit[]>([]);
  const [delUnits, setDelUnit] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const { t } = useTranslation();

  

  const loadUnits = async () => {
    try {
      setLoading(true);
      const data = await UnitsApi.GetUnits();
      setUnit(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  };
  const loadDeletedUnits = async () => {
    try {
      setLoadingD(true);
      const data = await UnitsApi.GetDeletedUnits();
      setDelUnit(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingD(false);
    }
  };

  const Refresh = async () => {
    await Promise.all([
      loadUnits(),
      loadDeletedUnits(),
    ]);
  }

  useEffect(() => {
    Refresh();
  }, []);

  const handleDelete = async (id: number) => {
    try{
      await UnitsApi.DeleteUnit(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to delete unit");
    }
  }

  const handleRestore = async (id: number) => {
    try{
      await UnitsApi.RestoreUnit(id);
      await Refresh();
    } catch (error){
      console.error(error);
      alert("Failed to restore unit");
    }
  }

  return (
    <main className="w-full h-full px-5 py-8">
    {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("Unit")}
          </h1>

          <p className="mt-1 text-zinc-500">
            {t("UnitSubTitle")}
          </p>
        </div>

        <div className="flex gap-5">
          <AddUnitDialog onSuccess={Refresh}/>
          <button className="Back" title="Back" onClick={()=>{navigate(-1)}}>{">"}</button>
        </div>
      </div>

      {/* Content */}

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          {t("loading")}
        </div>
      ) : units.length === 0 ? (
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
            {units.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td>{unit.id}</td>
                <td>
                  <UpdateUnitDialog id={unit.id} onSuccess={Refresh} />
                  <button className="delete-btn" onClick={() => {handleDelete(unit.id)}}>{t("delete")}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingD ? (
        <></>
      ) : delUnits.length === 0 ? (
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
            {delUnits.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td>{unit.id}</td>
                <td>
                  <button className="restore-btn" onClick={() => {handleRestore(unit.id)}}>{t("restore")}</button>
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