
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export async function request(path, options = {}) {
  const token = localStorage.getItem("tc_token");

  let res;

  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to the server at ${API}. Check that your backend is running.`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const responseText = await res.text();

  let data;

  if (contentType.includes("application/json")) {
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(
        `The server returned invalid JSON (${res.status}) for ${path}.`
      );
    }
  } else {
    const preview = responseText
      .replace(/\s+/g, " ")
      .slice(0, 160);

    throw new Error(
      `Expected JSON but received ${contentType || "an unknown content type"} ` +
      `(${res.status}) from ${path}. Response: ${preview || "empty response"}`
    );
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status}).`);
  }

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
    Boolean(localStorage.getItem("tc_token"))
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
    qualifications
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

