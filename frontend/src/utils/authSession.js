/** Session utilisateur : profil API prioritaire, JWT en secours. */

export const parseTokenPayload = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
  localStorage.removeItem("user_display_name");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_is_staff");
  localStorage.removeItem("user_is_superuser");
};

export const applyUserSession = (user) => {
  if (!user) return;

  if (user.username) {
    localStorage.setItem("username", user.username);
  }
  if (user.role) {
    localStorage.setItem("user_role", user.role);
  }
  localStorage.setItem("user_is_staff", user.is_staff ? "1" : "0");
  localStorage.setItem("user_is_superuser", user.is_superuser ? "1" : "0");

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  if (displayName) {
    localStorage.setItem("user_display_name", displayName);
  }
};

export const userFromTokenPayload = (payload) => {
  if (!payload?.user_id) return null;
  return {
    id: payload.user_id,
    role: payload.role || localStorage.getItem("user_role") || "client",
    is_staff: Boolean(payload.is_staff),
    is_superuser: Boolean(payload.is_superuser),
  };
};

export const getPostLoginPath = (user) => {
  if (user?.is_staff) return "/admin-dashboard";
  if (user?.role === "coach") return "/coach-dashboard";
  return "/dashboard";
};
