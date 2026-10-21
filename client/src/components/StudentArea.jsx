// Student dashboard: searchable tutor directory, subject filtering, availability and bookings.
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import "../tutor-directory.css";
import Bookings from "./Bookings.jsx";

export default function StudentArea() {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api("/tutors"), api("/subjects")])
      .then(([t, s]) => {
        if (!active) return;
        setTutors(Array.isArray(t) ? t : []);
        setSubjects(Array.isArray(s) ? s : []);
      })
      .catch((e) => {
        if (active) setMessage(e.message || "Could not load tutors and subjects.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredTutors = useMemo(() => {
    const query = tutorSearch.trim().toLowerCase();
    return tutors.filter((t) => {
      const tutorSubjects = Array.isArray(t.subjects) ? t.subjects : [];
      const matchesSubject = !subject || tutorSubjects.some((s) => String(s._id) === String(subject));
      const searchableText = [
        t.user?.name || "",
        t.bio || "",
        ...tutorSubjects.map((s) => s.name || ""),
      ].join(" ").toLowerCase();
      return matchesSubject && (!query || searchableText.includes(query));
    });
  }, [tutors, subject, tutorSearch]);

  async function availability(tutor) {
    setSelected(tutor);
    setSlots([]);
    setMessage("");
    try {
      const data = await api("/availability?tutor=" + encodeURIComponent(tutor.user._id));
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage(e.message || "Could not load availability.");
    }
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
    if (!subject) {
      setMessage("Choose a subject before booking a session.");
      return;
    }
    if (!selected || !selected.subjects?.some((s) => String(s._id) === String(subject))) {
      setMessage("This tutor is not listed for the selected subject. Choose another tutor or subject.");
      return;
    }
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
      setMessage("Booking created successfully.");
      setSlots(await api("/availability?tutor=" + encodeURIComponent(selected.user._id)));
    } catch (e) {
      setMessage(e.message || "Could not create booking.");
    }
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
    <div className="tutor-directory">
      <div className="tutor-directory__intro">
        <span className="tutor-directory__eyebrow">TUTORING CONNECT</span>
        <h2>Find your tutor</h2>
        <p>Search by tutor name or subject, narrow the list, and check available sessions.</p>
      </div>

      {message && <div className="tutor-message" role="status">{message}</div>}
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

      <section className="tutor-filters" aria-label="Search and filter tutors">
        <div className="tutor-filter-field tutor-filter-field--search">
          <label htmlFor="tutor-search">Search tutors</label>
          <input
            id="tutor-search"
            type="search"
            value={tutorSearch}
            onChange={(e) => setTutorSearch(e.target.value)}
            placeholder="Type a tutor name or subject..."
          />
        </div>
        <div className="tutor-filter-field">
          <label htmlFor="subject-filter">Filter by subject</label>
          <select id="subject-filter" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        {(tutorSearch || subject) && (
          <button type="button" className="btn-outline tutor-clear-button" onClick={() => { setTutorSearch(""); setSubject(""); }}>
            Clear filters
          </button>
        )}
      </section>

      <div className="tutor-results-heading">
        <h3>{subject ? `Tutors for ${subjects.find((s) => String(s._id) === String(subject))?.name || "selected subject"}` : "Available tutor profiles"}</h3>
        <span className="tutor-result-count">{loading ? "Loading…" : `${filteredTutors.length} ${filteredTutors.length === 1 ? "tutor" : "tutors"} found`}</span>
      </div>

      {loading ? (
        <div className="card">Loading tutor profiles and subjects…</div>
      ) : filteredTutors.length === 0 ? (
        <div className="card tutor-empty-state">
          <h3>No tutors match those filters</h3>
          <p>Try another name or choose “All subjects”.</p>
          <button type="button" onClick={() => { setTutorSearch(""); setSubject(""); }}>Show all tutors</button>
        </div>
      ) : (
        <div className="tutor-card-grid">
          {filteredTutors.map((t) => (
            <article className={`card tutor-card${selected?._id === t._id ? " tutor-card--selected" : ""}`} key={t._id}>
              <div className="tutor-card__top">
                <div className="tutor-avatar" aria-hidden="true">{(t.user?.name || "T").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
                <div>
                  <h3>{t.user?.name || "Tutor profile"}</h3>
                  <span className="tutor-profile-label">Tutor profile</span>
                </div>
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
              <p className="tutor-bio">{t.bio || "Tutor profile. Contact the tutor through the platform for more details."}</p>
              <div className="tutor-subjects-label">Subjects they can help with</div>
              <div className="tutor-subject-chips">
                {(t.subjects || []).map((s) => <span className="tutor-subject-chip" key={s._id}>{s.name}</span>)}
              </div>
              <button type="button" className="tutor-availability-button" onClick={() => availability(t)}>
                {selected?._id === t._id ? "Refresh availability" : "View availability"}
              </button>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <section className="card tutor-availability-panel">
          <div className="tutor-results-heading">
            <div>
              <span className="tutor-directory__eyebrow">BOOK A SESSION</span>
              <h3>{selected.user?.name}'s availability</h3>
            </div>
            <button type="button" className="btn-outline" onClick={() => { setSelected(null); setSlots([]); }}>Close</button>
          </div>
          {!subject && <p>Choose a subject above before booking a session.</p>}
          {subject && !selected.subjects?.some((s) => String(s._id) === String(subject)) && <p>This tutor does not teach the selected subject. Choose a tutor from the filtered results.</p>}
          {slots.filter((x) => x.available).length === 0 ? (
            <p>No available time slots are listed for this tutor yet.</p>
          ) : (
            <div className="tutor-slot-list">
              {slots.filter((x) => x.available).map((x) => (
                <div className="tutor-slot" key={x._id}>
                  <span><strong>{x.date}</strong><br />{x.startTime}–{x.endTime}</span>
                  <button type="button" disabled={!subject || !selected.subjects?.some((s) => String(s._id) === String(subject))} onClick={() => book(x)}>Book session</button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <Bookings key={bookingRefresh} user={{ role: "student" }} />
    </>
  );
}
