import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Users, CalendarDays, LayoutDashboard, LogOut, Menu, X, ArrowRight, ShieldCheck, Clock, Star, Search, Plus, CheckCircle2, ChevronDown, UserRound, Settings, ChartNoAxesCombined, BookMarked, CalendarCheck, Trash2, Edit3, Filter } from "lucide-react";
import { request, useAuth } from "../context/AuthContext";
import { Brand, Button } from "../components/AppComponents";

export function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header className="topbar wrap">
        <Brand />
        <nav>
          <a href="#how">How it works</a>
          <a href="#benefits">Why us</a>
          {user ? (
            <Link className="btn primary small" to="/app">
              Open dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Log in
              </Link>
              <Link to="/signup" className="btn primary small">
                Get started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> YOUR LEARNING, CONNECTED
            </div>
            <h1>
              Big goals start with <span>the right tutor.</span>
            </h1>
            <p className="hero-lede">
              Find expert tutors, explore subjects you love, and book learning
              sessions that fit your schedule. A little support can make a big
              difference.
            </p>
            <div className="hero-actions">
              <Link to={user ? "/app" : "/signup"} className="btn primary">
                Find your tutor <ArrowRight size={17} />
              </Link>
              <a href="#how" className="btn secondary">
                See how it works
              </a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>AM</span>
                <span>TK</span>
                <span>ZN</span>
              </div>
              <div>
                <div className="stars">
                  ★★★★★ <b>Learning made personal</b>
                </div>
                <small>Built around your goals and schedule</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="blob blob-one" />
            <div className="blob blob-two" />
            <div className="hero-card main-card">
              <div className="card-top">
                <span className="live-pill">
                  <i /> LIVE LEARNING
                </span>
                <span className="more-dot">•••</span>
              </div>
              <div className="hero-illustration">
                <div className="illustration-circle">
                  <GraduationCap size={72} strokeWidth={1.4} />
                </div>
                <div className="orbit orbit-a" />
                <div className="orbit orbit-b" />
                <span className="float-chip chip-star">
                  <Star size={16} fill="currentColor" /> Learn more
                </span>
                <span className="float-chip chip-book">
                  <BookOpen size={17} /> Your next chapter
                </span>
              </div>
              <div className="lesson-title">
                <div>
                  <b>Make progress, one session at a time</b>
                  <p>Personalised learning that works for you.</p>
                </div>
                <span className="lesson-arrow">
                  <ArrowRight size={19} />
                </span>
              </div>
              <div className="progress-line">
                <span />
              </div>
            </div>
            <div className="mini-note note-left">
              <span className="note-icon blue">
                <CalendarCheck size={18} />
              </span>
              <div>
                <b>Easy scheduling</b>
                <small>Pick a time that suits you</small>
              </div>
            </div>
            <div className="mini-note note-right">
              <span className="note-icon red">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <b>Real progress</b>
                <small>One goal at a time</small>
              </div>
            </div>
            <div className="hero-stamp">✦ LEARN YOUR WAY</div>
          </div>
        </section>
        <section className="trust-strip wrap">
          <span>LEARNING, MADE SIMPLER</span>
          <div>
            <BookOpen size={17} /> Find your subject
          </div>
          <div>
            <Users size={17} /> Meet your tutor
          </div>
          <div>
            <CalendarDays size={17} /> Book your session
          </div>
        </section>
        <section id="how" className="section wrap">
          <div className="section-heading">
            <span className="eyebrow">A BETTER WAY TO LEARN</span>
            <h2>From curious to confident.</h2>
            <p>
              Everything you need to make your next learning step feel simple.
            </p>
          </div>
          <div className="feature-grid">
            <Feature
              n="01"
              icon={<Search />}
              title="Discover your subject"
              text="Explore subjects and find the right match for what you want to learn."
            />
            <Feature
              n="02"
              icon={<Users />}
              title="Meet your tutor"
              text="Learn about tutor experience, qualifications and teaching interests."
            />
            <Feature
              n="03"
              icon={<CalendarDays />}
              title="Book with confidence"
              text="Choose an available session, manage your bookings and keep plans organised."
            />
          </div>
        </section>
        <section id="benefits" className="cta-band">
          <div className="wrap cta-inner">
            <div>
              <span className="eyebrow light">YOUR NEXT STEP STARTS HERE</span>
              <h2>Ready to learn something new?</h2>
              <p>Make room for your goals. We'll help you find the support.</p>
            </div>
            <Link to={user ? "/app" : "/signup"} className="btn white">
              Start learning <ArrowRight size={17} />
            </Link>
            <span className="cta-decoration">✳</span>
          </div>
        </section>
      </main>
      <footer className="footer wrap">
        <Brand />
        <span>
          © {new Date().getFullYear()} Tutoring Connect. Learn at your pace.
        </span>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ n, icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-top">
        <span className="feature-icon">{icon}</span>
        <span className="feature-number">{n}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="feature-rule" />
    </article>
  );
}

export function AuthPage({ mode }) {
  const { login, register, user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    subjects: [],
    qualifications: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(mode === "signup");
  const [subjectsError, setSubjectsError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (mode !== "signup") return;
    request("/subjects")
      .then(setSubjects)
      .catch((e) => setSubjectsError(e.message))
      .finally(() => setSubjectsLoading(false));
  }, [mode]);
  if (user) return <Navigate to="/app" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u =
        mode === "signup"
          ? await register(
              form.name,
              form.email,
              form.password,
              form.role,
              form.subjects,
              form.qualifications,
            )
          : await login(form.email, form.password);
      nav(
        u.role === "admin" ? "/admin" : u.role === "tutor" ? "/tutor" : "/app",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-layout">
      <aside className="auth-side">
        <Brand />
        <div className="auth-promo">
          <div className="auth-art">
            <GraduationCap size={64} />
            <span>✦</span>
          </div>
          <span className="eyebrow light">YOUR NEXT CHAPTER</span>
          <h2>Learning is better when you don't do it alone.</h2>
          <p>
            Connect with tutors who help you build confidence and reach your
            goals.
          </p>
          <div className="auth-points">
            <span>
              <CheckCircle2 size={17} /> Learning on your schedule
            </span>
            <span>
              <CheckCircle2 size={17} /> Support tailored to you
            </span>
          </div>
        </div>
        <small className="auth-foot">A little progress adds up.</small>
      </aside>
      <main className="auth-main">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
        <div className="auth-form-wrap">
          <span className="eyebrow">
            WELCOME {mode === "signup" ? "ABOARD" : "BACK"}
          </span>
          <h1>
            {mode === "signup"
              ? "Create your account"
              : "Good to see you again."}
          </h1>
          <p>
            {mode === "signup"
              ? "Start your learning journey with Tutoring Connect."
              : "Sign in to pick up where your learning left off."}
          </p>
          {error && <div className="alert">{error}</div>}
          <form onSubmit={submit} className="form-stack">
            {mode === "signup" && (
              <label>
                Full name
                <input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                />
              </label>
            )}
            {mode === "signup" && (
              <label>
                I want to join as
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                      subjects: [],
                    })
                  }
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </label>
            )}
            {mode === "signup" && form.role === "tutor" && (
              <>
                <label>
                  Subjects you tutor
                  <select
                    multiple
                    required
                    size={Math.min(subjects.length || 6, 8)}
                    disabled={subjectsLoading || Boolean(subjectsError)}
                    value={form.subjects}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subjects: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                  >
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
                <small className="form-hint">
                  Select one or more subjects so students can find you.
                </small>
                {subjectsError && <div className="alert">{subjectsError}</div>}
                <label>
                  Qualifications
                  <input
                    value={form.qualifications}
                    onChange={(e) =>
                      setForm({ ...form, qualifications: e.target.value })
                    }
                    placeholder="Your relevant qualifications or experience"
                  />
                </label>
              </>
            )}
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={
                  mode === "signup"
                    ? "At least 8 characters"
                    : "Enter your password"
                }
              />
            </label>
            {mode === "signup" && (
              <small className="form-hint">
                Use at least 8 characters for a stronger password.
              </small>
            )}
            <Button
              disabled={
                busy ||
                (mode === "signup" &&
                  form.role === "tutor" &&
                  (subjectsLoading || Boolean(subjectsError) || !form.subjects.length))
              }
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}{" "}
              <ArrowRight size={17} />
            </Button>
          </form>
          <div className="auth-switch">
            {mode === "signup"
              ? "Already have an account?"
              : "New to Tutoring Connect?"}{" "}
            <Link to={mode === "signup" ? "/login" : "/signup"}>
              {mode === "signup" ? "Log in" : "Create an account"}
            </Link>
          </div>
          <div className="secure-note">
            <ShieldCheck size={16} /> Your account is protected with secure
            authentication.
          </div>
        </div>
      </main>
    </div>
  );
}
