import { Routes, Route } from 'react-router-dom';
import { routes } from "./components/Data/routesWebsite";
import NavBar from './components/Modules/navBar';
import Footer from './components/Modules/footerWedgit';

function App() {
  return (
    <>
      <div className="flex flex-col min-h-dvh h-full items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <NavBar />
        {/* <DotsBackground /> */}
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        <Footer />
      </div>
    </>
  );
};

export default App;