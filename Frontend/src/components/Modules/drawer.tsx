import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../Utilties/changeMode';
import { useAuth } from "@/context/AuthContext";

const SidebarDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const { t, i18n } = useTranslation();

  const idArabic = i18n.language.startsWith('ar');

  // للتأكيد إن الاتجاه مظبوط مع أي تغيير للغة
  useEffect(() => {
    document.body.dir = idArabic ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLang = idArabic ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);

    // تأكيد يدوي برضه عشان تضمن إنها اتحفظت في المتصفح
    localStorage.setItem('i18nextLng', nextLang);
    document.body.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    setIsOpen(false)
  };

  function ItemDrawer(path: string, name: string) {
    return (
      <li className="py-2">
        <Link to={path} className="" onClick={() => setIsOpen(false)}>
          {name}
        </Link>
      </li>
    );
  }

  const { isAuthenticated, logout, } = useAuth();


  return (
    <div className="relative">
      {/* الزرار اللي بيفتح ويقفل  */}
      {/* sm:hidden */}
      <i onClick={() => setIsOpen(!isOpen)} className="menuiconbutton bi bi-list"></i>

      {/* الـ Overlay اللي بيقفل لما تدوس عليه */}
      {isOpen && (
        <div
          className="fixed inset-0 blur-md bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* الـ Drawer نفسه */}
      <div className={`fixed top-0 right-0 h-dvh z-20 w-64 bg-gray-200 dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 pt-20 h-full flex flex-col text-gray-900 dark:text-gray-100">
          <h2 className="text-3xl font-bold relative -top-15 -left-10">{t("welcome")}</h2>
          <ul className="-mt-10">
            {ItemDrawer("/", "Main")}
            {ItemDrawer("/orders", "Orders")}
            {ItemDrawer("/units", "Units")}
            {ItemDrawer("/categories", "Categories")}
          </ul>
          <div className="flex w-full justify-evenly mt-auto" dir="rtl">
            <button onClick={toggleLanguage} className="drawericons outlineButton">
              {idArabic ? 'En' : 'ع'}
            </button>
            <button onClick={() => { toggleTheme(); setIsOpen(false); }} className="drawericons outlineButton">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuthenticated && ( <button onClick={logout} className="rounded-lg bg-red-500 px-4 py-2 text-white" > Logout </button> )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDrawer;