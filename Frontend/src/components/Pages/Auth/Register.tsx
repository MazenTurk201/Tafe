import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AtSign,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  User,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../../context/AuthContext";
import { getApiError } from "../../../lib/api-error";
import { AuthLayout, Spinner, inputBase } from "./AuthLayout";

const labelCls =
  "mb-1.5 block text-sm font-medium text-[#4A2F22] dark:text-[#D9C7B0]";
const iconCls =
  "pointer-events-none absolute inset-y-5 start-4 my-auto text-[#A8967F]";

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <span className={iconCls}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch", "كلمتين السر مش متطابقتين"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register({
        user: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userName: userName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          address: address.trim(),
        },
        birthDate,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(getApiError(err, t("registrationFailed", "Registration failed")));
    } finally {
      setLoading(false);
    }
  };

  const pwType = showPassword ? "text" : "password";

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        className="space-y-6 rounded-3xl border border-[#EBDDC9] bg-white/80 p-8 shadow-[0_30px_80px_-30px_rgba(43,27,20,0.35)] backdrop-blur sm:p-10 dark:border-[#33231A] dark:bg-[#1B120D]/90"
      >
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-medium text-[#2B1B14] dark:text-[#F6EFE4]">
            {t("register")}
          </h2>
          <p className="text-sm text-[#8A7560] dark:text-[#A8967F]">
            {t("registerSubtitle", "اعمل حسابك واتفضل على أول فنجان.")}
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
          {/* names */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="firstName" label={t("firstName")} icon={<User size={18} />}>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("firstName")}
                required
                autoFocus
                autoComplete="given-name"
                disabled={loading}
                className={inputBase}
              />
            </Field>
            <Field id="lastName" label={t("lastName")} icon={<UserRound size={18} />}>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("lastName")}
                autoComplete="family-name"
                disabled={loading}
                className={inputBase}
              />
            </Field>
          </div>

          <Field id="userName" label={t("username")} icon={<AtSign size={18} />}>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("username")}
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={loading}
              className={inputBase}
            />
          </Field>

          <Field id="email" label={t("email")} icon={<Mail size={18} />}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              disabled={loading}
              className={inputBase}
            />
          </Field>

          <Field id="address" label={t("address")} icon={<MapPin size={18} />}>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("address")}
              autoComplete="street-address"
              disabled={loading}
              className={inputBase}
            />
          </Field>

          <Field id="birthDate" label={t("birthdate")} icon={<Calendar size={18} />}>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
              autoComplete="bday"
              disabled={loading}
              className={`${inputBase} dark:scheme-dark`}
            />
          </Field>

          {/* passwords */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="password" label={t("password")} icon={<Lock size={18} />}>
              <input
                id="password"
                type={pwType}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                required
                autoComplete="new-password"
                disabled={loading}
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
            </Field>

            <div>
              <Field
                id="confirmPassword"
                label={t("confirmPassword")}
                icon={<Lock size={18} />}
              >
                <input
                  id="confirmPassword"
                  type={pwType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPassword")}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={mismatch}
                  className={`${inputBase} ${
                    mismatch
                      ? "border-[#B5573A]! focus:ring-[#B5573A]/20!"
                      : ""
                  }`}
                />
              </Field>
              {mismatch && (
                <p className="mt-1.5 text-xs text-[#B5573A] dark:text-[#E89A80]">
                  {t("passwordsDontMatch", "كلمتين السر مش متطابقتين")}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B1B14] py-3.5 font-medium text-[#F6EFE4] shadow-lg shadow-[#2B1B14]/20 transition hover:bg-[#3C261B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C58B4E]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#C58B4E] dark:text-[#2B1B14] dark:shadow-[#C58B4E]/10 dark:hover:bg-[#D39A5E]"
          >
            {loading ? (
              <>
                <Spinner />
                {t("creatingAccount")}
              </>
            ) : (
              t("register")
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#A8967F]">
          <span className="h-px flex-1 bg-[#EBDDC9] dark:bg-[#33231A]" />
          ☕
          <span className="h-px flex-1 bg-[#EBDDC9] dark:bg-[#33231A]" />
        </div>

        <p className="text-center text-sm text-[#8A7560] dark:text-[#A8967F]">
          {t("alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            className="font-semibold text-[#B5573A] underline-offset-4 hover:underline dark:text-[#E3B27A]"
          >
            {t("login")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
