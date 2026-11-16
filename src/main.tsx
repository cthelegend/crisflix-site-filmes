import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SitePreferencesProvider } from "./contexts/SitePreferencesContext";

createRoot(document.getElementById("root")!).render(<SitePreferencesProvider><App /></SitePreferencesProvider>);
