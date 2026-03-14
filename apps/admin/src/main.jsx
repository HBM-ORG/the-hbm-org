import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { applyPublicBrandSettings } from "./config/public-brand.js";
import { getApiBase } from "./utils/api.js";

async function bootstrap() {
  try {
    const base = getApiBase();
    if (base) {
      const response = await fetch(`${base}/api/site-settings`);
      if (response.ok) {
        applyPublicBrandSettings(await response.json());
      }
    }
  } catch (error) {
    console.warn("Unable to load site settings from API", error);
  }

  const { default: App } = await import("./App.jsx");

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  );
}

bootstrap();
