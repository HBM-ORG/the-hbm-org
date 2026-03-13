import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { EventsProvider } from "./context/EventsContext.jsx";
import { I18nProvider } from "./i18n/context.jsx";
import AdminShell from "./AdminShell.jsx";
import { getSiteUrl, joinUrl } from "./utils/api.js";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f4f6fb]"
      aria-hidden="true"
    >
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SiteOwnedRedirect({ targetPath }) {
  const destination = joinUrl(getSiteUrl(), targetPath);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace(destination);
    }
  }, [destination]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] px-6 text-center">
      <p className="text-sm font-semibold text-slate-600">
        Redirecting to the public site. If nothing happens,{" "}
        <a className="text-indigo-600 underline" href={destination}>
          open it here
        </a>
        .
      </p>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <EventsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminShell />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
              <Route path="/admin" element={<Navigate to="/" replace />} />
              <Route
                path="/admin-dashboard"
                element={<Navigate to="/" replace />}
              />
              <Route
                path="/visual-sitemap.html"
                element={<SiteOwnedRedirect targetPath="/visual-sitemap.html" />}
              />
              <Route
                path="/sitemap.xml"
                element={<SiteOwnedRedirect targetPath="/sitemap.xml" />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </EventsProvider>
    </I18nProvider>
  );
}
