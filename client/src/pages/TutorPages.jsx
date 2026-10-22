import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Users, CalendarDays, LayoutDashboard, LogOut, Menu, X, ArrowRight, ShieldCheck, Clock, Star, Search, Plus, CheckCircle2, ChevronDown, UserRound, Settings, ChartNoAxesCombined, BookMarked, CalendarCheck, Trash2, Edit3, Filter } from "lucide-react";
import { useAuth, request } from "../context/AuthContext";
import { Button, PageHead, StatCard, BookingCard, QuickAdmin, Empty, DataTable, Modal } from "../components/AppComponents";

function earliestAvailabilityDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function TutorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ upcoming: [] });
  const [slots, setSlots] = useState([]);
  useEffect(() => {
    request("/dashboard")
      .then(setData)
      .catch(() => {});
    request("/availability/mine")
      .then(setSlots)
      .catch(() => {});
  }, []);
  return (
    <>
      <PageHead
        eyebrow="TUTOR WORKSPACE"
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Manage your teaching schedule and keep your sessions organised."
        action={
          <Link to="/tutor/availability" className="btn primary">
            <Plus size={17} /> Manage availability
          </Link>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Upcoming sessions"
          value={data.upcoming?.length || 0}
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Available slots"
          value={slots.filter((s) => !s.booked).length}
          icon={<Clock />}
          accent="green"
        />
        <StatCard
          label="Subjects"
          value={user.subjects?.length || "—"}
          icon={<BookOpen />}
          accent="purple"
        />
      </div>
      <div className="section-row">
        <div>
          <h2>Next sessions</h2>
          <p>Your upcoming teaching commitments.</p>
        </div>
        <Link to="/bookings" className="text-link">
          Full schedule <ArrowRight size={15} />
        </Link>
      </div>
      {data.upcoming?.length ? (
        <div className="booking-list">
          {data.upcoming.map((b) => (
            <BookingCard key={b._id} booking={b} />
          ))}
        </div>
      ) : (
        <Empty
          title="Your schedule is clear"
          text="When students book your available sessions, they will appear here."
        />
      )}
      <div className="quick-grid">
        <QuickAdmin
          to="/tutor/availability"
          icon={<Clock />}
          title="Manage availability"
          text="Choose when students can book you"
        />
        <QuickAdmin
          to="/profile"
          icon={<UserRound />}
          title="Update tutor profile"
          text="Keep your qualifications and bio current"
        />
      </div>
    </>
  );
}

export function TutorAvailability() {
  const { refresh } = useAuth();
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subject: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
  });
  const reload = () =>
    request("/availability/mine")
      .then(setSlots)
      .catch((e) => setError(e.message));
  useEffect(() => {
    reload();
    request("/subjects")
      .then(setSubjects)
      .catch(() => {});
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await request("/availability", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShow(false);
      reload();
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const remove = async (s) => {
    try {
      await request(`/availability/${s._id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <PageHead
        eyebrow="MY TEACHING HOURS"
        title="Manage availability"
        description="Add the future sessions students can book with you."
        action={
          <Button onClick={() => setShow(true)}>
            <Plus size={17} /> Add time slot
          </Button>
        }
      />
      {error && <div className="alert">{error}</div>}
      <div className="panel">
        <p className="availability-subject-note">
          Choose the subject for each time slot. New subjects you teach are
          added to your tutor profile so students can find you in search.
        </p>
        <DataTable
          columns={[
            { label: "Subject", render: (s) => s.subject?.name },
            {
              label: "Date",
              render: (s) => new Date(s.date).toLocaleDateString("en-ZA"),
            },
            { label: "Time", render: (s) => `${s.startTime} – ${s.endTime}` },
            {
              label: "Status",
              render: (s) => (
                <span
                  className={`status ${s.booked ? "status-confirmed" : "status-completed"}`}
                >
                  {s.booked ? "Booked" : "Available"}
                </span>
              ),
            },
            {
              label: "Action",
              render: (s) =>
                !s.booked ? (
                  <button
                    className="icon-btn danger"
                    onClick={() => remove(s)}
                    title="Remove slot"
                  >
                    <Trash2 size={17} />
                  </button>
                ) : (
                  "—"
                ),
            },
          ]}
          rows={slots}
        />
      </div>
      {show && (
        <Modal title="Add time slot" onClose={() => setShow(false)}>
          <form className="form-stack" onSubmit={save}>
            <label>
              Subject
              <select
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Choose a subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input
                required
                type="date"
                min={earliestAvailabilityDate()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <div className="form-grid">
              <label>
                Start time
                <input
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
              </label>
              <label>
                End time
                <input
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                />
              </label>
            </div>
            <Button>Add availability</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
