import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

// Tool Pages
import ImageGeneratorPage from "./pages/tools/ImageGeneratorPage";
import VideoGeneratorPage from "./pages/tools/VideoGeneratorPage";
import AudioGeneratorPage from "./pages/tools/AudioGeneratorPage";
import CodeAssistantPage from "./pages/tools/CodeAssistantPage";
import PromptMakerPage from "./pages/tools/PromptMakerPage";
import DocumentAnalyzerPage from "./pages/tools/DocumentAnalyzerPage";
import VoiceChatPage from "./pages/tools/VoiceChatPage";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <WelcomePage />} />
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/home" replace /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      
      {/* Tool Routes */}
      <Route path="/tools/assistant" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/tools/images" element={<ProtectedRoute><ImageGeneratorPage /></ProtectedRoute>} />
      <Route path="/tools/video" element={<ProtectedRoute><VideoGeneratorPage /></ProtectedRoute>} />
      <Route path="/tools/audio" element={<ProtectedRoute><AudioGeneratorPage /></ProtectedRoute>} />
      <Route path="/tools/code" element={<ProtectedRoute><CodeAssistantPage /></ProtectedRoute>} />
      <Route path="/tools/prompt-maker" element={<ProtectedRoute><PromptMakerPage /></ProtectedRoute>} />
      <Route path="/tools/document" element={<ProtectedRoute><DocumentAnalyzerPage /></ProtectedRoute>} />
      <Route path="/tools/voice-chat" element={<ProtectedRoute><VoiceChatPage /></ProtectedRoute>} />
      <Route path="/tools/:toolId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
