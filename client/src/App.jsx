import { Routes, Route, Navigate } from "react-router-dom";
import { Protected, AppShell } from "./components/AppComponents";
import { Landing, AuthPage } from "./pages/PublicPages";
import { StudentDashboard, Subjects, Tutors, TutorProfile, MyBookings, Profile, PlatformRating } from "./pages/StudentPages";
import { AdminDashboard, AdminUsers, AdminTutors, AdminSubjects, AdminAvailability } from "./pages/AdminPages";
import { TutorDashboard, TutorAvailability } from "./pages/TutorPages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route
        path="/app"
        element={
          <Protected roles={["student"]}>
            <AppShell>
              <StudentDashboard />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/subjects"
        element={
          <Protected>
            <AppShell>
              <Subjects />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/subjects/:subjectId/tutors"
        element={
          <Protected>
            <AppShell>
              <Tutors />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/tutors/:id"
        element={
          <Protected>
            <AppShell>
              <TutorProfile />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/bookings"
        element={
          <Protected>
            <AppShell staff>
              <MyBookings />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <AppShell staff={false}>
              <Profile />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/rate-platform"
        element={
          <Protected roles={["student", "tutor"]}>
            <AppShell>
              <PlatformRating />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected roles={["admin"]}>
            <AppShell staff>
              <AdminDashboard />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Protected roles={["admin"]}>
            <AppShell staff>
              <AdminUsers />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/admin/tutors"
        element={
          <Protected roles={["admin"]}>
            <AppShell staff>
              <AdminTutors />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <Protected roles={["admin"]}>
            <AppShell staff>
              <AdminSubjects />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/admin/availability"
        element={
          <Protected roles={["admin"]}>
            <AppShell staff>
              <AdminAvailability />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/tutor"
        element={
          <Protected roles={["tutor"]}>
            <AppShell staff>
              <TutorDashboard />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/tutor/availability"
        element={
          <Protected roles={["tutor"]}>
            <AppShell staff>
              <TutorAvailability />
            </AppShell>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
