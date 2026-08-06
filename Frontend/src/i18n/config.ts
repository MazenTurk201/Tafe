// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from '../components/Data/translateData';

i18n
    .use(LanguageDetector) // استخدام مكتبة كشف اللغة
    .use(initReactI18next) // ربط i18next بـ React
    .init({
        resources,
        fallbackLng: 'ar', // اللغة الاحتياطية لو اللغة المطلوبة مش موجودة
        lng: localStorage.getItem('i18nextLng') || 'ar',
        detection: {
            order: ['localStorage', 'navigator'], // يدور الأول في الكاش المحفوظ
            caches: ['localStorage'], // يحفظ الاختيار جوه الـ localStorage تلقائي باسم i18nextLng
        },
        interpolation: {
            escapeValue: false // React بالفعل بيحمي من الـ XSS
        }
    });

// تظبيط اتجاه الصفحة (RTL/LTR) أول ما الموقع يفتح بناءً على اللغة الحالية
const currentLang = i18n.language || 'ar';
document.body.dir = currentLang.startsWith('ar') ? 'rtl' : 'ltr';

export default i18n;