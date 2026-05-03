import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import ClientList from "./pages/trainer/ClientList";
import AddClient from "./pages/trainer/AddClient";
import ClientDetail from "./pages/trainer/ClientDetail";
import WorkoutLibrary from "./pages/trainer/WorkoutLibrary";
import AssignWorkout from "./pages/trainer/AssignWorkout";
import TrainerProfile from "./pages/trainer/TrainerProfile";
import TrainerPricing from "./pages/trainer/TrainerPricing";
import Chat from "./pages/trainer/Chat";
import Broadcast from "./pages/trainer/Broadcast";
import Payments from "./pages/trainer/Payments";
import Alerts from "./pages/trainer/Alerts";
import InviteClient from "./pages/trainer/InviteClient";
import ProgressPhotos from "./pages/trainer/ProgressPhotos";
import CheckIn from "./pages/trainer/CheckIn";
import PaymentReminder from "./pages/trainer/PaymentReminder";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isTrainer, loading: roleLoading } = useRole();
  if (authLoading || roleLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (isTrainer) return <Navigate to="/trainer" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRoute><Dashboard /></RoleRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/trainer" element={<ProtectedRoute><TrainerDashboard /></ProtectedRoute>} />
          <Route path="/trainer/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
          <Route path="/trainer/clients/new" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
          <Route path="/trainer/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
          <Route path="/trainer/workouts" element={<ProtectedRoute><WorkoutLibrary /></ProtectedRoute>} />
          <Route path="/trainer/workouts/assign" element={<ProtectedRoute><AssignWorkout /></ProtectedRoute>} />
          <Route path="/trainer/profile" element={<ProtectedRoute><TrainerProfile /></ProtectedRoute>} />
          <Route path="/trainer/pricing" element={<ProtectedRoute><TrainerPricing /></ProtectedRoute>} />
          <Route path="/trainer/chat/:clientId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/trainer/broadcast" element={<ProtectedRoute><Broadcast /></ProtectedRoute>} />
          <Route path="/trainer/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/trainer/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/trainer/invite" element={<ProtectedRoute><InviteClient /></ProtectedRoute>} />
          <Route path="/trainer/clients/:id/photos" element={<ProtectedRoute><ProgressPhotos /></ProtectedRoute>} />
          <Route path="/trainer/clients/:id/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
          <Route path="/trainer/payments/reminder" element={<ProtectedRoute><PaymentReminder /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
