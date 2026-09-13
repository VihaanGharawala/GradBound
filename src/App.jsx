import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import ProblemSolution from '@/pages/ProblemSolution';
import ProfileDiagnostic from '@/pages/ProfileDiagnostic';
import UserProfile from '@/pages/UserProfile';
import AdmissionsRadar from '@/pages/AdmissionsRadar';
import VisaRoiMatrix from '@/pages/VisaRoiMatrix';
import UniversitySearch from '@/pages/UniversitySearch';
import UniversityDetail from '@/pages/UniversityDetail';
import AppErrorBoundary from '@/components/AppErrorBoundary';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile-diagnostic" element={<ProfileDiagnostic />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/problem-solution" element={<ProblemSolution />} />
        <Route path="/admissions-radar" element={<AdmissionsRadar />} />
        <Route path="/visa-roi-matrix" element={<VisaRoiMatrix />} />
        <Route path="/university-search" element={<UniversitySearch />} />
        <Route path="/university/:id" element={<UniversityDetail />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppErrorBoundary>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        </AppErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App