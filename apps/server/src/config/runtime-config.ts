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
    return readEnv("EMAIL_LOGO_URL");
  },
  get emailFontFamily() {
    return readEnv("EMAIL_FONT_FAMILY", "Sora, sans-serif");
  },
  get publicSiteUrl() {
    return readEnv("SITE_PUBLIC_URL", readEnv("SITE_APP_URL"));
  },
  get emailProvider() {
    return readEnv("EMAIL_PROVIDER", "smtp").toLowerCase();
  },
  get brevoApiUrl() {
    return readEnv("BREVO_API_URL", "https://api.brevo.com/v3");
  },
  get brevoApiKey() {
    return readEnv("BREVO_API_KEY");
  },
  get brevoWebhookSecret() {
    return readEnv("BREVO_WEBHOOK_SECRET");
  },
  get brevoListIds() {
    return readEnv("BREVO_LIST_IDS");
  },
  /**
   * Before registration upsert, remove the email from the same Brevo list IDs that will be POSTed
   * (explicit CTA lists or heuristic-derived lists) so list automations can fire again on repeat signup.
   * No effect unless the registration flow passes registrationListReentry and at least one target list id exists.
   */
  get brevoRegistrationListReentry() {
    const raw = process.env.BREVO_REGISTRATION_LIST_REENTRY;
    return typeof raw === "string" && /^(1|true|yes)$/i.test(raw.trim());
  },
  get espoCrmUrl() {
    return readEnv("ESPOCRM_URL");
  },
  get espoCrmApiKey() {
    return readEnv("ESPOCRM_API_KEY");
  },
  get espoCrmWebhookSecret() {
    return readEnv("ESPOCRM_WEBHOOK_SECRET");
  },
  get espoCrmContactEntity() {
    return readEnv("ESPOCRM_CONTACT_ENTITY", "Contact");
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
  void port;
  return readEnv("BASE_URL");
}
