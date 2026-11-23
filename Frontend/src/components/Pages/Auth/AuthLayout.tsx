import ThemeImage from "@/components/Utilties/ThemeImage";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

/** Shared look for Login + Register (Tafé). */

export const inputBase =
  "w-full rounded-xl border border-[#E4D6C3] bg-[#FBF7F0] py-3.5 ps-11 pe-4 text-[#2B1B14] " +
  "placeholder:text-[#A8967F] outline-none transition " +
  "focus:border-[#C58B4E] focus:bg-white focus:ring-4 focus:ring-[#C58B4E]/20 " +
  "disabled:opacity-60 " +
  "dark:border-[#3A281E] dark:bg-[#1D130E] dark:text-[#F6EFE4] dark:placeholder:text-[#7D6A58] " +
  "dark:focus:border-[#C58B4E] dark:focus:bg-[#241812]";

export function SteamingCup() {
  return (
    <ThemeImage size={500}/>
  );
}

export function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-dvh w-full bg-[#F6EFE4] font-sans dark:bg-[#150D09] lg:grid-cols-[1.05fr_1fr] fixed">
        <div className="pointer-events-none absolute -top-32 -inset-s-32 h-40 w-40 lg:h-112 lg:w-md rounded-full bg-[#C58B4E]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -inset-e-24 h-36 w-36 lg:h-104 lg:w-104 rounded-full bg-[#B5573A]/25 blur-3xl" />
      {/* Brand panel (desktop) — sticky so it stays put while the long form scrolls */}
      <aside className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:items-center lg:justify-between lg:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#F6EFE4 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <header className="relative flex items-center gap-3 text-[#F6EFE4]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#C58B4E]/60 font-display text-lg text-[#C58B4E]">
            T
          </span>
          <span className="text-xs uppercase tracking-[0.35em] text-[#E3B27A]">
            {t("cafeTagline", "Coffee · Pastry · Slow mornings")}
          </span>
        </header>

        <div className="relative flex flex-col items-start gap-8">
          <SteamingCup />
          <div>
            <h1 className="font-display text-7xl font-medium leading-none tracking-tight text-[#F6EFE4]">
              Taf<span className="text-[#C58B4E]">é</span>
            </h1>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-[#D9C7B0]">
              {t("appDescription", "فنجان واحد، ومزاج مظبوط.")}
            </p>
          </div>
        </div>

        <footer className="relative text-xs text-[#9C8872] w-fit p-4">
          &copy; {new Date().getFullYear()} Tafé. {t("allRightsReserved")}
        </footer>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-5 py-10 sm:px-10 ">
        <div className="pointer-events-none absolute -top-24 -inset-e-24 h-72 w-72 rounded-full bg-[#C58B4E]/20 blur-3xl lg:hidden" />
        <div className="pointer-events-none absolute -bottom-24 -inset-s-24 h-72 w-72 rounded-full bg-[#B5573A]/15 blur-3xl lg:hidden" />

        <div className="relative w-full max-w-lg">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-display text-5xl font-medium tracking-tight text-[#2B1B14] dark:text-[#F6EFE4]">
              Taf<span className="text-[#C58B4E]">é</span>
            </h1>
            <p className="mt-2 text-sm text-[#8A7560] dark:text-[#A8967F]">
              {t("appDescription", "فنجان واحد، ومزاج مظبوط.")}
            </p>
          </div>

          {children}

          <p className="mt-6 text-center text-xs text-[#A8967F] lg:hidden">
            &copy; {new Date().getFullYear()} Tafé. {t("allRightsReserved")}
          </p>
        </div>
      </main>
    </div>
  );
}
