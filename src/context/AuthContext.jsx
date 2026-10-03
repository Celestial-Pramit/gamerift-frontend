import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load the saved user (if any) when the app starts
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("gr_user");
    return saved ? JSON.parse(saved) : null;
  });

  // data = { token, user }
  function saveLogin(data) {
    localStorage.setItem("gr_token", data.token);
    localStorage.setItem("gr_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("gr_token");
    localStorage.removeItem("gr_user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, saveLogin, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
