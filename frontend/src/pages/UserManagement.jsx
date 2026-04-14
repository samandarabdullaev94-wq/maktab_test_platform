import { useEffect, useState } from "react";
import api from "../utils/api";
import "../styles/admin.css";
import { useI18n } from "../i18n/useI18n";

function UserManagement() {
  const { tx } = useI18n();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "user",
    is_active: true,
    can_manage_users: false,
    can_manage_settings: false,
    can_manage_organizations: false,
    can_manage_classes: false,
    can_manage_tests: false,
    can_manage_content: false,
    can_view_results: false,
    can_export_excel: false,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("admin/users/");
      setUsers(res.data);
    } catch (error) {
      console.error("Userlarni olishda xatolik:", error);
      setError("Userlarni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateField = (id, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const updateNewUserField = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChangeForNewUser = (role) => {
    if (role === "admin") {
      setNewUser((prev) => ({
        ...prev,
        role,
        can_manage_users: true,
        can_manage_settings: true,
        can_manage_organizations: true,
        can_manage_classes: true,
        can_manage_tests: true,
        can_manage_content: true,
        can_view_results: true,
        can_export_excel: true,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        role,
      }));
    }
  };

  const handleRoleChangeForExistingUser = (id, role) => {
    if (role === "admin") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role,
                can_manage_users: true,
                can_manage_settings: true,
                can_manage_organizations: true,
                can_manage_classes: true,
                can_manage_tests: true,
                can_manage_content: true,
                can_view_results: true,
                can_export_excel: true,
              }
            : u
        )
      );
    } else {
      updateField(id, "role", role);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username.trim()) {
      alert(tx("Login kiriting"));
      return;
    }

    if (!newUser.password.trim()) {
      alert(tx("Parol kiriting"));
      return;
    }

    try {
      setCreating(true);

      const res = await api.post("admin/users/", newUser);

      setNewUser({
        username: "",
        password: "",
        full_name: "",
        email: "",
        role: "user",
        is_active: true,
        can_manage_users: false,
        can_manage_settings: false,
        can_manage_organizations: false,
        can_manage_classes: false,
        can_manage_tests: false,
        can_manage_content: false,
        can_view_results: false,
        can_export_excel: false,
      });

      setUsers((prev) => [...prev, res.data]);
      alert(tx("Yangi foydalanuvchi qo'shildi"));
    } catch (error) {
      console.error("User yaratishda xatolik:", error);
      alert(tx("User yaratishda xatolik"));
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (user) => {
    try {
      setSavingId(user.id);
      const res = await api.patch(`admin/users/${user.id}/`, user);
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, ...res.data } : item
        )
      );
    } catch (error) {
      console.error("User saqlashda xatolik:", error);
      alert(tx("User saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(tx("Foydalanuvchini o'chirishni tasdiqlaysizmi?"))) {
      return;
    }

    try {
      await api.delete(`admin/users/${user.id}/`);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      console.error("User o'chirishda xatolik:", error);
      alert(error.response?.data?.error || tx("User o'chirishda xatolik"));
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <p>{tx("Yuklanmoqda...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card">
        <p style={{ color: "var(--app-danger)" }}>{tx(error)}</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Yangi foydalanuvchi qo'shish")}</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <input
            className="admin-input"
            placeholder={tx("Login")}
            value={newUser.username}
            onChange={(e) => updateNewUserField("username", e.target.value)}
          />

          <input
            className="admin-input"
            placeholder={tx("Parol")}
            type="text"
            value={newUser.password}
            onChange={(e) => updateNewUserField("password", e.target.value)}
          />

          <input
            className="admin-input"
            placeholder={tx("To'liq ism")}
            value={newUser.full_name}
            onChange={(e) => updateNewUserField("full_name", e.target.value)}
          />

          <input
            className="admin-input"
            placeholder={tx("Email")}
            value={newUser.email}
            onChange={(e) => updateNewUserField("email", e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px repeat(8, auto)",
            gap: "14px",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <select
            className="admin-input"
            value={newUser.role}
            onChange={(e) => handleRoleChangeForNewUser(e.target.value)}
          >
            <option value="admin">{tx("Admin")}</option>
            <option value="user">{tx("User")}</option>
          </select>

          <label><input type="checkbox" checked={newUser.can_manage_users} onChange={(e) => updateNewUserField("can_manage_users", e.target.checked)} /> {tx("Users")}</label>
          <label><input type="checkbox" checked={newUser.can_manage_settings} onChange={(e) => updateNewUserField("can_manage_settings", e.target.checked)} /> {tx("Settings")}</label>
          <label><input type="checkbox" checked={newUser.can_manage_organizations} onChange={(e) => updateNewUserField("can_manage_organizations", e.target.checked)} /> {tx("Org")}</label>
          <label><input type="checkbox" checked={newUser.can_manage_classes} onChange={(e) => updateNewUserField("can_manage_classes", e.target.checked)} /> {tx("Classes")}</label>
          <label><input type="checkbox" checked={newUser.can_manage_tests} onChange={(e) => updateNewUserField("can_manage_tests", e.target.checked)} /> {tx("Tests")}</label>
          <label><input type="checkbox" checked={newUser.can_manage_content} onChange={(e) => updateNewUserField("can_manage_content", e.target.checked)} /> {tx("Content")}</label>
          <label><input type="checkbox" checked={newUser.can_view_results} onChange={(e) => updateNewUserField("can_view_results", e.target.checked)} /> {tx("Results")}</label>
          <label><input type="checkbox" checked={newUser.can_export_excel} onChange={(e) => updateNewUserField("can_export_excel", e.target.checked)} /> {tx("Excel")}</label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={newUser.is_active}
              onChange={(e) => updateNewUserField("is_active", e.target.checked)}
            />{" "}
            {tx("Active")}
          </label>
        </div>

        <div style={{ marginTop: "18px" }}>
          <button
            className="admin-primary-btn"
            onClick={handleCreateUser}
            disabled={creating}
          >
            {creating ? tx("Qo'shilmoqda...") : tx("Foydalanuvchi qo'shish")}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Foydalanuvchilar va rollar")}</h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{tx("ID")}</th>
                <th>{tx("Username")}</th>
                <th>{tx("To'liq ism")}</th>
                <th>{tx("Role")}</th>
                <th>{tx("Users")}</th>
                <th>{tx("Settings")}</th>
                <th>{tx("Org")}</th>
                <th>{tx("Classes")}</th>
                <th>{tx("Tests")}</th>
                <th>{tx("Content")}</th>
                <th>{tx("Results")}</th>
                <th>{tx("Excel")}</th>
                <th>{tx("Active")}</th>
                <th>{tx("Amal")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <input
                      className="admin-input"
                      value={user.full_name || ""}
                      onChange={(e) => updateField(user.id, "full_name", e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-input"
                      value={user.role}
                      onChange={(e) => handleRoleChangeForExistingUser(user.id, e.target.value)}
                    >
                      <option value="admin">{tx("Admin")}</option>
                      <option value="user">{tx("User")}</option>
                    </select>
                  </td>
                  <td><input type="checkbox" checked={user.can_manage_users} onChange={(e) => updateField(user.id, "can_manage_users", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_manage_settings} onChange={(e) => updateField(user.id, "can_manage_settings", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_manage_organizations} onChange={(e) => updateField(user.id, "can_manage_organizations", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_manage_classes} onChange={(e) => updateField(user.id, "can_manage_classes", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_manage_tests} onChange={(e) => updateField(user.id, "can_manage_tests", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_manage_content} onChange={(e) => updateField(user.id, "can_manage_content", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_view_results} onChange={(e) => updateField(user.id, "can_view_results", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.can_export_excel} onChange={(e) => updateField(user.id, "can_export_excel", e.target.checked)} /></td>
                  <td><input type="checkbox" checked={user.is_active} onChange={(e) => updateField(user.id, "is_active", e.target.checked)} /></td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-primary-btn"
                        onClick={() => handleSave(user)}
                        disabled={savingId === user.id}
                      >
                        {savingId === user.id
                          ? tx("Saqlanmoqda...")
                          : tx("Saqlash")}
                      </button>
                      <button
                        className="admin-danger-btn"
                        onClick={() => handleDelete(user)}
                      >
                        {tx("O'chirish")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserManagement;
