import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface FullscreenToggleProps {
  onSuccess?: () => void;
}

export default function FullscreenToggle({ onSuccess }: FullscreenToggleProps) {
  const { t, i18n } = useTranslation();
      // للتأكيد إن الاتجاه مظبوط مع أي تغيير للغة
      useEffect(() => {
        document.body.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
      }, [i18n.language]);
    

  // Sync state if the user exits via the "Esc" key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
       !!(
        doc.fullscreenElement || 
        doc.webkitFullscreenElement || 
        doc.mozFullScreenElement || 
        doc.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const handleToggle = async () => {
    const doc = document as any;
    const element = document.documentElement as any;

    try {
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
        else if (element.mozRequestFullScreen) await element.mozRequestFullScreen();
        else if (element.msRequestFullscreen) await element.msRequestFullscreen();
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) await doc.msExitFullscreen();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // FIX: This explicit return statement resolves the TypeScript error
  return (
    <button onClick={() => {handleToggle(); onSuccess && onSuccess();}} className="contextMenuButton">
      {t('fullscreen')}
    </button>
  );
}
