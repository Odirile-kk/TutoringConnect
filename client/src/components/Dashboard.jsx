import React from "react";
import Bookings from "./Bookings.jsx";
import "./Dashboard.css";

export default function Dashboard({ user }) {
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