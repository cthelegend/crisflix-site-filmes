import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Details from "./pages/Details";
import Watch from "./pages/Watch";
import SearchPage from "./pages/SearchPage";
import Browse from "./pages/Browse";
import Football from "./pages/Football";
import FootballWatch from "./pages/FootballWatch";
import NotFound from "./pages/NotFound";
import Donate from "./pages/Donate";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import MyListPage from "./pages/MyListPage";
import BackgroundPattern from "./components/BackgroundPattern";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="site-shell">
            <BackgroundPattern />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/details/:type/:id" element={<Details />} />
              <Route path="/watch/:type/:id" element={<Watch />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/browse/:category" element={<Browse />} />
              <Route path="/futebol" element={<Football />} />
              <Route path="/futebol/:slug" element={<FootballWatch />} />
              {/* Retired channel links must not reach the movie/TV player. */}
              <Route path="/watch/channel/*" element={<NotFound />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/quem-somos" element={<About />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-list" element={<MyListPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
