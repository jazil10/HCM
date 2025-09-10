import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthProvider';
import type { ReactNode } from 'react';
import EmployeesPage from './pages/EmployeesPage';
import TeamsPage from './pages/TeamsPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage';
import MyTeamPage from './pages/MyTeamPage';
import MyProfilePage from './pages/MyProfilePage';
import LeavePage from './pages/LeavePage';
import InternshipApplicationsPage from './pages/InternshipApplicationsPage';
import InternshipApplicationDetailsPage from './pages/InternshipApplicationDetailsPage';
import InternshipProgramsPage from './pages/InternshipProgramsPage';
import InternshipProgramDetailsPage from './pages/InternshipProgramDetailsPage';
import EditInternshipProgramPage from './pages/EditInternshipProgramPage';
import CreateProgramForm from './components/internship/CreateProgramForm';
import InternshipApplicationForm from './components/internship/InternshipApplicationForm';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply/:slug" element={<InternshipApplicationForm />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:employeeId" element={<EmployeeDetailsPage />} />
        <Route path="teams" element={<TeamsPage />} />        <Route path="teams/:teamId" element={<TeamDetailsPage />} />
        <Route path="my-team" element={<MyTeamPage />} />        <Route path="my-profile" element={<MyProfilePage />} />        <Route path="attendance" element={<AttendancePage />} />        <Route path="leaves" element={<LeavePage />} />        <Route path="internships" element={<InternshipProgramsPage />} />
        <Route path="internships/programs/new" element={<CreateProgramForm />} />
        <Route path="internships/programs/:id" element={<InternshipProgramDetailsPage />} />
        <Route path="internships/programs/:id/edit" element={<EditInternshipProgramPage />} />
        <Route path="internships/applications" element={<InternshipApplicationsPage />} />
        <Route path="internships/applications/:id" element={<InternshipApplicationDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;