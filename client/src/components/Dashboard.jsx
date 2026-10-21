// Client/Student dashboard.
//
// Handles:
// - Welcome section
// - Account information
// - Upcoming booking summary
// - Booking overview
// - Client navigation information

import React, {
  useEffect,
  useState,
} from "react";

import Bookings from "./Bookings.jsx";
import "./Dashboard.css";

import { api } from "../api.js";


export default function Dashboard({ user }) {

  const [bookings, setBookings] =
    useState([]);

  const [message, setMessage] =
    useState("");


  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  useEffect(() => {

    async function loadBookings() {

      // Tutors/admins do not need the student
      // upcoming booking summary here.

      if (user.role !== "student") {

        return;

      }


      try {

        const data =
          await api("/bookings");


        setBookings(
          Array.isArray(data)
            ? data
            : []
        );


      } catch (error) {

        setMessage(
          error.message
        );

      }

    }


    loadBookings();

  }, [user.role]);


  // ============================================================
  // UPCOMING BOOKINGS
  // ============================================================

  const upcomingBookings =
    bookings
      .filter(
        (booking) =>
          booking.status === "Pending" ||
          booking.status === "Confirmed"
      )
      .slice(0, 3);


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <section>


      {/* ======================================================
          WELCOME
      ====================================================== */}

      <div className="card">

        <h2>
          Welcome, {user.name}
        </h2>

        <p>
          Welcome to your Tutoring Connect dashboard.
        </p>

        <p>
          Use the navigation above to manage your
          tutoring activities, profile and bookings.
        </p>

      </div>


      {/* ======================================================
          ACCOUNT INFORMATION
      ====================================================== */}

      <div className="card">

        <h3>
          Account Information
        </h3>

        <p>
          <strong>Name:</strong>{" "}
          {user.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user.role}
        </p>

      </div>


      {/* ======================================================
          UPCOMING BOOKINGS
      ====================================================== */}

      {user.role === "student" && (

        <div className="card">

          <h3>
            Upcoming Bookings
          </h3>


          {message && (

            <p className="error-message">
              {message}
            </p>

          )}


          {upcomingBookings.length === 0 ? (

            <p>
              You currently have no upcoming bookings.
            </p>

          ) : (

            <div>

              {upcomingBookings.map(
                (booking) => (

                  <div
                    className="row"
                    key={booking._id}
                  >

                    <div>

                      <strong>
                        {booking.subject?.name ||
                          "Tutoring Session"}
                      </strong>

                      <p>
                        Date:{" "}
                        {booking.date}
                      </p>

                      <p>
                        Time:{" "}
                        {booking.startTime}
                        {" - "}
                        {booking.endTime}
                      </p>

                      <p>
                        Tutor:{" "}
                        {booking.tutor?.name ||
                          "Tutor"}
                      </p>

                      <p>
                        Status:{" "}
                        {booking.status}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}


      {/* ======================================================
          STUDENT INFORMATION
      ====================================================== */}

      {user.role === "student" && (

        <div className="card">

          <h3>
            Find a Tutor
          </h3>

          <p>
            Use the Find Tutor section to search
            for tutors, view their availability and
            create a Microsoft Teams tutoring booking.
          </p>

        </div>

      )}


      {/* ======================================================
          EXISTING BOOKING MANAGEMENT
      ====================================================== */}

      {user.role === "student" && (

        <Bookings />

      )}

    </section>

  );

  const role = user.role;

  const displayName = user.name || "User";

  const dashboardCards = [
    {
      title: "Upcoming Sessions",
      value: "—",
      icon: "📅",
      description: "Your scheduled tutoring sessions",
      color: "blue",
    },
    {
      title: "Total Bookings",
      value: "—",
      icon: "📚",
      description: "Your tutoring bookings",
      color: "orange",
    },
    {
      title: "Available Slots",
      value: "—",
      icon: "🕒",
      description: "Available tutoring time slots",
      color: "green",
    },
    {
      title: "Completed Sessions",
      value: "—",
      icon: "✅",
      description: "Successfully completed sessions",
      color: "purple",
    },
  ];

  return (
    <div className="dashboard-container">

      {/* Welcome Section */}

      <section className="dashboard-welcome">
        <div>
          <span className="welcome-label">
            TUTORING CONNECT
          </span>

          <h2>
            Welcome back, {displayName}! 👋
          </h2>

          <p>
            Manage your tutoring activities, track bookings,
            and stay organised.
          </p>
        </div>

        <div className="welcome-badge">
          {role.toUpperCase()}
        </div>
      </section>

      {/* Statistics Cards */}

      <section className="dashboard-stats">
        {dashboardCards.map((card) => (
          <div
            className={`stat-card ${card.color}`}
            key={card.title}
          >
            <div className="stat-card-top">
              <span className="stat-icon">
                {card.icon}
              </span>
            </div>

            <h3>{card.title}</h3>

            <div className="stat-value">
              {card.value}
            </div>

            <p>{card.description}</p>
          </div>
        ))}
      </section>

      {/* Dashboard Content */}

      <section className="dashboard-content">

        <div className="dashboard-panel">
          <div className="panel-heading">
            <h3>Upcoming Sessions</h3>
            <span>Session Overview</span>
          </div>

          <div className="empty-state">
            <div className="empty-icon">📅</div>

            <h4>No sessions to display</h4>

            <p>
              Your upcoming tutoring sessions will
              appear here once connected.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <h3>Quick Overview</h3>
            <span>Account Information</span>
          </div>

          <div className="overview-item">
            <span>Account Name</span>
            <strong>{displayName}</strong>
          </div>

          <div className="overview-item">
            <span>Account Role</span>
            <strong>{role}</strong>
          </div>

          <div className="overview-item">
            <span>Platform</span>
            <strong>Tutoring Connect</strong>
          </div>

          <div className="overview-item">
            <span>Account Status</span>
            <strong className="status-active">
              Active Session
            </strong>
          </div>
        </div>

      </section>

      {/* Student Booking Section */}

      {role === "student" && (
        <section className="dashboard-bookings">
          <div className="section-heading">
            <h3>My Bookings</h3>
            <p>
              View and manage your tutoring bookings.
            </p>
          </div>

          <Bookings user={user} />
        </section>
      )}

    </div>
  );
}