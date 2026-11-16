import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route } from "react-router-dom";
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
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookieBanner from "./components/CookieBanner";
import LeftLibrary from "./pages/LeftLibrary";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MyListPage from "./pages/MyListPage";
import SiteLayout from "./components/SiteLayout";
import InitialDestination from "./components/InitialDestination";

import { lazy, Suspense } from "react";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
const AdminPage = lazy(() => import("./pages/AdminPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteContentProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <InitialDestination>
          <SiteLayout>
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
            <Route path="/termos" element={<TermsPage />} />
            <Route path="/privacidade" element={<PrivacyPage />} />
            <Route path="/biblioteca" element={<LeftLibrary />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cris" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><AdminPage /></Suspense>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-list" element={<MyListPage />} />
            <Route path="*" element={<NotFound />} />
          </SiteLayout>
          </InitialDestination>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </SiteContentProvider>
  </QueryClientProvider>
);

export default App;
