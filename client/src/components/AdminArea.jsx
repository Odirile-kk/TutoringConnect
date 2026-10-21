import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import Bookings from "./Bookings.jsx";
import "./AdminArea.css";
import TutorScheduling from "./Tutorscheduling.jsx";
import "./Bookings.css";

export default function AdminArea({ user }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [subjectName, setSubjectName] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const results = await Promise.allSettled([
      api("/admin/stats"),
      api("/admin/users"),
      api("/subjects"),
    ]);

    const errors = [];

    if (results[0].status === "fulfilled") {
      setStats(results[0].value);
    } else {
      errors.push("Unable to load statistics.");
    }

    if (results[1].status === "fulfilled") {
      setUsers(
        Array.isArray(results[1].value)
          ? results[1].value
          : []
      );
    } else {
      errors.push("Unable to load users.");
    }

    if (results[2].status === "fulfilled") {
      setSubjects(
        Array.isArray(results[2].value)
          ? results[2].value
          : []
      );
    } else {
      errors.push("Unable to load subjects.");
    }

    setMessage(errors.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createSubject(event) {
    event.preventDefault();

    if (!subjectName.trim()) {
      setMessage("Please enter a subject name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await api("/subjects", {
        method: "POST",
        body: JSON.stringify({
          name: subjectName.trim(),
        }),
      });

      setSubjectName("");
      await load();
      setMessage("Subject created successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(id, role) {
    setSaving(true);
    setMessage("");

    try {
      await api(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });

      await load();
      setMessage("User role updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const statisticLabels = {
    users: "Total Users",
    students: "Students",
    tutors: "Tutors",
    subjects: "Subjects",
    bookings: "Total Bookings",
    pendingBookings: "Pending Bookings",
    completedBookings: "Completed Bookings",
  };

  const navigationTabs = [
  { id: "overview", label: "Overview" },
  { id: "subjects", label: "Subjects" },
  { id: "users", label: "Users" },
  { id: "bookings", label: "Booking Management" },
  { id: "scheduling", label: "Tutor Scheduling" },
];

  return (
    <div className="admin-container">

      <section className="admin-header">
        <div>
          <span className="admin-subtitle">
            TUTORING CONNECT
          </span>

          <h2>Administration Dashboard</h2>

          <p>
            Manage users, subjects, bookings and
            platform information.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={load}
          disabled={loading || saving}
        >
          Refresh Data
        </button>
      </section>

      <nav className="admin-tabs" aria-label="Administration sections">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id ? "selected" : ""
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {message && (
        <div className="admin-message" role="status">
          {message}
        </div>
      )}

      {loading && <p>Loading administration data...</p>}

      {activeTab === "overview" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h3>Platform Overview</h3>
            <p>
              Current information from Tutoring Connect.
            </p>
          </div>

          <div className="admin-stats-grid">
            {stats &&
              Object.entries(stats).map(([key, value]) => (
                <article
                  className="admin-stat-card"
                  key={key}
                >
                  <span>
                    {statisticLabels[key] ||
                      key.replace(/([A-Z])/g, " $1")}
                  </span>

                  <strong>{value}</strong>
                </article>
              ))}
          </div>

          {!stats && !loading && (
            <p>Statistics are currently unavailable.</p>
          )}
        </section>
      )}

      {activeTab === "subjects" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h3>Subject Management</h3>
            <p>
              Create and view subjects offered
              through the platform.
            </p>
          </div>

          <form
            className="admin-subject-form"
            onSubmit={createSubject}
          >
            <input
              type="text"
              placeholder="Enter subject name"
              value={subjectName}
              onChange={(event) =>
                setSubjectName(event.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={saving}
            >
              Create Subject
            </button>
          </form>

          <div className="admin-subject-grid">
            {subjects.map((subject) => (
              <article
                className="admin-subject-card"
                key={subject._id}
              >
                <h4>{subject.name}</h4>

                <p>
                  {subject.description ||
                    "No description available."}
                </p>
              </article>
            ))}
          </div>

          {!loading && subjects.length === 0 && (
            <p>No subjects available.</p>
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h3>User Management</h3>
            <p>
              View registered users and manage
              their account roles.
            </p>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Account Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((account) => (
                  <tr key={account._id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>

                    <td>
                      <select
                        value={account.role}
                        disabled={saving}
                        onChange={(event) =>
                          changeRole(
                            account._id,
                            event.target.value
                          )
                        }
                      >
                        <option value="student">
                          Student
                        </option>

                        <option value="tutor">
                          Tutor
                        </option>

                        <option value="admin">
                          Administrator
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && users.length === 0 && (
            <p>No registered users found.</p>
          )}
        </section>
      )}

      {activeTab === "bookings" && (
  <section className="admin-section">
    <div className="admin-section-heading">
      <h3>Booking Management</h3>

      <p>
        View and manage tutoring bookings
        across the platform.
      </p>
    </div>

    <Bookings user={user} />
  </section>
)}


      {/* Tutor Scheduling */}
      {activeTab === "scheduling" && (
        <section className="admin-section">
          <TutorScheduling user={user} />
        </section>
      )}

    </div>
  );
}