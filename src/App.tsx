import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/ProtectedRoute";
import AdminRedirect from "@/components/AdminRedirect";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Letters from "./pages/Letters";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/UserManagement";
import AdminCVs from "./pages/admin/ContentModeration";
import AdminRoles from "./pages/admin/RoleManagement";
import AdminLoginHistory from "./pages/admin/LoginHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
              <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<AdminRedirect><Dashboard /></AdminRedirect>} />
                <Route path="/letters" element={<AdminRedirect><Letters /></AdminRedirect>} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/cvs" element={<AdminCVs />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
              <Route path="/admin/login-history" element={<AdminLoginHistory />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
