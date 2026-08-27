import { useEffect, useState } from "react";
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
import { ProductsApi } from "@/api/productsApi";
import type { ProductEdit } from "@/types/product";
import { CategoriesApi } from "@/api/categoriesApi";
import type { Category } from "@/types/category";

interface AddProductDialogProps {
  onSuccess: () => void;
}

export function AddProductDialog({ onSuccess }: AddProductDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategory] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await CategoriesApi.GetCategories();
        setCategory(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategory();
    }, []);

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await ProductsApi.CreateProduct({
        name, price, CategoryId: categoryId
      });
      onSuccess();
      setName("");
      setPrice(0);
      setCategoryId("");
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
          {t("ProductCreate")}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Product")}
          </DialogTitle>

          <DialogDescription>
            {t("ProductAddDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("name")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ProductPlaceholderName")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("price")}
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder={t("ProductPlaceholderMinQA")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("Product")}
          </label>

          <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="select-auto" required>
            <option selected>{t("ProductPlaceholderSelect")}</option>
            {
              categories.map((category) => (
                <option value={category.id}>
                {category.name}
                </option>
              ))
            }
          </select>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || categoryId === ""}
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


interface UpdateProductDialogProps {
  model: ProductEdit;
  onSuccess: () => void;
}

export function UpdateProductDialog({
  model,
  onSuccess,
}: UpdateProductDialogProps) {
  const [name, setName] = useState(model.name);
  const [price, setPrice] = useState(model.price);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<number | "">(model.CategoryId);
  const [categories, setCategory] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await CategoriesApi.GetCategories();
        console.log("Products:", data);
        setCategory(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategory();
    }, []);

  useEffect(() => {
    setName(model.name);
    setPrice(model.price);
    setCategoryId(model.CategoryId);
  }, [model]);


  const handleSubmit = async () => {

    if (!name.trim() || categoryId === "") {
      return;
    }

    try {
      setLoading(true);
      await ProductsApi.EditProduct({
        id: model.id,
        name: name.trim(),
        price,
        CategoryId: categoryId
      });
      onSuccess();

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
            {t("Product")}
          </DialogTitle>

          <DialogDescription>
            {t("ProductUpdateDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Product")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ProductPlaceholderName")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("price")}
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder={t("ProductPlaceholderMinQA")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("Product")}
          </label>

          <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="select-auto">
            {
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                {category.name}
                </option>
              ))
            }
          </select>
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


interface IngredientProductDialogProps {
  model: ProductEdit;
  onSuccess: () => void;
}

export function IngredientProductDialog({
  model,
  onSuccess,
}: IngredientProductDialogProps) {
  const [name, setName] = useState(model.name);
  const [price, setPrice] = useState(model.price);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<number | "">(model.CategoryId);
  const [categories, setCategory] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await CategoriesApi.GetCategories();
        console.log("Products:", data);
        setCategory(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategory();
    }, []);

  useEffect(() => {
    setName(model.name);
    setPrice(model.price);
    setCategoryId(model.CategoryId);
  }, [model]);


  const handleSubmit = async () => {

    if (!name.trim() || categoryId === "") {
      return;
    }

    try {
      setLoading(true);
      await ProductsApi.EditProduct({
        id: model.id,
        name: name.trim(),
        price,
        CategoryId: categoryId
      });
      onSuccess();

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
        <button className="ingredient-btn">
          {t("Ingredients")}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Product")}
          </DialogTitle>

          <DialogDescription>
            {t("ProductIngredientDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("Product")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ProductPlaceholderName")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("price")}
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder={t("ProductPlaceholderMinQA")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block">
            {t("Product")}
          </label>

          <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="select-auto">
            {
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                {category.name}
                </option>
              ))
            }
          </select>
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