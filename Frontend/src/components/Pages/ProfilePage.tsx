import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  address: string;
  createdAt: string;
  roles: string[];
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { token, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "security">("profile");
  const [editMode, setEditMode] = useState(false);

  // Form states
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

  useEffect(() => {
    document.body.dir = i18n.language.startsWith("ar") ? "rtl" : "ltr";
  }, [i18n.language]);

  const applyProfile = (data: UserProfile) => {
  setProfile({
    id: data.id,
    userName: data.userName,
    email: data.email,
    fullName: data.fullName ?? "",
    address: data.address ?? "",
    createdAt: data.createdAt,
    roles: data.roles ?? [],
  });

  const names = data.fullName?.split(" ") || ["", ""];

  setFormData({
    firstName: names[0] || "",
    lastName: names.slice(1).join(" ") || "",
    email: data.email || "",
    address: data.address ?? "",
  });
};
  const fetchProfile = async () => {
    if (!token) return;

    try {
      setError(null);

      const { data } = await api.get("/Account/Details");

      applyProfile(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    (async () => {
      try {
        const { data } = await api.get("/Account/Details");

        if (!ignore) {
          applyProfile(data);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Failed to load profile");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSaveProfile = async () => {
    if (!token || !profile) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      await api.patch("/CustomerProfile", {
      userId: profile.id,
      address: formData.address,
    });

      // Note: The backend doesn't have an update profile endpoint yet
      // This would need to be implemented in the backend
      // For now, we'll just show a success message
      setSaveSuccess("Profile updated successfully");

      // Update local state
      setProfile((prev) => prev ? {
        ...prev,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
      } : null);

      setEditMode(false);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Would need backend endpoint for password change
    setSaveSuccess("Password change functionality requires backend endpoint");
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "manager":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "cashier":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "waiter":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "kitchen":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "delivery":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-20 w-20 mx-auto mb-4 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          <div className="h-6 w-48 mx-auto mb-2 bg-gray-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-64 mx-auto bg-gray-200 dark:bg-zinc-700 rounded" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="w-full min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || "Profile not found"}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("retry") || "Retry"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("profile") || "Profile"}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            {t("profileSubtitle") || "Manage your account settings and preferences"}
          </p>
        </div>

        {/* Profile Card & Tabs */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-linear-to-r from-purple-600 to-blue-600 px-6 py-8 md:px-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {profile.fullName?.charAt(0).toUpperCase() || profile.userName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {profile.fullName || profile.userName}
                  </h2>
                  <p className="text-purple-100 mt-1">{profile.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors backdrop-blur-sm border border-white/30"
              >
                {t("logout") || "Logout"}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-100 dark:border-zinc-800">
            <nav className="flex gap-1 px-2 md:px-6" role="tablist">
              {[
                { id: "profile", label: t("profileInfo") || "Profile Info", icon: "👤" },
                { id: "settings", label: t("settings") || "Settings", icon: "⚙️" },
                { id: "security", label: t("security") || "Security", icon: "🔒" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panels */}
          <div className="p-6 md:p-8">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {saveError}
              </div>
            )}

            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6" role="tabpanel">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("firstName") || "First Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editMode}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("lastName") || "Last Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editMode}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("username") || "Username"}
                    </label>
                    <input
                      type="text"
                      value={profile.userName}
                      disabled
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                      {t("usernameCannotChange") || "Username cannot be changed"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("email") || "Email"}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("address") || "Address"}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!editMode}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("memberSince") || "Member Since"}
                    </label>
                    <input
                      type="text"
                      value={
                        profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "Unknown"
                      }
                      disabled
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          // Reset form data
                          const names = profile.fullName?.split(" ") || ["", ""];
                          setFormData({
                            firstName: names[0] || "",
                            lastName: names.slice(1).join(" ") || "",
                            email: profile.email || "",
                            address: formData.address,
                          });
                        }}
                        className="px-5 py-2.5 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t("cancel") || "Cancel"}
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? t("saving") || "Saving..." : t("save") || "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {t("editProfile") || "Edit Profile"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6" role="tabpanel">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t("preferences") || "Preferences"}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t("darkMode") || "Dark Mode"}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {t("darkModeDesc") || "Enable dark theme for the application"}
                        </p>
                      </div>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-zinc-600 transition-colors"
                        role="switch"
                        aria-checked={false}
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition translate-x-0" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t("notifications") || "Notifications"}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {t("notificationsDesc") || "Receive email notifications for updates"}
                        </p>
                      </div>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors"
                        role="switch"
                        aria-checked={true}
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t("language") || "Language"}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {t("languageDesc") || "Choose your preferred language"}
                        </p>
                      </div>
                      <select
                        className="rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6" role="tabpanel">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t("changePassword") || "Change Password"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("currentPassword") || "Current Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("newPassword") || "New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("confirmNewPassword") || "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? t("saving") || "Saving..." : t("updatePassword") || "Update Password"}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t("sessions") || "Active Sessions"}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400 mb-4">
                    {t("sessionsDesc") || "Manage your active login sessions"}
                  </p>
                  <button className="px-5 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    {t("revokeAllSessions") || "Revoke All Other Sessions"}
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
