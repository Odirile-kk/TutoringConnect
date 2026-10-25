
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
  ArrowRight,
  Clock,
  Search,
  Plus,
  CalendarCheck,
  Trash2,
  Edit3,
  ChartNoAxesCombined,
} from "lucide-react";
import { request } from "../context/AuthContext";
import {
  Button,
  PageHead,
  StatCard,
  BookingCard,
  QuickAdmin,
  Empty,
  DataTable,
  Modal,
} from "../components/AppComponents";

export function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/dashboard")
      .then((d) => setStats(d.stats || {}))
      .catch((e) => setError(e.message));

    request("/bookings")
      .then(setBookings)
      .catch(() => {});
  }, []);

  const upcoming = bookings
    .filter(
      (b) =>
        b.status !== "cancelled" &&
        new Date(b.date) >= new Date(),
    )
    .slice(0, 5);

  return (
    <>
      <PageHead
        eyebrow="ADMIN WORKSPACE"
        title="System overview"
        description="A clear picture of your tutoring platform, all in one place."
        action={
          <span className="today-chip">
            <CalendarDays size={15} />
            {new Date().toLocaleDateString("en-ZA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        }
      />

      {error && <div className="alert">{error}</div>}

      <div className="admin-welcome">
        <div>
          <span className="banner-tag">ADMINISTRATOR OVERVIEW</span>
          <h2>Good things happen when learning connects.</h2>
          <p>Monitor activity and keep the platform running smoothly.</p>
        </div>
        <div className="admin-welcome-icon">
          <ChartNoAxesCombined size={44} />
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total students"
          value={stats.students}
          icon={<Users />}
          detail="Registered learners"
        />
        <StatCard
          label="Total tutors"
          value={stats.tutors}
          icon={<GraduationCap />}
          accent="red"
          detail="Teaching partners"
        />
        <StatCard
          label="Active subjects"
          value={stats.subjects}
          icon={<BookOpen />}
          accent="purple"
          detail="Available to browse"
        />
        <StatCard
          label="Total bookings"
          value={stats.bookings}
          icon={<CalendarCheck />}
          accent="green"
          detail="All time sessions"
        />
      </div>

      <div className="stats-grid secondary-stats">
        <StatCard
          label="Today's bookings"
          value={stats.todayBookings}
          icon={<Clock />}
          accent="orange"
          detail="Scheduled for today"
        />
        <div className="stat-card action-stat">
          <div className="stat-icon blue">
            <Users />
          </div>
          <div className="stat-label">Manage platform</div>
          <p>Keep users, tutors and subjects up to date.</p>
          <Link to="/admin/users" className="text-link">
            Open user management <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="section-row">
        <div>
          <h2>Upcoming bookings</h2>
          <p>See what's coming up across the platform.</p>
        </div>
        <Link className="text-link" to="/bookings">
          Manage bookings <ArrowRight size={15} />
        </Link>
      </div>

      <div className="panel">
        {upcoming.length ? (
          upcoming.map((b) => (
            <BookingCard key={b._id} booking={b} admin />
          ))
        ) : (
          <Empty
            title="No upcoming bookings"
            text="New confirmed sessions will appear here."
          />
        )}
      </div>

      <div className="section-row">
        <div>
          <h2>Quick management</h2>
          <p>Jump straight into common admin tasks.</p>
        </div>
      </div>

      <div className="quick-grid">
        <QuickAdmin
          to="/admin/users"
          icon={<Users />}
          title="Students & users"
          text="Search accounts and manage access"
        />
        <QuickAdmin
          to="/admin/tutors"
          icon={<GraduationCap />}
          title="Tutors"
          text="Create and update tutor profiles"
        />
        <QuickAdmin
          to="/admin/subjects"
          icon={<BookOpen />}
          title="Subjects"
          text="Manage the learning catalogue"
        />
        <QuickAdmin
          to="/admin/availability"
          icon={<Clock />}
          title="Availability"
          text="Configure session time slots"
        />
      </div>
    </>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const reload = () =>
    request(
      `/users?search=${encodeURIComponent(q)}${
        role ? `&role=${role}` : ""
      }`,
    )
      .then(setUsers)
      .catch((e) => setError(e.message));

  useEffect(() => {
    reload();
  }, [q, role]);

  const active = async (u) => {
    try {
      await request(`/users/${u._id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active: !u.active }),
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const changeRole = async (u, newRole) => {
    try {
      await request(`/users/${u._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="USER DIRECTORY"
        title="Students & users"
        description="Search accounts, review roles and manage account access."
      />

      <div className="table-tools">
        <div className="search-bar compact">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="tutor">Tutors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="panel">
        <DataTable
          columns={[
            {
              label: "User",
              render: (u) => (
                <div className="table-person">
                  <span className="user-avatar">
                    {u.name?.slice(0, 1)}
                  </span>
                  <span>
                    <b>{u.name}</b>
                    <small>{u.email}</small>
                  </span>
                </div>
              ),
            },
            {
              label: "Role",
              render: (u) => (
                <select
                  className="inline-select"
                  value={u.role}
                  onChange={(e) =>
                    changeRole(u, e.target.value)
                  }
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              ),
            },
            {
              label: "Status",
              render: (u) => (
                <span
                  className={`status ${
                    u.active
                      ? "status-confirmed"
                      : "status-cancelled"
                  }`}
                >
                  {u.active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              label: "Joined",
              render: (u) =>
                new Date(u.createdAt).toLocaleDateString("en-ZA"),
            },
            {
              label: "Action",
              render: (u) => (
                <button
                  className={`btn small ${
                    u.active ? "secondary" : "primary"
                  }`}
                  onClick={() => active(u)}
                >
                  {u.active ? "Deactivate" : "Activate"}
                </button>
              ),
            },
          ]}
          rows={users}
        />
      </div>
    </>
  );
}

export function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    qualifications: "",
    bio: "",
    subjects: [],
  });

  // IMPORTANT: use the admin endpoint to retrieve active and inactive tutors.
  const reload = () =>
    request(
      `/tutors/admin/list?search=${encodeURIComponent(q)}`,
    )
      .then(setTutors)
      .catch((e) => setError(e.message));

  useEffect(() => {
    reload();

    request("/subjects")
      .then(setSubjects)
      .catch(() => {});
  }, [q]);

  const create = async (e) => {
    e.preventDefault();

    try {
      await request("/tutors", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setShow(false);
      setForm({
        name: "",
        email: "",
        password: "",
        qualifications: "",
        bio: "",
        subjects: [],
      });

      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (t) => {
    if (!confirm(`Deactivate ${t.name}?`)) return;

    try {
      await request(`/tutors/${t._id}`, {
        method: "DELETE",
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="TEACHING TEAM"
        title="Tutor management"
        description="Create tutor profiles and manage your teaching team."
        action={
          <Button onClick={() => setShow(true)}>
            <Plus size={17} /> Add tutor
          </Button>
        }
      />

      <div className="table-tools">
        <div className="search-bar compact">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tutors…"
          />
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="panel">
        <DataTable
          columns={[
            {
              label: "Tutor",
              render: (t) => (
                <div className="table-person">
                  <span className="user-avatar">
                    {t.name?.slice(0, 1)}
                  </span>
                  <span>
                    <b>{t.name}</b>
                    <small>{t.email}</small>
                  </span>
                </div>
              ),
            },
            {
              label: "Qualifications",
              key: "qualifications",
            },
            {
              label: "Subjects",
              render: (t) =>
                (t.subjects || [])
                  .map((s) => s.name)
                  .join(", ") || "Not assigned",
            },
            {
              label: "Status",
              render: (t) => (
                <span
                  className={`status ${
                    t.active
                      ? "status-confirmed"
                      : "status-cancelled"
                  }`}
                >
                  {t.active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              label: "Action",
              render: (t) =>
                t.active ? (
                  <button
                    className="icon-btn danger"
                    onClick={() => remove(t)}
                    title="Deactivate tutor"
                  >
                    <Trash2 size={17} />
                  </button>
                ) : (
                  <button
                    className="btn small primary"
                    onClick={async () => {
                      try {
                        await request(`/users/${t._id}/active`, {
                          method: "PATCH",
                          body: JSON.stringify({ active: true }),
                        });
                        reload();
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Activate
                  </button>
                ),
            },
          ]}
          rows={tutors}
        />
      </div>

      {show && (
        <Modal
          title="Create tutor profile"
          onClose={() => setShow(false)}
        >
          <form className="form-stack" onSubmit={create}>
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </label>

            <label>
              Temporary password
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </label>

            <label>
              Qualifications
              <input
                value={form.qualifications}
                onChange={(e) =>
                  setForm({
                    ...form,
                    qualifications: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Bio
              <textarea
                rows="3"
                value={form.bio}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
              />
            </label>

            <label>
              Assigned subjects
              <select
                multiple
                value={form.subjects}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subjects: [
                      ...e.target.selectedOptions,
                    ].map((o) => o.value),
                  })
                }
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <small>
                Hold Ctrl (Windows) or Command (Mac) to select multiple.
              </small>
            </label>

            <Button>Create tutor</Button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "General",
    description: "",
  });

  const reload = () =>
    request("/subjects")
      .then(setSubjects)
      .catch((e) => setError(e.message));

  useEffect(() => {
    reload();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      await request(edit ? `/subjects/${edit._id}` : "/subjects", {
        method: edit ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      setShow(false);
      setEdit(null);
      setForm({
        name: "",
        category: "General",
        description: "",
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (s) => {
    setEdit(s);
    setForm({
      name: s.name,
      category: s.category || "General",
      description: s.description || "",
    });
    setShow(true);
  };

  const remove = async (s) => {
    if (!confirm(`Archive ${s.name}?`)) return;

    try {
      await request(`/subjects/${s._id}`, {
        method: "DELETE",
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const list = subjects.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHead
        eyebrow="LEARNING CATALOGUE"
        title="Subject management"
        description="Keep the subject catalogue relevant and organised."
        action={
          <Button
            onClick={() => {
              setEdit(null);
              setForm({
                name: "",
                category: "General",
                description: "",
              });
              setShow(true);
            }}
          >
            <Plus size={17} /> Add subject
          </Button>
        }
      />

      <div className="table-tools">
        <div className="search-bar compact">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects…"
          />
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="panel">
        <DataTable
          columns={[
            {
              label: "Subject",
              render: (s) => (
                <div className="table-person">
                  <span className="subject-mini">
                    <BookOpen size={18} />
                  </span>
                  <span>
                    <b>{s.name}</b>
                    <small>{s.category}</small>
                  </span>
                </div>
              ),
            },
            {
              label: "Description",
              key: "description",
            },
            {
              label: "Actions",
              render: (s) => (
                <div className="booking-actions">
                  <button
                    className="icon-btn"
                    onClick={() => startEdit(s)}
                    title="Edit subject"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => remove(s)}
                    title="Archive subject"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ),
            },
          ]}
          rows={list}
        />
      </div>

      {show && (
        <Modal
          title={edit ? "Edit subject" : "Create subject"}
          onClose={() => setShow(false)}
        >
          <form className="form-stack" onSubmit={save}>
            <label>
              Subject name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </label>

            <label>
              Description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <Button>{edit ? "Save changes" : "Create subject"}</Button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function AdminAvailability() {
  const [slots, setSlots] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    tutor: "",
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

    request("/tutors")
      .then(setTutors)
      .catch(() => {});

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
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (s) => {
    try {
      await request(`/availability/${s._id}`, {
        method: "DELETE",
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="SESSION PLANNING"
        title="Availability management"
        description="Create and manage the time slots tutors can offer."
        action={
          <Button onClick={() => setShow(true)}>
            <Plus size={17} /> Add availability
          </Button>
        }
      />

      {error && <div className="alert">{error}</div>}

      <div className="panel">
        <DataTable
          columns={[
            {
              label: "Tutor",
              render: (s) => s.tutor?.name,
            },
            {
              label: "Subject",
              render: (s) => s.subject?.name,
            },
            {
              label: "Date",
              render: (s) =>
                new Date(s.date).toLocaleDateString("en-ZA"),
            },
            {
              label: "Time",
              render: (s) =>
                `${s.startTime} – ${s.endTime}`,
            },
            {
              label: "Status",
              render: (s) => (
                <span
                  className={`status ${
                    s.booked
                      ? "status-confirmed"
                      : "status-completed"
                  }`}
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
                    title="Remove availability"
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
        <Modal
          title="Create availability"
          onClose={() => setShow(false)}
        >
          <form className="form-stack" onSubmit={save}>
            <label>
              Tutor
              <select
                required
                value={form.tutor}
                onChange={(e) =>
                  setForm({ ...form, tutor: e.target.value })
                }
              >
                <option value="">Choose a tutor</option>
                {tutors.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Subject
              <select
                required
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
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
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
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
                    setForm({
                      ...form,
                      startTime: e.target.value,
                    })
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
                    setForm({
                      ...form,
                      endTime: e.target.value,
                    })
                  }
                />
              </label>
            </div>

            <Button>Create slot</Button>
          </form>
        </Modal>
      )}
    </>
  );
}

