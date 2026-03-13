function readEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const runtimeConfig = {
  get adminPassword() {
    return readEnv("ADMIN_PASSWORD");
  },
  get defaultSmtpHost() {
    return readEnv("DEFAULT_SMTP_HOST", "smtp.office365.com");
  },
  get defaultSmtpPort() {
    return readEnvNumber("DEFAULT_SMTP_PORT", 587);
  },
  get defaultSmtpFrom() {
    return readEnv("DEFAULT_SMTP_FROM", "The HBM <office@thehbm.org>");
  },
  get emailPrimaryColor() {
    return readEnv("EMAIL_PRIMARY_COLOR", "#6160AB");
  },
  get emailSecondaryColor() {
    return readEnv("EMAIL_SECONDARY_COLOR", "#F07B3C");
  },
  get emailLogoUrl() {
    return readEnv("EMAIL_LOGO_URL", "/logo.png");
  },
  get emailFontFamily() {
    return readEnv("EMAIL_FONT_FAMILY", "Sora, sans-serif");
  },
  get publicSiteUrl() {
    return readEnv("SITE_PUBLIC_URL", "https://www.thehbm.org");
  },
  get defaultVideoEventTitleEn() {
    return readEnv("DEFAULT_VIDEO_EVENT_TITLE_EN", "Video Event");
  },
  get defaultVideoEventTitleHe() {
    return readEnv("DEFAULT_VIDEO_EVENT_TITLE_HE", "אירוע וידאו");
  },
  get defaultVideoEventTime() {
    return readEnv("DEFAULT_VIDEO_EVENT_TIME", "20:00");
  },
  get defaultVideoEventLocation() {
    return readEnv("DEFAULT_VIDEO_EVENT_LOCATION", "Zoom / Video Call");
  },
};

export function buildBaseUrl(port: number): string {
  return readEnv("BASE_URL", `http://localhost:${port}`);
}
