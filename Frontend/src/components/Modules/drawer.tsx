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
    document.body.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLang = idArabic ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);

    // تأكيد يدوي برضه عشان تضمن إنها اتحفظت في المتصفح
    localStorage.setItem('i18nextLng', nextLang);
    document.body.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    setIsOpen(false)
  };

  interface ItemDrawerProps {
  path: string;
  icon: string;
  name: string;
}

function ItemDrawer({ path, icon, name }: ItemDrawerProps) {
  return (
    <li className="py-2">
      <Link to={path} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <img 
          src={`/svg/${icon}.svg`} 
          alt={`${name} icon`} 
          width={35} 
          height={35} 
        />
        <span>{name}</span>
      </Link>
    </li>
  );
}


  const { isAuthenticated, logout, hasRole } = useAuth();

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
            <ItemDrawer path="/" icon="main" name={t("Main")} />
            <ItemDrawer path="/menu" icon="menu" name={t("menu")} />
            <ItemDrawer path="/orders" icon="orders" name={t("Orders")} />
            <ItemDrawer path="/profile" icon="profile" name={t("profile")} />
            <ItemDrawer path="/units" icon="units" name={t("Units")} />
            <ItemDrawer path="/categories" icon="category" name={t("Categories")} />
            <ItemDrawer path="/ingredients" icon="integrity" name={t("Ingredients")} />
            <ItemDrawer path="/products" icon="products" name={t("Products")} />
            <ItemDrawer path="/expenses" icon="money_bag" name={t("Expenses")} />


            {isAuthenticated && (hasRole("Admin") || hasRole("Manager")) && (
              <>
                <ItemDrawer path="/suppliers" icon="suppliers" name={t("Suppliers")} />
              </>
            )}
            {isAuthenticated && hasRole("Admin") && (
              <>
                <ItemDrawer path="/employees" icon="emplyee" name={t("Employees")} />
              </>
            )}
          </ul>
          <div className="flex w-full justify-evenly mt-auto" dir="rtl">
            <img onClick={toggleLanguage} className="drawericons outlineButton"
              src={'/svg/translate.svg'}
              alt={"icon"} 
              width={10} 
              height={10} 
            />
            {/* <button onClick={toggleLanguage} className="drawericons outlineButton">
              {idArabic ? 'En' : 'ع'}
            </button> */}
            <img onClick={() => { toggleTheme(); setIsOpen(false); }} className="drawericons outlineButton"
              src={
                theme === 'dark' ? '/svg/light_mode.svg' : `/svg/dark_mode.svg`
              } 
              alt={"icon"} 
              width={10} 
              height={10} 
            />
            {/* <button onClick={() => { toggleTheme(); setIsOpen(false); }} className="drawericons outlineButton">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button> */}
            {isAuthenticated && ( <img onClick={logout} className="drawericons outlineButton"
              src={'/svg/logout.svg'}
              alt={"icon"} 
              width={10} 
              height={10} 
            /> )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDrawer;