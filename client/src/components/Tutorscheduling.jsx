import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../api.js";
import "./TutorScheduling.css";

const activeStatuses = ["Pending", "Confirmed"];

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

export default function TutorScheduling({ user }) {
  const [tutors, setTutors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api("/availability"),
      api("/bookings"),
      ...(isAdmin ? [api("/tutors")] : []),
    ]);

    const errors = [];

    if (results[0].status === "fulfilled") {
      setSlots(
        Array.isArray(results[0].value)
          ? results[0].value
          : []
      );
    } else {
      setSlots([]);
      errors.push("Unable to load tutor availability.");
    }

    if (results[1].status === "fulfilled") {
      setBookings(
        Array.isArray(results[1].value)
          ? results[1].value
          : []
      );
    } else {
      setBookings([]);
      errors.push("Unable to load bookings.");
    }

    if (isAdmin) {
      if (results[2].status === "fulfilled") {
        setTutors(
          Array.isArray(results[2].value)
            ? results[2].value
            : []
        );
      } else {
        setTutors([]);
        errors.push("Unable to load tutors.");
      }
    }

    setError(errors.join(" "));
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const schedule = useMemo(() => {
    return slots
      .filter((slot) => {
        const tutorId = getId(slot.tutor);

        const matchesTutor =
          !selectedTutor || tutorId === selectedTutor;

        const matchesDate =
          !selectedDate || slot.date === selectedDate;

        return matchesTutor && matchesDate;
      })
      .map((slot) => {
        const matchingBooking = bookings.find(
          (booking) =>
            getId(booking.availability) === getId(slot) &&
            activeStatuses.includes(booking.status)
        );

        return {
          ...slot,
          booking: matchingBooking || null,
        };
      })
      .sort((a, b) => {
        return (
          String(a.date).localeCompare(String(b.date)) ||
          String(a.startTime).localeCompare(
            String(b.startTime)
          )
        );
      });
  }, [slots, bookings, selectedTutor, selectedDate]);

  const conflicts = useMemo(() => {
    const detected = new Set();

    const activeBookings = bookings.filter(
      (booking) => activeStatuses.includes(booking.status)
    );

    for (let first = 0; first < activeBookings.length; first++) {
      for (
        let second = first + 1;
        second < activeBookings.length;
        second++
      ) {
        const current = activeBookings[first];
        const next = activeBookings[second];

        const sameTutor =
          getId(current.tutor) === getId(next.tutor);

        const sameDate = current.date === next.date;

        const overlaps =
          current.startTime < next.endTime &&
          current.endTime > next.startTime;

        if (sameTutor && sameDate && overlaps) {
          detected.add(getId(current.availability));
          detected.add(getId(next.availability));
        }
      }
    }

    return detected;
  }, [bookings]);

  const statistics = useMemo(() => {
    const today = getLocalDate();

    return {
      total: schedule.length,

      available: schedule.filter(
        (slot) => slot.available && !slot.booking
      ).length,

      booked: schedule.filter(
        (slot) => Boolean(slot.booking)
      ).length,

      today: schedule.filter(
        (slot) =>
          slot.date === today && Boolean(slot.booking)
      ).length,

      conflicts: schedule.filter(
        (slot) => conflicts.has(getId(slot))
      ).length,
    };
  }, [schedule, conflicts]);

  return (
    <div className="tutor-scheduling">

      <div className="schedule-heading">
        <div>
          <span>TUTORING CONNECT • SCHEDULING</span>

          <h2>Tutor Scheduling</h2>

          <p>
            Monitor tutor availability, scheduled sessions
            and potential booking conflicts.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
        >
          Refresh Schedule
        </button>
      </div>

      {error && (
        <div className="schedule-error" role="alert">
          {error}
        </div>
      )}

      <div className="schedule-statistics">

        <article className="schedule-stat-card">
          <span>Total Time Slots</span>
          <strong>{statistics.total}</strong>
        </article>

        <article className="schedule-stat-card available">
          <span>Available Slots</span>
          <strong>{statistics.available}</strong>
        </article>

        <article className="schedule-stat-card booked">
          <span>Booked Slots</span>
          <strong>{statistics.booked}</strong>
        </article>

        <article className="schedule-stat-card today">
          <span>Today's Sessions</span>
          <strong>{statistics.today}</strong>
        </article>

        <article className="schedule-stat-card conflict">
          <span>Conflicts</span>
          <strong>{statistics.conflicts}</strong>
        </article>

      </div>

      <section className="schedule-panel">

        <div className="schedule-panel-heading">
          <div>
            <h3>Schedule Filters</h3>
            <p>
              Select a tutor or date to narrow the schedule.
            </p>
          </div>
        </div>

        <div className="schedule-filters">

          {isAdmin && (
            <select
              value={selectedTutor}
              onChange={(event) =>
                setSelectedTutor(event.target.value)
              }
            >
              <option value="">All Tutors</option>

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
          )}

          <input
            type="date"
            aria-label="Schedule date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
          />

          <button
            type="button"
            onClick={() => {
              setSelectedTutor("");
              setSelectedDate("");
            }}
          >
            Clear Filters
          </button>

        </div>
      </section>

      <section className="schedule-panel">

        <div className="schedule-panel-heading">
          <div>
            <h3>Tutor Timetable</h3>
            <p>
              Showing {schedule.length} scheduled time slots.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading tutor schedules...</p>
        ) : (
          <div className="schedule-table-wrapper">

            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tutor</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {schedule.map((slot) => {
                  const hasConflict = conflicts.has(
                    getId(slot)
                  );

                  const status = hasConflict
                    ? "Conflict"
                    : slot.booking
                      ? "Booked"
                      : slot.available
                        ? "Available"
                        : "Reserved";

                  return (
                    <tr key={slot._id}>
                      <td>{slot.date}</td>

                      <td>{getName(slot.tutor)}</td>

                      <td>{slot.startTime}</td>

                      <td>{slot.endTime}</td>

                      <td>
                        {slot.booking
                          ? getName(slot.booking.student)
                          : "—"}
                      </td>

                      <td>
                        {slot.booking
                          ? getName(slot.booking.subject)
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`schedule-status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {schedule.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="schedule-empty"
                    >
                      No tutor availability found for
                      the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        )}
      </section>
    </div>
  );
}