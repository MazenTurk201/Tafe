import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmployeesApi, type EmployeeProfile, type EmployeeCreateDTO, type Role } from "@/api/employeesApi";
import { getApiError } from "@/lib/api-error";

export default function EmployeeManagementPage() {
  const { t, i18n } = useTranslation();

  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<EmployeeProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<EmployeeProfile | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formData, setFormData] = useState<EmployeeCreateDTO>({
    user: {
      userName: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      address: "",
    },
    salary: 0,
    hireDate: new Date().toISOString().split("T")[0],
    roleName: "",
  });

  const [editFormData, setEditFormData] = useState({
    userId: "",
    salary: 0,
    hireDate: "",
    isActive: true,
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    document.body.dir = i18n.language.startsWith("ar") ? "rtl" : "ltr";
  }, [i18n.language]);

  const fetchEmployees = async () => {
    try {
      const data = await EmployeesApi.GetEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedEmployees = async () => {
    try {
      const data = await EmployeesApi.GetDeletedEmployees();
      setDeletedEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [employeesData, deletedData, rolesData] = await Promise.all([
          EmployeesApi.GetEmployees(),
          EmployeesApi.GetDeletedEmployees(),
          EmployeesApi.GetRoles(),
        ]);

        if (!ignore) {
          setEmployees(employeesData);
          setDeletedEmployees(deletedData);
          setRoles(rolesData);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Failed to load employees");
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
  }, []);

  const handleCreateEmployee = async () => {
    if (!formData.user.userName || !formData.user.email || !formData.user.firstName || !formData.user.password || !formData.roleName) {
      setFormError("Please fill all required fields");
      return;
    }

    if (formData.user.password !== formData.user.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      setCreating(true);
      setFormError("");
      await EmployeesApi.CreateEmployee(formData);
      setFormSuccess("Employee created successfully");
      setShowCreateDialog(false);
      resetForm();
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormError(getApiError(err, "Failed to create employee"));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      setUpdating(true);
      setFormError("");
      await EmployeesApi.UpdateEmployee(editFormData);
      setFormSuccess("Employee updated successfully");
      setShowEditDialog(null);
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormError(getApiError(err, "Failed to update employee"));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEmployee = async (userName: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await EmployeesApi.DeleteEmployee(userName);
      await fetchEmployees();
      await fetchDeletedEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  const handleRestoreEmployee = async (userName: string) => {
    try {
      await EmployeesApi.RestoreEmployee(userName);
      await fetchEmployees();
      await fetchDeletedEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to restore employee");
    }
  };

  const openEditDialog = (employee: EmployeeProfile) => {
    setEditFormData({
      userId: employee.userId,
      salary: employee.salary,
      hireDate: employee.hireDate.split("T")[0],
      isActive: employee.isActive,
    });
    setShowEditDialog(employee);
    setFormError("");
    setFormSuccess("");
  };

  const resetForm = () => {
    setFormData({
      user: {
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        address: "",
      },
      salary: 0,
      hireDate: new Date().toISOString().split("T")[0],
      roleName: "",
    });
    setFormError("");
    setFormSuccess("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 mx-auto mb-4 bg-gray-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-64 mx-auto bg-gray-200 dark:bg-zinc-700 rounded" />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("employeeManagement") || "Employee Management"}
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1">
              {t("employeeManagementDesc") || "Manage restaurant staff accounts and profiles"}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
            className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            {t("addEmployee") || "Add Employee"}
          </button>
        </div>

        {/* Active Employees Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("activeEmployees") || "Active Employees"} ({employees.length})
            </h2>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {showDeleted ? "Hide" : "Show"} {t("deletedEmployees") || "Deleted Employees"}
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" role="grid">
              <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("name") || "Name"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("username") || "Username"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("email") || "Email"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("salary") || "Salary"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("hireDate") || "Hire Date"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("status") || "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                      {t("noEmployees") || "No employees found"}
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.userId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{employee.fullName}</div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">{employee.userId}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{employee.userName}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{employee.email}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(employee.salary)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {formatDate(employee.hireDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {employee.isActive ? (t("active") || "Active") : (t("inactive") || "Inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditDialog(employee)}
                            className="px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                          >
                            {t("edit") || "Edit"}
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.userName)}
                            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                          >
                            {t("delete") || "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deleted Employees */}
        {showDeleted && (
          <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("deletedEmployees") || "Deleted Employees"} ({deletedEmployees.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" role="grid">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {t("name") || "Name"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {t("username") || "Username"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {t("email") || "Email"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {deletedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                        {t("noDeletedEmployees") || "No deleted employees"}
                      </td>
                    </tr>
                  ) : (
                    deletedEmployees.map((employee) => (
                      <tr key={employee.userId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 opacity-60">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{employee.fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-zinc-400">{employee.userId}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{employee.userName}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{employee.email}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRestoreEmployee(employee.userName)}
                            className="px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                          >
                            {t("restore") || "Restore"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Employee Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateDialog(false)} />
              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("addEmployee") || "Add Employee"}
                  </h2>
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateEmployee(); }} className="p-6 space-y-6">
                  {formSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                      {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("firstName") || "First Name"} *
                      </label>
                      <input
                        type="text"
                        value={formData.user.firstName}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, firstName: e.target.value } })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("lastName") || "Last Name"}
                      </label>
                      <input
                        type="text"
                        value={formData.user.lastName}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, lastName: e.target.value } })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("username") || "Username"} *
                      </label>
                      <input
                        type="text"
                        value={formData.user.userName}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, userName: e.target.value } })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("email") || "Email"} *
                      </label>
                      <input
                        type="email"
                        value={formData.user.email}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, email: e.target.value } })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("password") || "Password"} *
                      </label>
                      <input
                        type="password"
                        value={formData.user.password}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, password: e.target.value } })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("confirmPassword") || "Confirm Password"} *
                      </label>
                      <input
                        type="password"
                        value={formData.user.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, confirmPassword: e.target.value } })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("address") || "Address"}
                      </label>
                      <input
                        type="text"
                        value={formData.user.address || ""}
                        onChange={(e) => setFormData({ ...formData, user: { ...formData.user, address: e.target.value } })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("salary") || "Salary"} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("hireDate") || "Hire Date"} *
                      </label>
                      <input
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                        {t("role") || "Role"} *
                      </label>
                      <select
                        value={formData.roleName}
                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">{t("selectRole") || "Select Role"}</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateDialog(false)}
                      className="px-5 py-2.5 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {creating ? t("creating") || "Creating..." : t("create") || "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Dialog */}
        {showEditDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditDialog(null)} />
              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("editEmployee") || "Edit Employee"}
                  </h2>
                  <button
                    onClick={() => setShowEditDialog(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleUpdateEmployee(); }} className="p-6 space-y-6">
                  {formSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                      {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("salary") || "Salary"} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.salary}
                      onChange={(e) => setEditFormData({ ...editFormData, salary: parseFloat(e.target.value) || 0 })}
                      required
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                      {t("hireDate") || "Hire Date"} *
                    </label>
                    <input
                      type="date"
                      value={editFormData.hireDate}
                      onChange={(e) => setEditFormData({ ...editFormData, hireDate: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                        {t("active") || "Active"}
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowEditDialog(null)}
                      className="px-5 py-2.5 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {updating ? t("saving") || "Saving..." : t("save") || "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}