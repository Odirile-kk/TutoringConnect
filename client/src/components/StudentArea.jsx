// Student dashboard for browsing tutors, checking availability, and creating bookings.
import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import Bookings from "./Bookings.jsx";

export default function StudentArea() {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingRefresh, setBookingRefresh] = useState(0);

  useEffect(() => {
    Promise.all([api("/tutors"), api("/subjects")])
      .then(([t, s]) => {
        setTutors(t);
        setSubjects(s);
      })
      .catch((e) => setMessage(e.message));
  }, []);

  async function availability(t) {
  setSelected(t);
  setSubject("");
  setMessage("");
  setSlots([]);

  try {
    const response = await api(
      "/availability?tutor=" + t.user._id
    );

    setSlots(Array.isArray(response) ? response : []);
  } catch (error) {
    setMessage(
      error.message || "Unable to load tutor availability."
    );
  }
}

  async function book(slot) {
  setMessage("");

  if (!selected?.user?._id) {
    setMessage("Please select a tutor first.");
    return;
  }

  if (!subject) {
    setMessage("Please select a subject before booking.");
    return;
  }

  if (!slot.available) {
    setMessage("This time slot is no longer available.");
    return;
  }

  const confirmed = window.confirm(
    `Confirm booking for ${slot.date} from ${slot.startTime} to ${slot.endTime}?`
  );

  if (!confirmed) return;

  setBooking(true);

  try {
    await api("/bookings", {
      method: "POST",
      body: JSON.stringify({
        tutor: selected.user._id,
        subject,
        availability: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }),
    });

    setMessage("Booking created successfully!");

    const updatedSlots = await api(
      "/availability?tutor=" + selected.user._id
    );

    setSlots(
      Array.isArray(updatedSlots) ? updatedSlots : []
    );

    setBookingRefresh((previous) => previous + 1);
  } catch (error) {
    setMessage(
      error.message || "Unable to create booking."
    );
  } finally {
    setBooking(false);
  }
}

  return (
    <>
      <h2>Find Tutor</h2>
      <p>{message}</p>
      <select
  value={subject}
  onChange={(event) => {
    setSubject(event.target.value);
    setMessage("");
  }}
>
  <option value="">Select subject</option>

  {subjects
    .filter((item) => {
      if (!selected) return true;

      return selected.subjects.some(
        (tutorSubject) =>
          String(tutorSubject._id || tutorSubject) ===
          String(item._id)
      );
    })
    .map((item) => (
      <option key={item._id} value={item._id}>
        {item.name}
      </option>
    ))}
</select>

      {tutors.map((t) => (
        <div className="card" key={t._id}>
          <h3>{t.user.name}</h3>
          <p>{t.bio || "No biography added."}</p>
          <p>Subjects: {t.subjects.map((s) => s.name).join(", ")}</p>
          <button onClick={() => availability(t)}>View Availability</button>
        </div>
      ))}

      {selected && (
  <section>
    <h3>Microsoft Teams availability</h3>

    {message && (
      <p role="status" style={{ color: "#142d4e", fontWeight: 600 }}>
        {message}
      </p>
    )}
          {slots
            .filter((x) => x.available)
            .map((x) => (
              <div className="row" key={x._id}>
                {x.date} {x.startTime}-{x.endTime}
                <button
  type="button"
  disabled={booking}
  onClick={() => book(x)}
>
  {booking ? "Booking..." : "Book"}
</button>
              </div>
            ))}
        </section>
      )}
      <Bookings key={bookingRefresh} user={{ role: "student" }} />
    </>
  );
}
