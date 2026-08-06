import { useEffect, useState } from "react";
import SidebarDrawer from "./drawer";
import ThemeImage from "../Utilties/ThemeImage";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      // لو نزلنا أكتر من 20 بكسل، فعل الـ blur
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`w-full h-16 flex items-center justify-between px-5 fixed top-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/30 dark:bg-black/30 backdrop-blur drop-shadow-2xl' : 'bg-transparent'}`} dir="rtl">
      <div className="flex items-center gap-5">
        {/* <img src="/images/logo.png" alt="Logo" className="w-10 h-10" /> */}
        <ThemeImage size={90}/>
        <div className='not-sm:hidden'>Tawlefty</div>
      </div>
      <div className="flex items-center justify-start">
        <SidebarDrawer />
      </div>
    </nav>
  );
}

export default NavBar;