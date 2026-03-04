import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Guards
import PrivateRoute from "@/components/guards/PrivateRoute";
import AdminRoute from "@/components/guards/AdminRoute";
import StudentRoute from "@/components/guards/StudentRoute";

// Layouts
import AuthLayout from "@/components/layouts/AuthLayout";
import StudentLayout from "@/components/layouts/StudentLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

// Pages
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import StudentDashboard from "@/pages/StudentDashboard";
import StudentAssignmentDetail from "@/pages/StudentAssignmentDetail";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminAssignmentList from "@/pages/AdminAssignmentList";
import AdminAssignmentDetail from "@/pages/AdminAssignmentDetail";
import CreateAssignment from "@/pages/CreateAssignment";
import AdminStudentList from "@/pages/AdminStudentList";
import Profile from "@/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public — Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public — Auth (centered card layout) */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Route>

        {/* Student routes */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard/assignments/:id" element={<StudentAssignmentDetail />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/assignments" element={<AdminAssignmentList />} />
            <Route path="/admin/assignments/new" element={<CreateAssignment />} />
            <Route path="/admin/assignments/:id" element={<AdminAssignmentDetail />} />
            <Route path="/admin/assignments/:id/edit" element={<CreateAssignment />} />
            <Route path="/admin/students" element={<AdminStudentList />} />
          </Route>
        </Route>

        {/* Private (any authenticated user) */}
        <Route element={<PrivateRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
