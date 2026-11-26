import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../Utilties/changeMode";
import { useAuth } from "@/context/AuthContext";

interface ItemDrawerProps {
  path: string;
  icon: string;
  name: string;
  onClick: () => void;
}

function ItemDrawer({ path, icon, name, onClick }: ItemDrawerProps) {
  return (
    <li>
      <NavLink
        to={path}
        end={path === "/"}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-200 ${
            isActive
              ? "bg-gray-300 font-semibold dark:bg-gray-700"
              : "hover:bg-gray-300/60 dark:hover:bg-gray-800"
          }`
        }
      >
        <img
          src={`/svg/${icon}.svg`}
          alt={`${name} icon`}
          width={30}
          height={30}
        />
        <span>{name}</span>
      </NavLink>
    </li>
  );
}

const SidebarDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout, hasRole } = useAuth();

  const isArabic = i18n.language.startsWith("ar");
  const close = () => setIsOpen(false);

  // تظبيط الاتجاه مع أي تغيير للغة
  useEffect(() => {
    document.body.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  // قفل الدروير بزرار Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const toggleLanguage = () => {
    const nextLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("i18nextLng", nextLang);
    document.body.dir = nextLang === "ar" ? "rtl" : "ltr";
    close();
  };

  const footerBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-gray-300 transition hover:scale-105 hover:bg-gray-400/70 active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700";

  return (
    <div className="relative">
      {/* زرار الفتح */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="menuiconbutton"
      >
        <img src="/svg/options.svg" alt="" width={35} height={35} />
      </button>

      {/* الـ Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-10 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* الدروير */}
      <aside
        className={`fixed top-0 z-20 h-dvh w-72 bg-gray-100 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isArabic ? "right-0" : "left-0"
        } ${
          isOpen
            ? "translate-x-0"
            : isArabic
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col text-gray-900 dark:text-gray-100">
          {/* الهيدر */}
          <div className="flex items-center justify-between border-b border-gray-300 px-5 py-5 dark:border-gray-700">
            <h2 className="text-2xl font-bold">{t("welcome")}</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {/* الأيتمز */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              <ItemDrawer path="/" icon="main" name={t("Main")} onClick={close} />
              <ItemDrawer path="/menu" icon="menu" name={t("menu")} onClick={close} />
              <ItemDrawer path="/orders" icon="orders" name={t("Orders")} onClick={close} />
              <ItemDrawer path="/profile" icon="profile" name={t("profile")} onClick={close} />
              <ItemDrawer path="/units" icon="units" name={t("Units")} onClick={close} />
              <ItemDrawer path="/categories" icon="category" name={t("Categories")} onClick={close} />
              <ItemDrawer path="/ingredients" icon="integrity" name={t("Ingredients")} onClick={close} />
              <ItemDrawer path="/products" icon="products" name={t("Products")} onClick={close} />
              <ItemDrawer path="/expenses" icon="money_bag" name={t("Expenses")} onClick={close} />

              {isAuthenticated && (hasRole("Admin") || hasRole("Manager")) && (
                <ItemDrawer path="/suppliers" icon="suppliers" name={t("Suppliers")} onClick={close} />
              )}
              {isAuthenticated && hasRole("Admin") && (
                <ItemDrawer path="/employees" icon="emplyee" name={t("Employees")} onClick={close} />
              )}
            </ul>
          </nav>

          {/* الفوتر */}
          <div
            className="flex items-center justify-evenly border-t border-gray-300 px-4 py-4 dark:border-gray-700"
            dir="rtl"
          >
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Change language"
              className={footerBtn}
            >
              <img src="/svg/translate.svg" alt="" width={24} height={24} />
            </button>

            <button
              type="button"
              onClick={() => {
                toggleTheme();
                close();
              }}
              aria-label="Toggle theme"
              className={footerBtn}
            >
              <img
                src={theme === "dark" ? "/svg/light_mode.svg" : "/svg/dark_mode.svg"}
                alt=""
                width={24}
                height={24}
              />
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                aria-label="Logout"
                className={footerBtn}
              >
                <img src="/svg/logout.svg" alt="" width={24} height={24} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SidebarDrawer;