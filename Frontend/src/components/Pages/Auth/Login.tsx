import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../../context/AuthContext";
import { getApiError } from "../../../lib/api-error";
import { AuthLayout, Spinner, inputBase } from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login(username.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;

      if (status === 400 || status === 401) {
        // الـ backend بيرجّع 400/401 لما اليوزر أو الباسورد غلط
        setError(t("errUsernameOrPassword"));
      } else {
        const fallback = t("somethingWentWrong", "حصلت مشكلة، جرّب تاني");
        const msg = getApiError(err, fallback);
        // ما نعرضش رسالة axios الخام للمستخدم
        setError(msg.startsWith("Request failed with status code") ? fallback : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
    <form
      onSubmit={handleSubmit}
      aria-busy={loading}
      className="space-y-6 rounded-3xl border border-[#EBDDC9] bg-white/80 p-8 shadow-[0_30px_80px_-30px_rgba(43,27,20,0.35)] backdrop-blur sm:p-10 dark:border-[#33231A] dark:bg-[#1B120D]/90"
    >
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-medium text-[#2B1B14] dark:text-[#F6EFE4]">
          {t("welcome")}
        </h2>
        <p className="text-sm text-[#8A7560] dark:text-[#A8967F]">
          {t("signInToYourAccount")}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#B5573A]/30 bg-[#B5573A]/10 px-4 py-3 text-sm text-[#8F3F27] dark:border-[#B5573A]/40 dark:bg-[#B5573A]/15 dark:text-[#E89A80]"
        >
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-[#4A2F22] dark:text-[#D9C7B0]"
          >
            {t("username")}
          </label>
          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute inset-y-0 inset-s-4 my-auto text-[#A8967F]"
            />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("enterUsername")}
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={loading}
              aria-invalid={!!error}
              className={inputBase}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-[#4A2F22] dark:text-[#D9C7B0]"
          >
            {t("password")}
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute inset-y-0 inset-s-4 my-auto text-[#A8967F]"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("enterPassword")}
              required
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={!!error}
              className={`${inputBase} pe-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="absolute inset-y-0 inset-e-3 my-auto grid h-9 w-9 place-items-center rounded-lg text-[#A8967F] transition hover:bg-[#C58B4E]/10 hover:text-[#8A5A2B] dark:hover:text-[#E3B27A] nobg"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-[#D5C3AB] accent-[#B5573A] focus:ring-2 focus:ring-[#C58B4E]/40"
          />
          <span className="text-sm text-[#4A2F22] dark:text-[#D9C7B0]">
            {t("rememberMe")}
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B1B14] py-3.5 font-medium text-[#F6EFE4] shadow-lg shadow-[#2B1B14]/20 transition hover:bg-[#3C261B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C58B4E]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#C58B4E] dark:text-[#2B1B14] dark:shadow-[#C58B4E]/10 dark:hover:bg-[#D39A5E]"
        >
          {loading ? (
            <>
              <Spinner />
              {t("loggingIn")}
            </>
          ) : (
            <>
              {t("login")}
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#A8967F]">
        <span className="h-px flex-1 bg-[#EBDDC9] dark:bg-[#33231A]" />
        ☕
        <span className="h-px flex-1 bg-[#EBDDC9] dark:bg-[#33231A]" />
      </div>

      <p className="text-center text-sm text-[#8A7560] dark:text-[#A8967F]">
        {t("dontHaveAccount")}{" "}
        <Link
          to="/register"
          className="font-semibold text-[#B5573A] underline-offset-4 hover:underline dark:text-[#E3B27A]"
        >
          {t("register")}
        </Link>
      </p>
    </form>
    </AuthLayout>
  );
}
