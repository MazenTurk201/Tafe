import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { routes } from "./components/Data/routesWebsite";
import NavBar from './components/Modules/navBar';
import Footer from './components/Modules/footerWedgit';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { getUsernameFromToken } from './components/Utilties/UserNameFromToken';
import FullscreenToggle from '@/components/Utilties/ToggleFullScreen';
import { useTheme } from './components/Utilties/changeMode';
import { useTranslation } from 'react-i18next';

type ContextMenuPosition = { x: number; y: number; };


function MainLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { toggleTheme } = useTheme();
  
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
    };

  const [contextMenu, setContextMenu] =
    useState<ContextMenuPosition | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const closeMenu = () => {
      setContextMenu(null);
    };

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  // فتح القائمة عند Right Click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // تعديل مكان القائمة تلقائيًا لو قربت من حواف الشاشة
  useEffect(() => {
    if (!contextMenu || !menuRef.current) return;

    const menu = menuRef.current;

    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    const padding = 8;

    let x = contextMenu.x;
    let y = contextMenu.y;

    // اليمين
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }

    // الأسفل
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    // الشمال
    x = Math.max(padding, x);

    // الأعلى
    y = Math.max(padding, y);

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [contextMenu]);

  return (
    <div
      className="flex min-h-dvh h-full flex-col items-center font-sans"
      onContextMenu={handleContextMenu}
    >
      <NavBar />

      <br />

      <main className="w-full h-full flex-1">
        <Outlet />
      </main>

      <Footer />

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-9999 w-64 rounded-xl p-1 bg-(--card) shadow-xl ring-1 ring-black/10"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* User Info */}
          <div className="px-3 py-2 flex flex-col items-start gap-1 justify-start">
            <p className="text-sm text-start">
              {t('welcome')}
            </p>

            <p className="truncate text-sm font-semibold text-start">
              {getUsernameFromToken()}

              <sub className="ml-1 text-zinc-500">
                ({getUsernameFromToken(true)})
              </sub>
            </p>
          </div>

          <div className="my-1 border-t border-gray-200" />

          {/* Account Settings */}
          <Link to="/profile" className="contextMenuButton" onClick={() => 
            {
              setContextMenu(null);
            }
            }>
            {t('accountSettings')}
          </Link>

          {/* About */}
          {/* <button
            type="button"
            className="contextMenuButton"
            onClick={() => {
              console.log("About");
              setContextMenu(null);
            }}
          >
            {t('about')}
          </button> */}

          <button onClick={() => { toggleLanguage(); setContextMenu(null); }} className="contextMenuButton">
            {idArabic ? 'تغيير اللغة' : 'Change Language'}
          </button>

          <button onClick={() => { toggleTheme(); setContextMenu(null)}} className="contextMenuButton">
            {t("changeMode")}
          </button>

          <FullscreenToggle onSuccess={() => setContextMenu(null)} />

          {/* Sign Out */}
          {isAuthenticated && (
            <>
              <div className="my-1 border-t border-gray-200" />

              <button
                type="button"
                className="contextMenuButton out"
                onClick={() => {
                  logout();
                  setContextMenu(null);
                }}
              >
                {t('signOut')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ========================= */}
        {/* Public Pages */}
        {/* ========================= */} 

        <Route element={<PublicRoute />}> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} /> 
        </Route> 

        {/* ========================= */} 
        {/* Protected Pages */} 
        {/* ========================= */} 

        <Route element={<ProtectedRoute />}> 

        {/* Layout بتاع الموقع */} 
        <Route element={<MainLayout />}> 
          {routes.map((route) => ( <Route key={route.path} path={route.path} element={route.element} /> ))} 
        </Route> 
        </Route> 
        </Routes> 
        </AuthProvider>
  );
};

export default App;