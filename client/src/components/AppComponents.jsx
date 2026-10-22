import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Users, CalendarDays, LayoutDashboard, LogOut, Menu, X, ArrowRight, ShieldCheck, Clock, Star, Search, Plus, CheckCircle2, ChevronDown, UserRound, Settings, ChartNoAxesCombined, BookMarked, CalendarCheck, Trash2, Edit3, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const cx = (...a) => a.filter(Boolean).join(" ");

export function Button({ children, variant = "primary", ...p }) {
  return (
    <button className={`btn ${variant}`} {...p}>
      {children}
    </button>
  );
}

export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-icon">
        <GraduationCap size={22} />
      </span>
      <span>
        Tutoring<span className="brand-blue">Connect</span>
      </span>
    </Link>
  );
}

export function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading)
    return <div className="loading-screen">Loading your workspace…</div>;
  if (!user)
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role))
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin"
            : user.role === "tutor"
              ? "/tutor"
              : "/app"
        }
        replace
      />
    );
  return children;
}

const studentLinks = [
  ["Overview", "/app", LayoutDashboard],
  ["Find tutors", "/subjects", BookOpen],
  ["My bookings", "/bookings", CalendarDays],
  ["My profile", "/profile", UserRound],
  ["Rate platform", "/rate-platform", Star],
];

const staffLinks = (role) =>
  role === "admin"
    ? [
        ["Overview", "/admin", LayoutDashboard],
        ["Bookings", "/bookings", CalendarDays],
        ["Students & users", "/admin/users", Users],
        ["Tutors", "/admin/tutors", GraduationCap],
        ["Subjects", "/admin/subjects", BookOpen],
        ["Availability", "/admin/availability", Clock],
      ]
    : [
        ["Overview", "/tutor", LayoutDashboard],
        ["My schedule", "/bookings", CalendarDays],
        ["Availability", "/tutor/availability", Clock],
        ["My profile", "/profile", UserRound],
        ["Rate platform", "/rate-platform", Star],
      ];

export function AppShell({ children, staff = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const isStaff = user.role !== "student";
  const links = isStaff ? staffLinks(user.role) : studentLinks;
  return (
    <div className={cx("app-shell", isStaff && "staff-shell")}>
      <header className="app-topbar">
        <div className="app-top-left">
          <button className="mobile-menu" onClick={() => setOpen(!open)}>
            <Menu />
          </button>
          <Brand />
        </div>
        {!isStaff && (
          <nav className="student-top-nav">
            {studentLinks.slice(0, 3).map(([label, to, Icon]) => (
              <Link key={to} to={to}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        )}
        <div className="account-menu">
          {user.role === "admin" && (
            <span className="role-pill admin-pill">Admin</span>
          )}
          {user.role === "tutor" && <span className="role-pill">Tutor</span>}
          <div className="user-avatar">
            {user.name?.slice(0, 1).toUpperCase()}
          </div>
          <span className="account-name">{user.name}</span>
          <button
            className="icon-btn"
            title="Log out"
            onClick={() => {
              logout();
              nav("/");
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
      {isStaff && (
        <aside className={cx("side-nav", open && "side-open")}>
          <div className="side-label">WORKSPACE</div>
          {links.map(([label, to, Icon]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({}) =>
                location.pathname === to ? "side-link active" : "side-link"
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div className="side-bottom">
            <div className="help-card">
              <span className="help-icon">
                <Star size={17} />
              </span>
              <b>Keep learning</b>
              <p>Small steps make big progress.</p>
            </div>
            <button
              className="side-link logout-link"
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </aside>
      )}
      {!isStaff && open && (
        <div className="mobile-drawer">
          {studentLinks.map(([label, to, Icon]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      )}
      <main className={cx("app-content", isStaff && "staff-content")}>
        {children}
      </main>
    </div>
  );
}

export function PageHead({ eyebrow, title, description, action }) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, accent = "blue", detail }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? "—"}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </div>
  );
}

export function BookingCard({ booking: b, admin = false, onAction }) {
  return (
    <div className="booking-card">
      <div className="booking-date">
        <b>
          {new Date(b.date).toLocaleDateString("en-ZA", { day: "2-digit" })}
        </b>
        <span>
          {new Date(b.date).toLocaleDateString("en-ZA", { month: "short" })}
        </span>
      </div>
      <div className="booking-info">
        <b>{b.subject?.name || "Tutoring session"}</b>
        <p>
          {admin
            ? `${b.student?.name || "Student"} · ${b.tutor?.name || "Tutor"}`
            : `${b.tutor?.name || "Tutor"} · ${b.startTime}–${b.endTime}`}
        </p>
        <span className={`status status-${b.status}`}>{b.status}</span>
        {b.meetingLink && b.status === "confirmed" && (
          <div className="booking-meeting">
            <a href={b.meetingLink} target="_blank" rel="noreferrer">
              Open demo Teams link
            </a>
            <small>Placeholder only — this is not a live Teams meeting.</small>
          </div>
        )}
      </div>
      <div className="booking-right">
        <span>
          <Clock size={15} />
          {b.startTime}
        </span>
        {onAction && onAction(b)}
      </div>
    </div>
  );
}

export function QuickAdmin({ to, icon, title, text }) {
  return (
    <Link to={to} className="quick-card">
      <span className="quick-icon">{icon}</span>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
      <ArrowRight size={18} />
    </Link>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="empty-card">
      <div className="empty-icon">
        <BookOpen size={24} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function DataTable({ columns, rows, empty = "No records found." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={row._id || i}>
                {columns.map((c) => (
                  <td key={c.label}>
                    {c.render ? c.render(row) : (row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close icon-btn" onClick={onClose}>
          <X />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function RatingForm({
  initialRating = 0,
  initialComment = "",
  onSubmit,
  submitLabel = "Submit rating",
  submitting = false,
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  return (
    <form
      className="rating-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ rating, comment });
      }}
    >
      <div className="rating-stars" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`rating-star ${value <= rating ? "selected" : ""}`}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
          >
            <Star size={22} />
          </button>
        ))}
      </div>
      <label>
        Your feedback
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Share a few details (optional)"
        />
      </label>
      <button className="btn primary" type="submit" disabled={!rating || submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
