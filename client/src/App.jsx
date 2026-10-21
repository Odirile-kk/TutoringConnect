
// Main application shell for Tutoring Connect.
//
// Handles:
// - User login session
// - JWT session validation
// - Client dashboard
// - Student area
// - Tutor area
// - Profile
// - Admin dashboard
// - Client/Admin toggle
// - Logout
// - Frontend protection of admin functionality

import React, { useEffect, useState } from "react";


import AdminArea from "./components/AdminArea.jsx";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import StudentArea from "./components/StudentArea.jsx";
import TutorArea from "./components/TutorArea.jsx";
import TutorManagement from "./components/Tutormanagement.jsx";

import "./Style.css";

import { api } from "./api.js";


// ============================================================
// NORMALISE USER DATA
// ============================================================
// Different endpoints may return either:
//   id
// or:
//   _id
//
// This function makes sure the frontend always has:
//   user.id
//
// This is important because TutorArea.jsx uses user.id.

function normaliseUser(user) {

  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id || user._id,
  };
}


export default function App() {

  // ============================================================
  // CURRENT USER
  // ============================================================

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return normaliseUser(
        JSON.parse(savedUser)
      );

    } catch {

      return null;

    }

  });


  // ============================================================
  // CURRENT PAGE
  // ============================================================

  const [page, setPage] =
    useState("dashboard");


  // ============================================================
  // CLIENT / ADMIN MODE
  // ============================================================
  //
  // Only administrators can use this.
  //
  // Admins can switch between:
  //
  // Client Dashboard
  // Admin Dashboard

  const [dashboardMode, setDashboardMode] =
    useState("client");


  // ============================================================
  // SESSION CHECKING
  // ============================================================

  const [checkingSession, setCheckingSession] =
    useState(true);


  // ============================================================
  // VALIDATE EXISTING LOGIN SESSION
  // ============================================================

  useEffect(() => {

    async function checkSession() {

      const token =
        localStorage.getItem("token");


      // No JWT means the user is not logged in.

      if (!token) {

        setCheckingSession(false);

        return;

      }


      try {

        // The /me endpoint is protected by
        // server-side JWT authentication.

        const currentUser =
          await api("/me");


        const verifiedUser =
          normaliseUser(currentUser);


        // Store the verified user.

        localStorage.setItem(
          "user",
          JSON.stringify(verifiedUser)
        );


        setUser(verifiedUser);


        // Administrators start in Client mode.

        if (verifiedUser.role === "admin") {

          setDashboardMode("client");

          setPage("dashboard");

        }

      } catch (error) {

        // Token is invalid or expired.

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

      } finally {

        setCheckingSession(false);

      }

    }


    checkSession();

  }, []);


  // ============================================================
  // LOGIN SUCCESS
  // ============================================================

  function handleLogin(response) {

    const loggedInUser =
      normaliseUser(response.user);


    // Save JWT.

    localStorage.setItem(
      "token",
      response.token
    );


    // Save user.

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );


    // Update React state.

    setUser(loggedInUser);


    // Always start in Client mode.

    setDashboardMode("client");

    setPage("dashboard");

  }


  // ============================================================
  // LOGOUT
  // ============================================================

  function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    setPage("dashboard");

    setDashboardMode("client");

  }


  // ============================================================
  // CLIENT DASHBOARD
  // ============================================================

  function openClientDashboard() {

    setDashboardMode("client");

    setPage("dashboard");

  }


  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================

  function openAdminDashboard() {

    // Frontend protection.

    if (!user || user.role !== "admin") {

      setDashboardMode("client");

      setPage("dashboard");

      return;

    }


    setDashboardMode("admin");

    setPage("admin");

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (checkingSession) {

    return (
      <main>

        <h2>
          Loading Tutoring Connect...
        </h2>

        <p>
          Checking your login session.
        </p>

      </main>
    );

  }


  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!user) {

    return (
      <Auth
        onLogin={handleLogin}
      />
    );

  }


  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header>

        <div>

          <h1>
            Tutoring Connect
          </h1>

          <p>
            Welcome,{" "}
            <strong>
              {user.name}
            </strong>
          </p>

        </div>


        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav>

          {/* Client Dashboard */}

          <button
            onClick={openClientDashboard}
          >
            Dashboard
          </button>


          {/* Student Navigation */}

          {user.role === "student" && (

            <button
              onClick={() =>
                setPage("student")
              }
            >
              Find Tutor
            </button>

          )}


          {/* Tutor Navigation */}

          {user.role === "tutor" && (

            <button
              onClick={() =>
                setPage("tutor")
              }
            >
              Tutor Area
            </button>

          )}


          {/* Profile */}

          <button
            onClick={() =>
              setPage("profile")
            }
          >
            Profile
          </button>


          {/* ==================================================
              CLIENT / ADMIN TOGGLE
          ================================================== */}

          {user.role === "admin" && (

            <div className="dashboard-toggle">

              <span>
                Dashboard:
              </span>


              <button
                className={
                  dashboardMode === "client"
                    ? "active-toggle"
                    : ""
                }
                onClick={
                  openClientDashboard
                }
              >
                Client
              </button>


              <button
                className={
                  dashboardMode === "admin"
                    ? "active-toggle"
                    : ""
                }
                onClick={
                  openAdminDashboard
                }
              >
                Admin
              </button>

            </div>

          )}


          {/* Logout */}

          <button
            onClick={logout}
          >
            Logout
          </button>

        </nav>

      </header>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <main>


        {/* ==================================================
            CLIENT DASHBOARD
        ================================================== */}

        {page === "dashboard" && (

          <Dashboard
            user={user}
          />

        )}


        {/* ==================================================
            STUDENT AREA
        ================================================== */}

        {page === "student" &&
          user.role === "student" && (

            <StudentArea />

        )}


        {/* ==================================================
            TUTOR AREA
        ================================================== */}

        {page === "tutor" &&
          user.role === "tutor" && (

            <TutorArea
              user={user}
            />

        )}


        {/* ==================================================
            PROFILE
        ================================================== */}

        {page === "profile" && (

          <Profile
            user={user}
            setUser={setUser}
          />

        )}


        {/* ==================================================
            ADMIN AREA
        ================================================== */}

        {page === "admin" &&
          user.role === "admin" &&
          dashboardMode === "admin" && (

            <AdminArea />

        )}

      </main>

    </>
  );

}
