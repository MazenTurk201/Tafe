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
import { IngredientsApi } from "@/api/ingredientsApi";

interface AddIngredientDialogProps {
  onSuccess: () => void;
}

export function AddIngredientDialog({ onSuccess }: AddIngredientDialogProps) {
  const [name, setName] = useState("");
  const [minQuantityAlert, setMinQuantityAlert] = useState(0);
  const [unitId, setUnitId] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await IngredientsApi.CreateIngredient({
        name, minQuantityAlert, unitId
      });
      onSuccess();
      setName("");
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
          {t("IngredientCreate")}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Ingredient")}
          </DialogTitle>

          <DialogDescription>
            {t("IngredientAddDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Ingredient")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("IngredientPlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />
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


interface UpdateIngredientDialogProps {
  id: number;
  onSuccess: () => void;
}

export function UpdateIngredientDialog({
  id,
  onSuccess,
}: UpdateIngredientDialogProps) {
  const [name, setName] = useState("");
  const [minQuantityAlert, setMinQuantityAlert] = useState(0);
  const [unitId, setUnitId] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await IngredientsApi.EditIngredient({
        id,
        name,
        minQuantityAlert,
        unitId
      });
      onSuccess();
      setName("");
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
            {t("Ingredient")}
          </DialogTitle>

          <DialogDescription>
            {t("IngredientUpdateDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Ingredient")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("IngredientPlaceholder")}
            className="w-full rounded-md border px-3 py-2"
          />
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