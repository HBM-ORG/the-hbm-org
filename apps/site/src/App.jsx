import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { EventsProvider } from "./context/EventsContext.jsx";
import { I18nProvider } from "./i18n/context.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { initAnalytics, trackPageView } from "./utils/analytics.js";

const MeeterWhat = lazy(() => import("./pages/MeeterWhat.jsx"));
const MeeterWho = lazy(() => import("./pages/MeeterWho.jsx"));
const MeeterFeatures = lazy(() => import("./pages/MeeterFeatures.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const TeamMember = lazy(() => import("./pages/TeamMember.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Events = lazy(() => import("./pages/Events.jsx"));
const EventDetails = lazy(() => import("./pages/EventDetails.jsx"));
const Knowledge = lazy(() => import("./pages/Knowledge.jsx"));
const EventRegister = lazy(() => import("./pages/EventRegister.jsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.jsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.jsx"));

function PageLoader() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [hash, pathname]);

  return null;
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function PreviewRouteBootstrap() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("embedPreview") !== "1") return;
    if (location.pathname !== "/") return;

    const previewPath = String(params.get("previewPath") || "").trim();
    if (!previewPath) return;

    const target = new URL(
      previewPath.startsWith("/") ? previewPath : `/${previewPath}`,
      window.location.origin,
    );
    const targetParams = new URLSearchParams(target.search);
    targetParams.set("embedPreview", "1");

    navigate(
      `${target.pathname}${targetParams.toString() ? `?${targetParams.toString()}` : ""}${target.hash}`,
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  return null;
}

export default function App() {
  useEffect(() => {
    const runAnalytics = () => initAnalytics();
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(runAnalytics, { timeout: 2500 });
    } else {
      setTimeout(runAnalytics, 500);
    }
  }, []);

  return (
    <I18nProvider>
      <EventsProvider>
        <BrowserRouter>
          <ScrollToHash />
          <AnalyticsTracker />
          <PreviewRouteBootstrap />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route
                path="/meeter"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MeeterWhat />
                  </Suspense>
                }
              />
              <Route
                path="/meeter/who"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MeeterWho />
                  </Suspense>
                }
              />
              <Route
                path="/meeter/features"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MeeterFeatures />
                  </Suspense>
                }
              />
              <Route
                path="/events"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Events />
                  </Suspense>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventDetails />
                  </Suspense>
                }
              />
              <Route
                path="/events/register"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventRegister />
                  </Suspense>
                }
              />
              <Route
                path="/register"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventRegister />
                  </Suspense>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Knowledge />
                  </Suspense>
                }
              />
              <Route
                path="/knowledge/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Knowledge />
                  </Suspense>
                }
              />
              <Route
                path="/knowledge/:id/:slug"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Knowledge />
                  </Suspense>
                }
              />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <About />
                  </Suspense>
                }
              />
              <Route
                path="/about/team/:slug"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TeamMember />
                  </Suspense>
                }
              />
              <Route
                path="/contact"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Contact />
                  </Suspense>
                }
              />
              <Route
                path="/cookie-policy"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CookiePolicy />
                  </Suspense>
                }
              />
              <Route
                path="/termsofuse"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LegalPage type="terms" />
                  </Suspense>
                }
              />
              <Route
                path="/termsofuse/"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LegalPage type="terms" />
                  </Suspense>
                }
              />
              <Route
                path="/privacypolicy"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LegalPage type="privacy" />
                  </Suspense>
                }
              />
              <Route
                path="/privacypolicy/"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LegalPage type="privacy" />
                  </Suspense>
                }
              />
              <Route
                path="/b2b"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MeeterWho />
                  </Suspense>
                }
              />
              <Route
                path="/faq"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MeeterWhat />
                  </Suspense>
                }
              />
              <Route
                path="/gallery"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Events />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </EventsProvider>
    </I18nProvider>
  );
}
