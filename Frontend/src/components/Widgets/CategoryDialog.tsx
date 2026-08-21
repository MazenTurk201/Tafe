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
import { CategoriesApi } from "@/api/categoriesApi";

interface AddCategoryDialogProps {
  onSuccess: () => void;
}

export function AddCategoryDialog({ onSuccess }: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await CategoriesApi.CreateCategory(name);
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
          {t("CategoryCreate")}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Category")}
          </DialogTitle>

          <DialogDescription>
            {t("CategoryAddDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Category")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("CategoryPlaceholder")}
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


interface UpdateCategoryDialogProps {
  id: number;
  onSuccess: () => void;
}

export function UpdateCategoryDialog({
  id,
  onSuccess,
}: UpdateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await CategoriesApi.EditCategory(id, name);
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
            {t("Category")}
          </DialogTitle>

          <DialogDescription>
            {t("CategoryUpdateDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Category")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("CategoryPlaceholder")}
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