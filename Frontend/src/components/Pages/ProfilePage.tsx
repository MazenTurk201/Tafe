import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../Utilties/changeMode";
import api from "@/lib/api";
import { getApiError } from "@/lib/api-error";

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  address: string;
  createdAt: string;
  roles: string[];
}

type Tab = "profile" | "settings" | "security";

/* ========================= Styles ========================= */

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-[#C58B4E] focus:ring-2 focus:ring-[#C58B4E]/30 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:disabled:bg-stone-800/60";

const labelClass =
  "mb-1.5 block text-sm font-medium text-stone-600 dark:text-stone-300";

const primaryBtn =
  "rounded-xl bg-linear-to-br from-[#C58B4E] to-[#B5573A] px-5 py-2.5 font-medium text-white shadow-sm transition hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

const outlineBtn =
  "rounded-xl border border-stone-300 px-5 py-2.5 font-medium transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  manager: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  cashier: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  waiter: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  kitchen: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  delivery: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const getRoleBadgeColor = (role: string) =>
  roleColors[role.toLowerCase()] ??
  "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

/* ========================= Small pieces ========================= */

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      dir="ltr"
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-[#C58B4E]" : "bg-stone-300 dark:bg-stone-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ========================= Page ========================= */

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const isArabic = i18n.language.startsWith("ar");

  useEffect(() => {
    document.body.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  const splitName = (fullName: string) => {
    const names = fullName.trim().split(/\s+/);
    return { firstName: names[0] ?? "", lastName: names.slice(1).join(" ") };
  };

  const applyProfile = (data: UserProfile) => {
    const normalized: UserProfile = {
      id: data.id,
      userName: data.userName,
      email: data.email ?? "",
      fullName: data.fullName ?? "",
      address: data.address ?? "",
      createdAt: data.createdAt,
      roles: data.roles ?? [],
    };
    setProfile(normalized);
    setFormData({
      ...splitName(normalized.fullName),
      email: normalized.email,
      address: normalized.address,
    });
  };

  // fetchProfile واحدة بس (كانت متكررة مرتين في الكود الأصلي)
  const fetchProfile = async (signal?: { ignore: boolean }) => {
    if (!token) return;
    try {
      setError(null);
      setLoading(true);
      const { data } = await api.get("/Account/Details");
      if (!signal?.ignore) applyProfile(data);
    } catch (err) {
      console.error(err);
      if (!signal?.ignore) setError(getApiError(err));
    } finally {
      if (!signal?.ignore) setLoading(false);
    }
  };

  useEffect(() => {
    const signal = { ignore: false };
    fetchProfile(signal);
    return () => {
      signal.ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    if (!profile) return;
    setFormData({
      ...splitName(profile.fullName),
      email: profile.email,
      address: profile.address,
    });
  };

  const handleSaveProfile = async () => {
    if (!token || !profile) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      // لسه الـ backend بيحفظ العنوان بس
      await api.patch("/CustomerProfile", {
        userId: profile.id,
        address: formData.address,
      });

      // الاسم والإيميل بيتحدثوا محلياً بس لحد ما يبقى في endpoint ليهم
      setProfile({
        ...profile,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        address: formData.address,
      });

      setSaveSuccess(t("profileUpdated", "Profile updated successfully"));
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setSaveError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (passwordData.newPassword.length < 6) {
      setSaveError(t("passwordTooShort", "Password must be at least 6 characters"));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError(t("passwordMismatch", "Passwords do not match"));
      return;
    }

    // TODO: اربطها بـ endpoint تغيير الباسورد لما يتعمل في الـ backend
    setSaveSuccess(
      t("passwordNeedsBackend", "Password change functionality requires backend endpoint")
    );
  };

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setSaveError("");
    setSaveSuccess("");
  };

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  /* ---------- Loading / Error ---------- */

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="animate-pulse text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="mx-auto mb-2 h-6 w-48 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mx-auto h-4 w-64 rounded bg-stone-200 dark:bg-stone-800" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-500">
            {error || t("profileNotFound", "Profile not found")}
          </p>
          <button onClick={() => fetchProfile()} className={primaryBtn}>
            {t("retry", "Retry")}
          </button>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: t("profileInfo", "Profile Info"), icon: "👤" },
    { id: "settings", label: t("settings", "Settings"), icon: "⚙️" },
    { id: "security", label: t("security", "Security"), icon: "🔒" },
  ];

  const initial =
    (profile.fullName || profile.userName || "U").charAt(0).toUpperCase();

  return (
    <main className="min-h-screen w-full px-4 pt-24 pb-12 text-stone-900 md:pt-32 dark:text-stone-100">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            {t("profile", "Profile")}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {t("profileSubtitle", "Manage your account settings and preferences")}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900">
          {/* Profile banner */}
          <div className="bg-linear-to-br from-[#C58B4E] to-[#B5573A] px-6 py-8 md:px-10 md:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 md:h-28 md:w-28">
                  <span className="text-4xl font-bold text-white md:text-5xl">
                    {initial}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold text-white md:text-3xl">
                    {profile.fullName || profile.userName}
                  </h2>
                  <p className="mt-1 truncate text-white/80">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.roles.map((role) => (
                      <span
                        key={role}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(role)}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-xl border border-white/30 bg-white/20 px-5 py-2.5 font-medium text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
              >
                {t("logout", "Logout")}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-stone-200 dark:border-stone-800">
            <nav className="flex gap-1 overflow-x-auto px-2 md:px-6" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-[#B5573A] text-[#B5573A] dark:border-[#C58B4E] dark:text-[#C58B4E]"
                      : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Panels */}
          <div className="p-6 md:p-8">
            {saveSuccess && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {saveError}
              </div>
            )}

            {/* ===== Profile tab ===== */}
            {activeTab === "profile" && (
              <div className="space-y-6" role="tabpanel">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field label={t("firstName", "First Name")}>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!editMode}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={t("lastName", "Last Name")}>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!editMode}
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label={t("username", "Username")}
                    hint={t("usernameCannotChange", "Username cannot be changed")}
                  >
                    <input
                      type="text"
                      value={profile.userName}
                      disabled
                      className={inputClass}
                    />
                  </Field>

                  <Field label={t("email", "Email")}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!editMode}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={t("address", "Address")} className="md:col-span-2">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      disabled={!editMode}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={t("memberSince", "Member Since")} className="md:col-span-2">
                    <input
                      type="text"
                      value={
                        profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              i18n.language,
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : t("unknown", "Unknown")
                      }
                      disabled
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="flex justify-end gap-3 border-t border-stone-200 pt-4 dark:border-stone-800">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setSaveError("");
                          resetForm();
                        }}
                        disabled={saving}
                        className={outlineBtn}
                      >
                        {t("cancel", "Cancel")}
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className={primaryBtn}
                      >
                        {saving
                          ? t("saving", "Saving...")
                          : t("save", "Save Changes")}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSaveSuccess("");
                        setEditMode(true);
                      }}
                      className={primaryBtn}
                    >
                      {t("editProfile", "Edit Profile")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===== Settings tab ===== */}
            {activeTab === "settings" && (
              <div className="space-y-6" role="tabpanel">
                <h3 className="text-lg font-semibold">
                  {t("preferences", "Preferences")}
                </h3>

                <div className="divide-y divide-stone-200 dark:divide-stone-800">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium">{t("darkMode", "Dark Mode")}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {t("darkModeDesc", "Enable dark theme for the application")}
                      </p>
                    </div>
                    <Toggle
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                      label={t("darkMode", "Dark Mode")}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium">{t("language", "Language")}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {t("languageDesc", "Choose your preferred language")}
                      </p>
                    </div>
                    <select
                      value={isArabic ? "ar" : "en"}
                      onChange={(e) => toggleLanguage(e.target.value)}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 outline-none transition focus:border-[#C58B4E] focus:ring-2 focus:ring-[#C58B4E]/30 dark:border-stone-700 dark:bg-stone-900"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ===== Security tab ===== */}
            {activeTab === "security" && (
              <div className="space-y-8" role="tabpanel">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    {t("changePassword", "Change Password")}
                  </h3>

                  <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label={t("currentPassword", "Current Password")}
                      className="md:col-span-2"
                    >
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={t("newPassword", "New Password")}>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={t("confirmNewPassword", "Confirm New Password")}>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className={primaryBtn}
                  >
                    {saving
                      ? t("saving", "Saving...")
                      : t("updatePassword", "Update Password")}
                  </button>
                </div>

                <div className="border-t border-stone-200 pt-6 dark:border-stone-800">
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("sessions", "Active Sessions")}
                  </h3>
                  <p className="mb-4 text-stone-500 dark:text-stone-400">
                    {t("sessionsDesc", "Manage your active login sessions")}
                  </p>
                  {/* TODO: اربط الزرار ده بـ endpoint لما يتعمل */}
                  <button className="rounded-xl border border-red-300 px-5 py-2.5 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40">
                    {t("revokeAllSessions", "Revoke All Other Sessions")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}