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
import type { ProductEdit, ProductIngredient } from "@/types/product";
import { CategoriesApi } from "@/api/categoriesApi";
import type { Category } from "@/types/category";
import type { Ingredient } from "@/types/ingredient";
import { IngredientsApi } from "@/api/ingredientsApi";


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
                <option value={category.id} key={category.id}>
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
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  // Search
  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Selected ingredient
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    number | ""
  >("");

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Current product ingredients
  const [productIngredients, setProductIngredients] = useState<
    ProductIngredient[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  /**
   * Load current product ingredients
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setProductIngredients(model.Ingredients ?? []);
    
    setSearch("");
    setSelectedIngredientId("");
    setQuantity(1);
  }, [open, model]);

  /**
   * Search ingredients
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const data = await IngredientsApi.SearchIngredients(search);

        setIngredients(data);
      } catch (error) {
        console.error("Failed to search ingredients:", error);
        setIngredients([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, open]);

  /**
   * Add ingredient
   */
  const handleAddIngredient = async () => {
    if (selectedIngredientId === "") {
      return;
    }

    if (quantity <= 0) {
      return;
    }

    const ingredientId = Number(selectedIngredientId);

    // Prevent duplicate ingredient
    const alreadyExists = productIngredients.some(
      (ingredient) => ingredient.id === ingredientId,
    );

    if (alreadyExists) {
      return;
    }

    try {
      setLoading(true);

      await ProductsApi.AddIngredient(
        model.id,
        ingredientId,
        quantity,
      );

      const selectedIngredient = ingredients.find(
        (ingredient) => ingredient.id === ingredientId,
      );

      if (!selectedIngredient) {
        return;
      }

      setProductIngredients((current) => [
        ...current,
        {
          id: selectedIngredient.id,
          name: selectedIngredient.name,
          unit: selectedIngredient.unit.name,
          quantity,
        },
      ]);

      setSelectedIngredientId("");
      setQuantity(1);

      onSuccess();
    } catch (error) {
      console.error("Failed to add ingredient:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove ingredient
   */
  const handleRemoveIngredient = async (ingredientId: number) => {
    try {
      setLoading(true);

      await ProductsApi.RemoveIngredient(
        model.id,
        ingredientId,
      );

      setProductIngredients((current) =>
        current.filter(
          (ingredient) => ingredient.id !== ingredientId,
        ),
      );

      onSuccess();
    } catch (error) {
      console.error("Failed to remove ingredient:", error);
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

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t("Ingredients")} - {model.name}
          </DialogTitle>

          <DialogDescription>
            {t("ProductIngredientDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* ========================= */}
          {/* Search Ingredients */}
          {/* ========================= */}

          <div>
            <label className="mb-2 block font-medium">
              {t("Search")}
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients..."
              className="
                w-full rounded-xl border
                border-zinc-200 bg-white
                px-4 py-2
                outline-none
                focus:border-black
                dark:border-zinc-800
                dark:bg-zinc-900
              "
            />
          </div>

          {/* ========================= */}
          {/* Search Results */}
          {/* ========================= */}

          <div>
            <label className="mb-2 block font-medium">
              {t("Ingredient")}
            </label>

            <select
              value={selectedIngredientId}
              onChange={(e) =>
                setSelectedIngredientId(
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value),
                )
              }
              className="select-auto w-full"
            >
              <option value="">
                {searchLoading
                  ? "Searching..."
                  : "Select ingredient"}
              </option>

              {ingredients.map((ingredient) => {
                const alreadyAdded = productIngredients.some(
                  (item) => item.id === ingredient.id,
                );

                return (
                  <option
                    key={ingredient.id}
                    value={ingredient.id}
                    disabled={alreadyAdded}
                  >
                    {ingredient.name}
                    {ingredient.unit?.name
                      ? ` (${ingredient.unit.name})`
                      : ""}
                    {alreadyAdded ? " - Added" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* ========================= */}
          {/* Quantity + Add */}
          {/* ========================= */}

          <div className="flex flex-col gap-3 md:flex-row md:items-end">

            <div className="flex-1">
              <label className="mb-2 block font-medium">
                {t("Quantity")}
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                className="
                  w-full rounded-xl border
                  border-zinc-200 bg-white
                  px-4 py-2
                  outline-none
                  focus:border-black
                  dark:border-zinc-800
                  dark:bg-zinc-900
                "
              />
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              disabled={
                loading ||
                selectedIngredientId === "" ||
                quantity <= 0
              }
              className="
                rounded-xl
                px-5 py-2
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? t("loading") : t("Add")}
            </button>

          </div>

          {/* ========================= */}
          {/* Current Ingredients */}
          {/* ========================= */}

          <div>
            <h3 className="mb-3 text-lg font-semibold">
              {t("Ingredients")}
            </h3>

            {productIngredients.length === 0 ? (
              <div
                className="
                  rounded-xl border
                  border-dashed
                  border-zinc-300
                  p-6 text-center
                  text-zinc-500
                  dark:border-zinc-700
                "
              >
                No ingredients added.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-4 py-3 text-left">
                        {t("Ingredient")}
                      </th>

                      <th className="px-4 py-3 text-left">
                        {t("Quantity")}
                      </th>

                      <th className="px-4 py-3 text-left">
                        {t("Unit")}
                      </th>

                      <th className="px-4 py-3 text-right">
                        {t("Delete")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {productIngredients.map((ingredient) => (
                      <tr
                        key={ingredient.id}
                        className="
                          border-b
                          border-zinc-100
                          last:border-b-0
                          dark:border-zinc-800
                        "
                      >
                        <td className="px-4 py-3">
                          {ingredient.name}
                        </td>

                        <td className="px-4 py-3">
                          {ingredient.quantity}
                        </td>

                        <td className="px-4 py-3">
                          {ingredient.unit}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              handleRemoveIngredient(
                                ingredient.id,
                              )
                            }
                            className="
                              rounded-lg
                              px-3 py-1
                              text-red-600
                              hover:bg-red-50
                              disabled:opacity-50
                              dark:hover:bg-red-950
                            "
                          >
                            {t("Delete")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}
          </div>

        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
          >
            {t("Close")}
          </button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}