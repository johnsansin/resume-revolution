import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import RequireAuth from "@/components/ProtectedRoute";
import AdminRedirect from "@/components/AdminRedirect";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLoader from "@/components/AppLoader";

// Lazy load all page components for code splitting
const Landing = lazy(() => import("./views/Landing"));
const Auth = lazy(() => import("./views/Auth"));
const ResetPassword = lazy(() => import("./views/ResetPassword"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const Letters = lazy(() => import("./views/Letters"));
const Settings = lazy(() => import("./views/Settings"));
const NotFound = lazy(() => import("./views/NotFound"));
const AdminDashboard = lazy(() => import("./views/admin/Dashboard"));
const AdminUsers = lazy(() => import("./views/admin/UserManagement"));
const AdminCVs = lazy(() => import("./views/admin/ContentModeration"));
const AdminRoles = lazy(() => import("./views/admin/RoleManagement"));
const AdminLoginHistory = lazy(() => import("./views/admin/LoginHistory"));
const AdminRecycleBin = lazy(() => import("./views/admin/RecycleBin"));
const AdminSupport = lazy(() => import("./views/admin/Support"));
const AdminSettings = lazy(() => import("./views/admin/Settings"));
const SharedCV = lazy(() => import("./views/SharedCV"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!user || !user.roles?.includes('admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const PageLoader = () => <AppLoader message="Preparing your workspace" />;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ColorThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/shared-cv/:token" element={<SharedCV />} />
                  <Route element={<RequireAuth />}>
                    <Route path="/dashboard" element={<AdminRedirect><Dashboard /></AdminRedirect>} />
                    <Route path="/letters" element={<AdminRedirect><Letters /></AdminRedirect>} />
                    <Route path="/settings" element={<AdminRedirect to="/admin/settings"><Settings /></AdminRedirect>} />
                  </Route>
                  <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                  <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
                  <Route path="/admin/cvs" element={<RequireAdmin><AdminCVs /></RequireAdmin>} />
                  <Route path="/admin/roles" element={<RequireAdmin><AdminRoles /></RequireAdmin>} />
                  <Route path="/admin/login-history" element={<RequireAdmin><AdminLoginHistory /></RequireAdmin>} />
                  <Route path="/admin/recycle-bin" element={<RequireAdmin><AdminRecycleBin /></RequireAdmin>} />
                  <Route path="/admin/support" element={<RequireAdmin><AdminSupport /></RequireAdmin>} />
                  <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
        </ColorThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
