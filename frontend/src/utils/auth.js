export function saveAuth(data) {
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("access");
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function canManageContentArea(user = getCurrentUser()) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return !!(user.can_manage_content && user.can_manage_tests);
}

export function canAccessAdminPanel() {
  return canManageContentArea();
}

export function hasPermission(permissionKey) {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === "admin") return true;
  return !!user[permissionKey];
}

/* ESKI KODLAR BUZILMASLIGI UCHUN */
export function adminLogin(data) {
  saveAuth(data);
}
