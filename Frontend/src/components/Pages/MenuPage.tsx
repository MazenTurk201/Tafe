import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuApi } from "@/api/menuApi";
import type { MenuCategory, MenuItem } from "@/types/menu";

export default function MenuPage() {
  const { t, i18n } = useTranslation();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  useEffect(() => {
    document.body.dir = i18n.language.startsWith("ar") ? "rtl" : "ltr";
  }, [i18n.language]);

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
        category: {
          id: category.id,
          name: category.name,
        },
        ingredients: product.ingredients.map((ingredient) => ({
          id: ingredient.ingredientId,
          name: ingredient.name,
          unit: ingredient.unit,
          quantity: ingredient.quantity,
        })),
      }))
    );

    setMenuItems(formattedProducts);
  } catch (err) {
    console.error(err);
    setError("Failed to load menu");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchMenuData();
}, []);

  const filteredItems = activeCategory === "all"
    ? menuItems
    : menuItems.filter((item) => item.category.id === activeCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <main className="w-full min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t("menu") || "Our Menu"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t("menuSubtitle") || "Discover our delicious dishes made with fresh ingredients"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-wrap gap-3 justify-center" role="tablist">
          <button
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === "all"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500"
            }`}
          >
            {t("allCategories") || "All"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.name}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.name
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-zinc-700 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-2" />
                <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={fetchMenuData}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t("retry") || "Retry"}
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("noItemsInCategory") || "No items in this category"}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">
              {t("noItemsDescription") || "Check back later or try another category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-zinc-800"
              >
                {/* Item Image Placeholder */}
                <div className="relative h-48 bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center overflow-hidden">
                  <div className="text-6xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    🍽️
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-purple-600 dark:text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {item.category.name}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 pr-4">
                      {item.name}
                    </h3>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Ingredients */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        {t("ingredients") || "Ingredients"}
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {item.ingredients.slice(0, 5).map((ing) => (
                          <li
                            key={ing.id}
                            className="text-sm text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded"
                          >
                            {ing.name}
                          </li>
                        ))}
                        {item.ingredients.length > 5 && (
                          <li className="text-sm text-gray-500 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded">
                            +{item.ingredients.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Order Button */}
                  <button
                    className="w-full py-2.5 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all disabled:opacity-50"
                    disabled
                  >
                    {t("addToOrder") || "Add to Order"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}