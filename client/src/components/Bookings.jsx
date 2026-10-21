import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../api.js";
import "./Bookings.css";

const activeStatuses = ["Pending", "Confirmed"];

const initialFilters = {
  search: "",
  status: "",
  subject: "",
  tutor: "",
  student: "",
  date: "",
};

function getId(value) {
  return String(value?._id || value?.id || value || "");
}

function getName(value) {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;

  return value.name || "Unknown";
}

function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Bookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const [editingBooking, setEditingBooking] = useState(null);

  const [editForm, setEditForm] = useState({
    tutor: "",
    availability: "",
  });

  const isAdmin = user?.role === "admin";
  const isTutor = user?.role === "tutor";
  const isStudent = user?.role === "student";

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api("/bookings");

      setBookings(
        Array.isArray(response) ? response : []
      );
    } catch (error) {
      setMessage(
        error.message || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateFilter(field, value) {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function clearFilters() {
    setFilters({ ...initialFilters });
  }

  async function updateStatus(id, status) {
    const confirmed = window.confirm(
      `Are you sure you want to mark this booking as ${status}?`
    );

    if (!confirmed) return;

    setUpdating(true);
    setMessage("");
    setSuccess("");

    try {
      await api(`/bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      await load();

      setSuccess(`Booking successfully marked as ${status}.`);
    } catch (error) {
      setMessage(
        error.message || "Unable to update booking."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function openEdit(booking) {
    setMessage("");
    setSuccess("");

    setEditingBooking(booking);

    setEditForm({
      tutor: getId(booking.tutor),
      availability: "",
    });

    try {
      const requests = [
        api("/availability"),
      ];

      if (isAdmin) {
        requests.push(api("/tutors"));
      }

      const results = await Promise.all(requests);

      setAvailability(
        Array.isArray(results[0]) ? results[0] : []
      );

      if (isAdmin) {
        setTutors(
          Array.isArray(results[1]) ? results[1] : []
        );
      }
    } catch (error) {
      setMessage(
        error.message || "Unable to load scheduling information."
      );
    }
  }

  function closeEdit() {
    setEditingBooking(null);

    setEditForm({
      tutor: "",
      availability: "",
    });
  }

  const availableSlots = useMemo(() => {
    if (!editingBooking) return [];

    return availability.filter((slot) => {
      const matchesTutor =
        getId(slot.tutor) === editForm.tutor;

      return (
        matchesTutor &&
        slot.available === true &&
        String(slot.date).slice(0, 10) >= getLocalDate()
      );
    });
  }, [availability, editForm.tutor, editingBooking]);

  async function saveBooking(event) {
    event.preventDefault();

    if (!editingBooking || !editForm.availability) {
      setMessage("Please select an available time slot.");
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => getId(slot) === editForm.availability
    );

    if (!selectedSlot) {
      setMessage("The selected time slot is invalid.");
      return;
    }

    setUpdating(true);
    setMessage("");
    setSuccess("");

    try {
      await api(
        `/bookings/${editingBooking._id}/reschedule`,
        {
          method: "PUT",
          body: JSON.stringify({
            tutor: editForm.tutor,
            availability: selectedSlot._id,
            date: selectedSlot.date,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          }),
        }
      );

      closeEdit();

      await load();

      setSuccess("Booking successfully updated.");
    } catch (error) {
      setMessage(
        error.message || "Unable to update booking."
      );
    } finally {
      setUpdating(false);
    }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const student = getName(booking.student);
      const tutor = getName(booking.tutor);
      const subject = getName(booking.subject);

      const searchableText = [
        student,
        tutor,
        subject,
        booking.status,
        booking.date,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(
          filters.search.toLowerCase()
        ) &&
        (!filters.status ||
          booking.status === filters.status) &&
        (!filters.subject ||
          subject === filters.subject) &&
        (!filters.tutor ||
          tutor === filters.tutor) &&
        (!filters.student ||
          student === filters.student) &&
        (!filters.date ||
          String(booking.date).slice(0, 10) ===
            filters.date)
      );
    });
  }, [bookings, filters]);

  const statistics = useMemo(() => {
    return {
      total: bookings.length,

      today: bookings.filter(
        (booking) =>
          String(booking.date).slice(0, 10) ===
          getLocalDate()
      ).length,

      pending: bookings.filter(
        (booking) => booking.status === "Pending"
      ).length,

      confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed"
      ).length,

      completed: bookings.filter(
        (booking) => booking.status === "Completed"
      ).length,

      cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled"
      ).length,
    };
  }, [bookings]);

  const subjects = [
    ...new Set(
      bookings.map((booking) =>
        getName(booking.subject)
      )
    ),
  ].sort();

  const tutorNames = [
    ...new Set(
      bookings.map((booking) =>
        getName(booking.tutor)
      )
    ),
  ].sort();

  const students = [
    ...new Set(
      bookings.map((booking) =>
        getName(booking.student)
      )
    ),
  ].sort();

  return (
    <div className="booking-management">

      <div className="booking-statistics">
        {[
          ["Total Bookings", statistics.total, ""],
          ["Today's Bookings", statistics.today, "today"],
          ["Pending", statistics.pending, "pending"],
          ["Confirmed", statistics.confirmed, "confirmed"],
          ["Completed", statistics.completed, "completed"],
          ["Cancelled", statistics.cancelled, "cancelled"],
        ].map(([label, value, style]) => (
          <article
            key={label}
            className={`booking-stat-card ${style}`}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <section className="booking-filter-panel">
        <div className="booking-section-header">
          <div>
            <h3>Search & Filter Bookings</h3>
            <p>
              Find bookings by student, tutor,
              subject, date or status.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading || updating}
          >
            Refresh
          </button>
        </div>

        <div className="booking-filters">
          <input
            type="search"
            placeholder="Search bookings..."
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
          />

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value)
            }
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.subject}
            onChange={(event) =>
              updateFilter("subject", event.target.value)
            }
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            value={filters.tutor}
            onChange={(event) =>
              updateFilter("tutor", event.target.value)
            }
          >
            <option value="">All Tutors</option>
            {tutorNames.map((tutor) => (
              <option key={tutor} value={tutor}>
                {tutor}
              </option>
            ))}
          </select>

          <select
            value={filters.student}
            onChange={(event) =>
              updateFilter("student", event.target.value)
            }
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student} value={student}>
                {student}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="Filter by booking date"
            value={filters.date}
            onChange={(event) =>
              updateFilter("date", event.target.value)
            }
          />

          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="booking-table-panel">
        <div className="booking-section-header">
          <div>
            <h3>Booking Records</h3>
            <p>
              Showing {filteredBookings.length} of{" "}
              {bookings.length} bookings
            </p>
          </div>
        </div>

        {message && (
          <p className="booking-message" role="alert">
            {message}
          </p>
        )}

        {success && (
          <p className="booking-success" role="status">
            {success}
          </p>
        )}

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.date}</td>

                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>

                    <td>{getName(booking.student)}</td>
                    <td>{getName(booking.tutor)}</td>
                    <td>{getName(booking.subject)}</td>

                    <td>
                      <span
                        className={`booking-status ${String(
                          booking.status || ""
                        ).toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      <div className="booking-actions">

                        {booking.status === "Pending" &&
                          (isAdmin || isTutor) && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  booking._id,
                                  "Confirmed"
                                )
                              }
                            >
                              Confirm
                            </button>
                          )}

                        {(isAdmin || isStudent) &&
  activeStatuses.includes(booking.status) && (
    <button
      type="button"
      disabled={updating}
      onClick={() => openEdit(booking)}
    >
      Edit
    </button>
  )}

                        {activeStatuses.includes(
                          booking.status
                        ) && (
                          <button
                            type="button"
                            className="cancel-button"
                            disabled={updating}
                            onClick={() =>
                              updateStatus(
                                booking._id,
                                "Cancelled"
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}

                        {booking.status === "Confirmed" &&
                          (isAdmin || isTutor) && (
                            <button
                              type="button"
                              className="complete-button"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  booking._id,
                                  "Completed"
                                )
                              }
                            >
                              Complete
                            </button>
                          )}

                        {!activeStatuses.includes(
                          booking.status
                        ) && (
                          <span className="no-action">
                            No actions
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="booking-empty"
                    >
                      No bookings match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingBooking && (
        <div className="booking-modal-overlay">
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-edit-title"
          >
            <h3 id="booking-edit-title">
              Edit Booking
            </h3>

            <p>
              Select a tutor and an available time slot
              to reschedule this booking.
            </p>

            <form onSubmit={saveBooking}>

              {isAdmin && (
                <div className="booking-form-group">
                  <label htmlFor="booking-tutor">
                    Tutor
                  </label>

                  <select
                    id="booking-tutor"
                    value={editForm.tutor}
                    onChange={(event) =>
                      setEditForm({
                        tutor: event.target.value,
                        availability: "",
                      })
                    }
                  >
                    <option value="">
                      Select Tutor
                    </option>

                    {tutors.map((profile) => {
                      const tutor = profile.user;

                      return (
                        <option
                          key={getId(tutor)}
                          value={getId(tutor)}
                        >
                          {getName(tutor)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="booking-form-group">
                <label htmlFor="booking-slot">
                  Available Time Slots
                </label>

                <select
                  id="booking-slot"
                  required
                  value={editForm.availability}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      availability: event.target.value,
                    }))
                  }
                >
                  <option value="">
                    Select Available Slot
                  </option>

                  {availableSlots.map((slot) => (
                    <option
                      key={slot._id}
                      value={slot._id}
                    >
                      {slot.date} | {slot.startTime} -{" "}
                      {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>

              <div className="booking-modal-actions">
                <button
                  type="button"
                  onClick={closeEdit}
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={
                    updating ||
                    !editForm.availability
                  }
                >
                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}