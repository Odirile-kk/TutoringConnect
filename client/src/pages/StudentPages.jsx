import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, Users, CalendarDays, LayoutDashboard, LogOut, Menu, X, ArrowRight, ShieldCheck, Clock, Star, Search, Plus, CheckCircle2, ChevronDown, UserRound, Settings, ChartNoAxesCombined, BookMarked, CalendarCheck, Trash2, Edit3, Filter, Download } from "lucide-react";
import { useAuth, request } from "../context/AuthContext";
import { Button, PageHead, BookingCard, Empty, RatingForm } from "../components/AppComponents";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ upcoming: [] });
  const [err, setErr] = useState("");
  useEffect(() => {
    request("/dashboard")
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);
  return (
    <>
      <PageHead
        eyebrow="STUDENT SPACE"
        title={`Welcome back, ${user.name.split(" ")[0]} 👋`}
        description="Ready to make progress? Here's what's happening with your learning."
        action={
          <Link to="/subjects" className="btn primary">
            Find a tutor <ArrowRight size={17} />
          </Link>
        }
      />
      <div className="welcome-banner">
        <div>
          <span className="banner-tag">YOUR LEARNING JOURNEY</span>
          <h2>Every expert was once a beginner.</h2>
          <p>Choose a subject, meet a tutor and take the next step.</p>
          <Link to="/subjects" className="banner-link">
            Explore subjects <ArrowRight size={16} />
          </Link>
        </div>
        <div className="banner-art">
          <BookOpen size={58} />
          <span className="art-spark">✦</span>
        </div>
      </div>
      <div className="section-row">
        <div>
          <h2>Upcoming sessions</h2>
          <p>Keep your learning plans on track.</p>
        </div>
        <Link to="/bookings" className="text-link">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      {err && <div className="alert">{err}</div>}
      {data.upcoming?.length ? (
        <div className="booking-preview">
          {data.upcoming.map((b) => (
            <BookingCard key={b._id} booking={b} />
          ))}
        </div>
      ) : (
        <div className="empty-card">
          <div className="empty-icon">
            <CalendarDays size={25} />
          </div>
          <h3>No upcoming sessions yet</h3>
          <p>Your next learning milestone could be one session away.</p>
          <Link className="btn secondary" to="/subjects">
            Browse tutors <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <div className="quick-grid">
        <Link to="/subjects" className="quick-card">
          <span className="quick-icon">
            <BookOpen />
          </span>
          <div>
            <b>Explore subjects</b>
            <p>Find a subject to focus on.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/profile" className="quick-card">
          <span className="quick-icon red">
            <UserRound />
          </span>
          <div>
            <b>Update your profile</b>
            <p>Keep your details up to date.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/rate-platform" className="quick-card">
          <span className="quick-icon">
            <Star />
          </span>
          <div>
            <b>Rate the platform</b>
            <p>Help us improve your experience.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}

export function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    request("/subjects")
      .then(setSubjects)
      .catch((e) => setError(e.message));
  }, []);
  const list = subjects.filter((s) =>
    (s.name + " " + s.description + " " + s.category)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow="FIND YOUR FOCUS"
        title="Explore subjects"
        description="What would you like to learn today? Choose a subject to find your tutor."
      />
      <div className="search-bar">
        <Search size={19} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search subjects…"
        />
        <span>{list.length} subjects</span>
      </div>
      {error && <div className="alert">{error}</div>}
      {list.length ? (
        <div className="subject-grid">
          {list.map((s, i) => (
            <Link
              key={s._id}
              to={`/subjects/${s._id}/tutors`}
              className="subject-card"
            >
              <span className={`subject-icon tone-${i % 4}`}>
                <BookOpen size={23} />
              </span>
              <span className="subject-category">
                {s.category || "SUBJECT"}
              </span>
              <h3>{s.name}</h3>
              <p>
                {s.description ||
                  `Explore ${s.name} with an experienced tutor.`}
              </p>
              <span className="card-link">
                Find tutors <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="No subjects found"
          text="Try another search, or check back soon for new subjects."
        />
      )}
    </>
  );
}

export function Tutors() {
  const { subjectId } = useParamsFix();
  const [subject, setSubject] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    request("/subjects")
      .then((all) => {
        const s = all.find((x) => x._id === subjectId);
        setSubject(s);
        return request(`/tutors?subject=${subjectId}`);
      })
      .then(setTutors)
      .catch((e) => setError(e.message));
  }, [subjectId]);
  const list = tutors.filter((t) =>
    (t.name + " " + t.bio + " " + t.qualifications)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow="YOUR LEARNING TEAM"
        title={subject ? `Tutors for ${subject.name}` : "Find your tutor"}
        description="Meet tutors who can help you reach your goals."
      />
      <div className="search-bar">
        <Search size={19} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tutors by name or experience…"
        />
        <span>{list.length} tutors</span>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="tutor-grid">
        {list.map((t) => (
          <TutorCard key={t._id} tutor={t} />
        ))}
      </div>
      {!list.length && !error && (
        <Empty
          title="No tutors found yet"
          text="Try a different search or browse another subject."
        />
      )}
      <Link className="text-link back-subject" to="/subjects">
        ← All subjects
      </Link>
    </>
  );
}

function useParamsFix() {
  const l = useLocation();
  return { subjectId: l.pathname.split("/")[2] };
}

function TutorCard({ tutor: t }) {
  return (
    <article className="tutor-card">
      <div className="tutor-card-top">
        <div className="tutor-avatar">
          {t.avatar ? (
            <img src={t.avatar} alt="" />
          ) : (
            t.name
              ?.split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          )}
        </div>
        <span className="verified">
          <CheckCircle2 size={14} /> Tutor
        </span>
      </div>
      <h3>{t.name}</h3>
      <p className="tutor-qual">{t.qualifications || "Experienced tutor"}</p>
      <p className="tutor-bio">
        {t.bio ||
          "Ready to support your learning journey with personalised guidance."}
      </p>
      <div className="tutor-rating-summary">
        <Star size={15} fill="currentColor" />
        <b>{t.ratingCount ? t.ratingAverage.toFixed(1) : "New"}</b>
        <span>{t.ratingCount ? `(${t.ratingCount} reviews)` : "No reviews yet"}</span>
      </div>
      <div className="tutor-subjects">
        {(t.subjects || []).slice(0, 3).map((s) => (
          <span key={s._id}>{s.name}</span>
        ))}
      </div>
      <Link to={`/tutors/${t._id}`} className="btn secondary full">
        View profile <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export function TutorProfile() {
  const id = useLocation().pathname.split("/").pop();
  const [tutor, setTutor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState("");
  useEffect(() => {
    Promise.all([
      request(`/tutors/${id}`),
      request(`/availability?tutor=${id}`),
    ])
      .then(([t, s]) => {
        setTutor(t);
        setSlots(s);
      })
      .catch((e) => setError(e.message));
  }, [id]);
  const book = async (slot) => {
    setError("");
    setBookingInProgress(slot._id);
    try {
      const booking = await request("/bookings", {
        method: "POST",
        body: JSON.stringify({ availability: slot._id }),
      });
      setConfirmation(booking);
      setSlots((old) => old.filter((x) => x._id !== slot._id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBookingInProgress("");
    }
  };
  if (!tutor && !error)
    return <div className="loading-screen">Loading tutor profile…</div>;
  return (
    <>
      <Link className="text-link" to="/subjects">
        ← Back to subjects
      </Link>
      {error && <div className="alert">{error}</div>}
      {confirmation && (
        <div className="success-alert">
          Session booked successfully.{" "}
          {confirmation.meetingLink && (
            <>
              <a
                href={confirmation.meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                Open demo Teams link
              </a>{" "}
              <small>
                (placeholder only; it is not a live Teams meeting)
              </small>
            </>
          )}{" "}
          <Link to="/bookings">View bookings</Link>
        </div>
      )}
      {tutor && (
        <>
          <div className="profile-hero">
            <div className="profile-avatar">
              {tutor.avatar ? (
                <img src={tutor.avatar} alt="" />
              ) : (
                tutor.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
              )}
            </div>
            <div>
              <span className="eyebrow">MEET YOUR TUTOR</span>
              <h1>{tutor.name}</h1>
              <p className="profile-qual">
                {tutor.qualifications || "Dedicated learning partner"}
              </p>
              <p>
                {tutor.bio ||
                  "I enjoy helping students build confidence and achieve their learning goals."}
              </p>
              <div className="tutor-rating-summary profile-rating-summary">
                <Star size={17} fill="currentColor" />
                <b>
                  {tutor.ratingCount ? tutor.ratingAverage.toFixed(1) : "New"}
                </b>
                <span>
                  {tutor.ratingCount
                    ? `${tutor.ratingCount} student reviews`
                    : "No reviews yet"}
                </span>
              </div>
              <div className="tutor-subjects">
                {tutor.subjects?.map((s) => (
                  <span key={s._id}>{s.name}</span>
                ))}
              </div>
            </div>
          </div>
          {tutor.reviews?.length > 0 && (
            <section className="tutor-reviews">
              <div className="section-row">
                <div>
                  <h2>Student reviews</h2>
                  <p>Feedback from students who have completed sessions.</p>
                </div>
              </div>
              <div className="review-grid">
                {tutor.reviews.map((review) => (
                  <article className="review-card" key={review._id}>
                    <div className="review-rating">
                      <Star size={15} fill="currentColor" /> {review.rating}/5
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                    <small>
                      {new Date(review.createdAt).toLocaleDateString("en-ZA")}
                    </small>
                  </article>
                ))}
              </div>
            </section>
          )}
          <div className="section-row">
            <div>
              <h2>Available sessions</h2>
              <p>Choose a time that works for you.</p>
            </div>
            <span className="slot-count">{slots.length} available</span>
          </div>
          {slots.length ? (
            <div className="slot-grid">
              {slots.map((s) => (
                <div className="slot-card" key={s._id}>
                  <div>
                    <b>
                      {new Date(s.date).toLocaleDateString("en-ZA", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </b>
                    <p>
                      <Clock size={14} />
                      {s.startTime} – {s.endTime}
                    </p>
                    <small>{s.subject?.name}</small>
                  </div>
                  <Button
                    onClick={() => book(s)}
                    disabled={Boolean(bookingInProgress)}
                  >
                    {bookingInProgress === s._id ? "Booking…" : "Book"}{" "}
                    <ArrowRight size={15} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No sessions available"
              text="This tutor has no open sessions right now. Please check again later."
            />
          )}
        </>
      )}
    </>
  );
}


function downloadBookingHistoryPdf(bookings, user) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const isTutor = user.role === "tutor";
  const isAdmin = user.role === "admin";
  const title = isTutor ? "Teaching Session History" : isAdmin ? "Platform Booking History" : "Booking History";
  const generatedAt = new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });

  doc.setFillColor(28, 62, 125);
  doc.rect(0, 0, 297, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Tutoring Connect", 14, 14);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 23);
  doc.setFontSize(8);
  doc.text(`Generated ${generatedAt}`, 14, 29);

  doc.setTextColor(35, 48, 72);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Account: ${user.name || "User"}`, 14, 43);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total sessions: ${bookings.length}`, 14, 49);

  const rows = bookings.map((b) => [
    b.student?.name || "—",
    b.subject?.name || "—",
    b.tutor?.name || "—",
    b.date ? new Date(b.date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    [b.startTime, b.endTime].filter(Boolean).join(" – ") || "—",
    (b.status || "unknown").charAt(0).toUpperCase() + (b.status || "unknown").slice(1),
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["Student", "Subject", "Tutor", "Date", "Time", "Status"]],
    body: rows.length ? rows : [["—", "No bookings found", "—", "—", "—", "—"]],
    theme: "grid",
    margin: { left: 14, right: 14, top: 14, bottom: 16 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: [42, 52, 68], lineColor: [220, 228, 239], lineWidth: 0.2, overflow: "linebreak" },
    headStyles: { fillColor: [28, 62, 125], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [243, 247, 252] },
    columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 65 }, 2: { cellWidth: 48 }, 3: { cellWidth: 32 }, 4: { cellWidth: 35 }, 5: { cellWidth: 28 } },
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages();
      const page = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(110, 120, 138);
      doc.text("Tutoring Connect | Booking history", 14, 203);
      doc.text(`Page ${page} of ${pageCount}`, 283, 203, { align: "right" });
    },
  });

  const filename = isTutor ? "tutoring-connect-teaching-session-history.pdf" : isAdmin ? "tutoring-connect-platform-booking-history.pdf" : "tutoring-connect-booking-history.pdf";
  doc.save(filename);
}

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [reschedule, setReschedule] = useState(null);
  const [tutorRatings, setTutorRatings] = useState({});
  const [ratingBooking, setRatingBooking] = useState("");
  const reload = () =>
    request("/bookings")
      .then(setBookings)
      .catch((e) => setError(e.message));
  useEffect(() => {
    reload();
    if (user.role === "student") {
      request("/availability")
        .then(setSlots)
        .catch(() => {});
      request("/ratings/mine")
        .then((data) =>
          setTutorRatings(
            Object.fromEntries(
              data.tutorRatings.map((rating) => [
                String(rating.booking),
                rating,
              ]),
            ),
          ),
        )
        .catch((e) => setError(e.message));
    }
  }, []);
  const rateTutor = async (bookingId, feedback) => {
    setRatingBooking(bookingId);
    setError("");
    try {
      const rating = await request(`/ratings/tutor/${bookingId}`, {
        method: "POST",
        body: JSON.stringify(feedback),
      });
      setTutorRatings((current) => ({ ...current, [bookingId]: rating }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRatingBooking("");
    }
  };
  const cancel = async (b) => {
    if (
      !confirm(
        "Cancel this session? Its time slot will become available again.",
      )
    )
      return;
    try {
      await request(`/bookings/${b._id}/cancel`, { method: "PATCH" });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };
  const change = async (availability) => {
    try {
      await request(`/bookings/${reschedule._id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({ availability }),
      });
      setReschedule(null);
      reload();
    } catch (e) {
      setError(e.message);
    }
  };
  const list = bookings.filter((b) => filter === "all" || b.status === filter);
  return (
    <>
      <PageHead
        eyebrow="YOUR SCHEDULE"
        title={
          user.role === "admin"
            ? "Booking management"
            : user.role === "tutor"
              ? "My teaching schedule"
              : "My bookings"
        }
        description={
          user.role === "admin"
            ? "Review and manage sessions across the platform."
            : user.role === "tutor"
              ? "Keep track of upcoming sessions with your students."
              : "All your upcoming and previous learning sessions in one place."
        }
        action={
          <button
            type="button"
            className="btn primary"
            onClick={() => downloadBookingHistoryPdf(bookings, user)}
            disabled={!bookings.length}
            title={!bookings.length ? "There are no bookings to export yet" : "Download booking history as PDF"}
          >
            <Download size={17} />
            Download PDF
          </button>
        }
      />
      {error && <div className="alert">{error}</div>}
      <div className="filter-tabs">
        {[
          ["all", "All sessions"],
          ["confirmed", "Upcoming"],
          ["completed", "Completed"],
          ["cancelled", "Cancelled"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={filter === v ? "selected" : ""}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="booking-list">
        {list.map((b) => (
          <div className="booking-review-wrap" key={b._id}>
            <BookingCard
              booking={b}
              admin={user.role === "admin"}
              onAction={
                b.status === "cancelled" || new Date(b.date) < new Date()
                  ? null
                  : () => (
                      <div className="booking-actions">
                        <button
                          title="Cancel booking"
                          onClick={() => cancel(b)}
                          className="icon-btn danger"
                        >
                          <X size={16} />
                        </button>
                        {user.role === "student" && (
                          <button
                            title="Reschedule booking"
                            className="icon-btn"
                            onClick={() => setReschedule(b)}
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </div>
                    )
              }
            />
            {user.role === "student" && b.status === "completed" && (
              <div className="booking-rating">
                {tutorRatings[b._id] ? (
                  <div className="submitted-rating">
                    <span>
                      <Star size={15} fill="currentColor" />
                      You rated {b.tutor?.name || "your tutor"}{" "}
                      {tutorRatings[b._id].rating}/5
                    </span>
                    {tutorRatings[b._id].comment && (
                      <p>{tutorRatings[b._id].comment}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <h3>How was your session with {b.tutor?.name || "your tutor"}?</h3>
                    <RatingForm
                      onSubmit={(feedback) => rateTutor(b._id, feedback)}
                      submitting={ratingBooking === b._id}
                      submitLabel="Rate tutor"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {!list.length && (
        <Empty
          title="Nothing to show here"
          text="Bookings matching this filter will appear here."
        />
      )}
      {reschedule && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="modal-close icon-btn"
              onClick={() => setReschedule(null)}
            >
              <X />
            </button>
            <span className="eyebrow">CHANGE YOUR SESSION</span>
            <h2>Reschedule booking</h2>
            <p>
              Choose a new available time. Your current slot will be released.
            </p>
            <div className="reschedule-slots">
              {slots
                .filter((s) => s._id !== reschedule.availability)
                .map((s) => (
                  <button
                    key={s._id}
                    className="reschedule-option"
                    onClick={() => change(s._id)}
                  >
                    <span>
                      <b>
                        {new Date(s.date).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          weekday: "short",
                        })}
                      </b>
                      <small>
                        {s.tutor?.name} · {s.subject?.name}
                      </small>
                    </span>
                    <span>
                      {s.startTime}–{s.endTime} <ArrowRight size={15} />
                    </span>
                  </button>
                ))}
            </div>
            {!slots.length && (
              <p>No alternative slots are currently available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function PlatformRating() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    request("/ratings/platform")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  const saveRating = async (feedback) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await request("/ratings/platform", {
        method: "POST",
        body: JSON.stringify(feedback),
      });
      setData(await request("/ratings/platform"));
      setMessage("Thanks for sharing your feedback.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHead
        eyebrow="YOUR FEEDBACK"
        title="Rate the platform"
        description="Tell us how Tutoring Connect is working for you. You can update your rating any time."
      />
      {error && <div className="alert">{error}</div>}
      {message && <div className="success-alert">{message}</div>}
      <section className="platform-rating-card">
        <div className="platform-rating-summary">
          <div className="platform-rating-score">
            <Star size={24} fill="currentColor" />
            <strong>{data?.count ? data.average.toFixed(1) : "—"}</strong>
          </div>
          <p>
            {data?.count
              ? `Average from ${data.count} platform ${data.count === 1 ? "rating" : "ratings"}`
              : "Be the first to rate the platform"}
          </p>
        </div>
        <div className="platform-rating-form">
          <h2>{data?.ownRating ? "Update your rating" : "How are we doing?"}</h2>
          {data ? (
            <RatingForm
              key={data.ownRating?.updatedAt || "new"}
              initialRating={data.ownRating?.rating || 0}
              initialComment={data.ownRating?.comment || ""}
              onSubmit={saveRating}
              submitting={saving}
              submitLabel={data.ownRating ? "Update rating" : "Submit rating"}
            />
          ) : (
            <p>Loading ratings…</p>
          )}
        </div>
      </section>
    </>
  );
}

export function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    qualifications: user.qualifications || "",
    subjects: (user.subjects || []).map((subject) =>
      typeof subject === "string" ? subject : subject._id,
    ),
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user.role === "tutor")
      request("/subjects")
        .then(setSubjectOptions)
        .catch((e) => setError(e.message));
  }, [user.role]);
  const toggleSubject = (subjectId) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.includes(subjectId)
        ? current.subjects.filter((id) => id !== subjectId)
        : [...current.subjects, subjectId],
    }));
  };
  const save = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await request("/auth/me", { method: "PUT", body: JSON.stringify(form) });
      await refresh();
      setMessage("Your profile has been updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead
        eyebrow="YOUR ACCOUNT"
        title="My profile"
        description="Keep your personal details up to date."
      />
      <div className="profile-layout">
        <div className="profile-summary">
          <div className="profile-avatar">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="role-pill">{user.role}</span>
          <div className="profile-summary-line">
            <ShieldCheck size={17} /> Account secured
          </div>
        </div>
        <form className="panel profile-form" onSubmit={save}>
          <h2>Personal information</h2>
          <p>Update the details associated with your account.</p>
          {error && <div className="alert">{error}</div>}
          {message && <div className="success-alert">{message}</div>}
          <div className="form-grid">
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Email address
              <input disabled value={user.email} />
            </label>
            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Optional"
              />
            </label>
            {user.role === "tutor" && (
              <label>
                Qualifications
                <input
                  value={form.qualifications}
                  onChange={(e) =>
                    setForm({ ...form, qualifications: e.target.value })
                  }
                  placeholder="e.g. BSc Mathematics"
                />
              </label>
            )}
            {user.role === "tutor" && (
              <div className="span-two profile-subject-picker">
                <b>Subjects I teach</b>
                <p>Choose the subjects students can use to find your profile.</p>
                {subjectOptions.length ? (
                  <div className="profile-subject-options">
                    {subjectOptions.map((subject) => (
                      <label
                        className="profile-subject-option"
                        key={subject._id}
                      >
                        <input
                          type="checkbox"
                          checked={form.subjects.includes(subject._id)}
                          onChange={() => toggleSubject(subject._id)}
                        />
                        <span>{subject.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p>No active subjects are available.</p>
                )}
              </div>
            )}
            <label className="span-two">
              {user.role === "tutor" ? "About me" : "Learning goals / about me"}
              <textarea
                rows="4"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us a little about yourself…"
              />
            </label>
          </div>
          <div className="form-actions">
            <Button disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
