import React, { useState } from "react";

import AdminArea from "./components/AdminArea.jsx";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import StudentArea from "./components/StudentArea.jsx";
import TutorArea from "./components/TutorArea.jsx";
import TutorManagement from "./components/Tutormanagement.jsx";

import "./Style.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogin(response) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    setUser(response.user);
    setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPage("dashboard");
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const navigation = [
    {
      label: "Dashboard",
      page: "dashboard",
      icon: "▦",
    },

    ...(user.role === "student"
      ? [
          {
            label: "Find Tutor",
            page: "student",
            icon: "⌕",
          },
        ]
      : []),

    ...(user.role === "tutor"
      ? [
          {
            label: "Tutor Area",
            page: "tutor",
            icon: "▤",
          },
        ]
      : []),

    ...(user.role === "admin"
      ? [
          {
            label: "Administration",
            page: "admin",
            icon: "⚙",
          },
        ]
      : []),

    ...(["admin", "tutor"].includes(user.role)
      ? [
          {
            label: "Tutor Management",
            page: "tutorManagement",
            icon: "♧",
          },
        ]
      : []),

    {
      label: "My Profile",
      page: "profile",
      icon: "◉",
    },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    student: "Find Tutor",
    tutor: "Tutor Area",
    admin: "Administration",
    tutorManagement: "Tutor Management",
    profile: "My Profile",
  };

  function navigate(destination) {
    setPage(destination);
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard user={user} />;

      case "student":
        return user.role === "student"
          ? <StudentArea />
          : <Dashboard user={user} />;

      case "tutor":
        return user.role === "tutor"
          ? <TutorArea user={user} />
          : <Dashboard user={user} />;

      case "admin":
        return user.role === "admin"
          ? <AdminArea user={user} />
          : <Dashboard user={user} />;

      case "tutorManagement":
        return ["admin", "tutor"].includes(user.role)
          ? <TutorManagement user={user} />
          : <Dashboard user={user} />;

      case "profile":
        return <Profile user={user} setUser={setUser} />;

      default:
        return <Dashboard user={user} />;
    }
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}

      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">TC</div>

          <div>
            <h2>Tutoring</h2>
            <span>Connect</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <button
              key={item.page}
              className={`sidebar-link ${
                page === item.page ? "active" : ""
              }`}
              onClick={() => navigate(item.page)}
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="sidebar-link logout-link"
            onClick={logout}
          >
            <span className="sidebar-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Application */}

      <div className="app-main">

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="menu-toggle"
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            <div>
              <h1>{pageTitles[page] || "Dashboard"}</h1>

              <p>
                Welcome back to Tutoring Connect
              </p>
            </div>

          </div>

          <div className="topbar-right">

            <div className="user-information">
              <strong>
                {user.name || "User"}
              </strong>

              <span>
                {user.role}
              </span>
            </div>

            <div className="user-avatar">
              {(user.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        <main className="page-content">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}