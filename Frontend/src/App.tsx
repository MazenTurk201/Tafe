import { Routes, Route, Outlet } from 'react-router-dom';
import { routes } from "./components/Data/routesWebsite";
import NavBar from './components/Modules/navBar';
import Footer from './components/Modules/footerWedgit';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import { AuthProvider } from './context/AuthContext';

function MainLayout() { 
  return ( 
    <div className="flex min-h-dvh h-full flex-col items-center bg-zinc-50 font-sans dark:bg-black"> 
      <NavBar /> 
      <main className="w-full flex-1"> 
        <Outlet /> 
      </main> 
      <Footer /> 
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