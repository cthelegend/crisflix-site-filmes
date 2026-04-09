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
import NotFound from "./pages/NotFound";
import DmcaTerms from "./pages/DmcaTerms";
import Channels from "./pages/Channels";
import ChannelWatch from "./pages/ChannelWatch";
import Donate from "./pages/Donate";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/watch/:type/:id" element={<Watch />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/watch/channel/:slug" element={<ChannelWatch />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/legal/dmca" element={<DmcaTerms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
