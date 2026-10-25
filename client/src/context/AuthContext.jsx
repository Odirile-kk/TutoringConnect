import React, { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);
export const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export async function request(path, options = {}) {
  const token = localStorage.getItem("tc_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res
    .json()
    .catch(() => ({ message: "Unexpected server response." }));
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tc_user"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("tc_token")),
  );
  useEffect(() => {
    if (!localStorage.getItem("tc_token")) return;
    request("/auth/me")
      .then((d) => {
        setUser(d.user);
        localStorage.setItem("tc_user", JSON.stringify(d.user));
      })
      .catch(() => {
        localStorage.removeItem("tc_token");
        localStorage.removeItem("tc_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const d = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("tc_token", d.token);
    localStorage.setItem("tc_user", JSON.stringify(d.user));
    setUser(d.user);
    return d.user;
  };
  const register = async (
    name,
    email,
    password,
    role,
    subjects,
    qualifications,
  ) => {
    const d = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        subjects,
        qualifications,
      }),
    });
    localStorage.setItem("tc_token", d.token);
    localStorage.setItem("tc_user", JSON.stringify(d.user));
    setUser(d.user);
    return d.user;
  };
  const logout = () => {
    localStorage.removeItem("tc_token");
    localStorage.removeItem("tc_user");
    setUser(null);
  };
  const refresh = async () => {
    const d = await request("/auth/me");
    setUser(d.user);
    localStorage.setItem("tc_user", JSON.stringify(d.user));
    return d.user;
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
