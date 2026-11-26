import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuApi } from "@/api/menuApi";
import { getApiError } from "@/lib/api-error";
import type { MenuCategory, MenuItem } from "@/types/menu";

const MAX_INGREDIENTS = 5;

export default function MenuPage() {
  const { t, i18n } = useTranslation();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const isArabic = i18n.language.startsWith("ar");

  useEffect(() => {
    document.body.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await MenuApi.GetMenu();
      setCategories(data);

      const formattedProducts: MenuItem[] = data.flatMap((category) =>
        category.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category: { id: category.id, name: category.name },
          ingredients: product.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            unit: ingredient.unit,
            quantity: ingredient.quantity,
          })),
        }))
      );

      setMenuItems(formattedProducts);
    } catch (err) {
      console.error(err);
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter(
      (item) =>
        (activeCategory === "all" || item.category.id === activeCategory) &&
        (!q || item.name.toLowerCase().includes(q))
    );
  }, [menuItems, activeCategory, search]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
      active
        ? "bg-linear-to-br from-[#C58B4E] to-[#B5573A] text-white shadow-lg shadow-[#B5573A]/25"
        : "border border-stone-200 bg-white text-stone-700 hover:border-[#C58B4E] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#C58B4E]"
    }`;

  const countBadge = (active: boolean) =>
    `rounded-full px-2 py-0.5 text-xs ${
      active ? "bg-white/25" : "bg-stone-100 dark:bg-stone-800"
    }`;

  return (
    <main className="min-h-screen w-full px-4 py-12 pt-24 text-stone-900 md:pt-32 dark:text-stone-100">
      {/* Header */}
      <div className="mx-auto mb-10 max-w-6xl text-center">
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">
          {t("menu", "Our Menu")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-stone-500 dark:text-stone-400">
          {t(
            "menuSubtitle",
            "Discover our delicious dishes made with fresh ingredients"
          )}
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 inset-s-4 flex items-center text-stone-400">
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchMenu", "Search the menu...")}
            className="w-full rounded-full border border-stone-300 bg-white py-3 pe-4 ps-11 outline-none transition focus:border-[#C58B4E] focus:ring-2 focus:ring-[#C58B4E]/30 dark:border-stone-700 dark:bg-stone-900"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mx-auto mb-10 max-w-6xl">
        <div
          className="flex flex-wrap justify-center gap-3"
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={tabClass(activeCategory === "all")}
          >
            {t("allCategories", "All")}
            <span className={countBadge(activeCategory === "all")}>
              {menuItems.length}
            </span>
          </button>

          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={tabClass(active)}
              >
                {cat.name}
                <span className={countBadge(active)}>
                  {cat.products.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items */}
      <div className="mx-auto max-w-6xl">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="h-48 bg-stone-200 dark:bg-stone-800" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-5 w-24 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-lg text-red-500">{error}</p>
            <button
              onClick={fetchMenuData}
              className="mt-4 rounded-xl bg-linear-to-br from-[#C58B4E] to-[#B5573A] px-6 py-2 font-medium text-white shadow-sm transition hover:shadow-md active:scale-95"
            >
              {t("retry", "Retry")}
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">☕</div>
            <h2 className="mb-2 text-2xl font-bold">
              {t("noItemsInCategory", "No items found")}
            </h2>
            <p className="text-stone-500 dark:text-stone-400">
              {t(
                "noItemsDescription",
                "Check back later or try another category"
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900"
              >
                {/* Image placeholder */}
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-[#C58B4E]/20 to-[#B5573A]/20">
                  <div className="text-6xl opacity-60 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    ☕
                  </div>
                  <span className="absolute inset-e-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#B5573A] backdrop-blur-sm dark:bg-stone-900/90 dark:text-[#C58B4E]">
                    {item.category.name}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="flex-1 text-xl font-bold">{item.name}</h3>
                    <span className="whitespace-nowrap text-2xl font-bold text-[#B5573A] dark:text-[#C58B4E]">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {item.ingredients && item.ingredients.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                        {t("ingredients", "Ingredients")}
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {item.ingredients.slice(0, MAX_INGREDIENTS).map((ing) => (
                          <li
                            key={ing.id}
                            title={`${ing.quantity} ${ing.unit}`}
                            className="rounded-lg bg-stone-100 px-2.5 py-1 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                          >
                            {ing.name}
                          </li>
                        ))}
                        {item.ingredients.length > MAX_INGREDIENTS && (
                          <li className="rounded-lg bg-[#C58B4E]/15 px-2.5 py-1 text-sm text-[#B5573A] dark:text-[#C58B4E]">
                            +{item.ingredients.length - MAX_INGREDIENTS}{" "}
                            {t("more", "more")}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}