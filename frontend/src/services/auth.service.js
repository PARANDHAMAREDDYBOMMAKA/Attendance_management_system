import api from "./api";

export const login = async (username, password) => {
  try {
    // Note the endpoint is now prefixed with /user-management
    const response = await api.post("/user-management/login/", {
      username,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  username,
  email,
  password,
  first_name,
  last_name,
  user_type
) => {
  try {
    const response = await api.post("/user-management/users/", {
      username,
      email,
      password,
      first_name,
      last_name,
      user_type,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/user-management/logout/");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.user_type === "admin";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
