import { runtimeConfig } from "../config/runtime-config.js";

type JsonRecord = Record<string, unknown>;

export type SmtpConfigShape = {
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
  from?: string;
  secure?: boolean;
  [key: string]: unknown;
};

type EmailTemplateConfig = {
  globalStyling?: JsonRecord;
};

type TemplateOverrides = JsonRecord | null | undefined;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSmtpConfig(
  smtp: SmtpConfigShape | null | undefined,
): SmtpConfigShape | null | undefined {
  if (!smtp || !smtp.host) return smtp;
  const host = String(smtp.host).toLowerCase();
  if (host.includes("office365") || host.includes("outlook")) {
    return {
      ...smtp,
      host: "smtp.office365.com",
      port: 587,
      secure: false,
    };
  }

  return {
    ...smtp,
    host: smtp.host.trim().toLowerCase(),
    port: parseInt(String(smtp.port), 10) || 587,
  };
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function boolValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function resolveUrl(value: unknown, baseUrl: string) {
  const raw = stringValue(value);
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `${baseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function backgroundCss({
  type,
  flat,
  from,
  to,
  angle,
}: {
  type: string;
  flat: string;
  from: string;
  to: string;
  angle: number;
}) {
  if (type === "gradient") {
    return `linear-gradient(${angle}deg, ${from || flat}, ${to || flat})`;
  }
  return flat;
}

function textCss({
  type,
  flat,
  from,
  to,
  angle,
}: {
  type: string;
  flat: string;
  from: string;
  to: string;
  angle: number;
}) {
  if (type === "gradient") {
    return `color: ${flat}; background-image: linear-gradient(${angle}deg, ${from || flat}, ${to || flat}); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;`;
  }
  return `color: ${flat};`;
}

export async function deliverEmail(
  transporter: { sendMail: (mailOptions: unknown) => Promise<unknown> },
  mailOptions: unknown,
): Promise<unknown> {
  return transporter.sendMail(mailOptions);
}

export function getEmailTemplate({
  body,
  config,
  templateOverrides,
  trackingId,
  email,
  language,
  baseUrl,
}: {
  body: string;
  config: EmailTemplateConfig | null | undefined;
  templateOverrides?: TemplateOverrides;
  trackingId: string;
  email: string;
  language?: string;
  baseUrl: string;
}): string {
  const parts = getEmailTemplateParts({ config, templateOverrides, email, language, baseUrl });
  const trackingUrl = `${baseUrl}/api/track/open/${trackingId}`;
  const dir = language === "he" ? "rtl" : "ltr";
  const align = language === "he" ? "right" : "left";

  return `
    <!DOCTYPE html>
    <html dir="${dir}">
    <head>
        <style>
            body { font-family: ${parts.fontFamily}; background-color: #f7f7fc; margin: 0; padding: 0; direction: ${dir}; text-align: ${align}; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7fc; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f5; text-align: ${align}; }
            .content { padding: 50px 40px; color: #1a1a1a; line-height: 1.8; font-size: 16px; text-align: ${align}; }
            .signature { margin-top: 40px; max-width: 200px; }
            .btn { display: inline-block; padding: 16px 40px; background: ${parts.secondaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 30px; box-shadow: 0 10px 20px ${parts.secondaryColor}44; }
            .tracking-pixel { display: none; }
        </style>
    </head>
    <body dir="${dir}">
        <div class="wrapper">
            <div class="container">
                ${parts.headerHtml}
                <div class="content">
                    ${body}
                    ${parts.signatureUrl ? `<br><img src="${parts.signatureUrl}" class="signature" alt="Signature">` : ""}
                </div>
                ${parts.footerHtml}
            </div>
        </div>
        <img src="${trackingUrl}" class="tracking-pixel" width="1" height="1" />
    </body>
    </html>
    `;
}

export function getEmailTemplateParts({
  config,
  templateOverrides,
  email,
  language,
  baseUrl,
}: {
  config: EmailTemplateConfig | null | undefined;
  templateOverrides?: TemplateOverrides;
  email: string;
  language?: string;
  baseUrl: string;
}) {
  const styling = config?.globalStyling || {
    primaryColor: runtimeConfig.emailPrimaryColor,
    secondaryColor: runtimeConfig.emailSecondaryColor,
    signatureUrl: "",
    logoUrl: runtimeConfig.emailLogoUrl,
    fontFamily: runtimeConfig.emailFontFamily,
  };
  const overrides = templateOverrides && typeof templateOverrides === "object" ? templateOverrides : {};

  const primary =
    stringValue(overrides.primaryColor, stringValue(styling.primaryColor, runtimeConfig.emailPrimaryColor));
  const secondary =
    stringValue(overrides.secondaryColor, stringValue(styling.secondaryColor, runtimeConfig.emailSecondaryColor));
  const fontFamily = stringValue(styling.fontFamily, runtimeConfig.emailFontFamily);
  const signatureUrl = resolveUrl(stringValue(overrides.signatureUrl, stringValue(styling.signatureUrl)), baseUrl);
  const logoUrl = resolveUrl(stringValue(overrides.logoUrl, stringValue(styling.logoUrl, runtimeConfig.emailLogoUrl)), baseUrl);
  const headerImageUrl = resolveUrl(stringValue(overrides.headerImageUrl, stringValue(styling.headerImageUrl)), baseUrl);
  const headerLogoUrl = headerImageUrl || logoUrl;
  const footerImageUrl = resolveUrl(stringValue(overrides.footerImageUrl, stringValue(styling.footerImageUrl)), baseUrl);
  const unsubscribeUrl = stringValue(overrides.unsubscribeUrl, stringValue(styling.unsubscribeUrl)) || `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;
  const unsubscribeLabel = stringValue(overrides.unsubscribeLabel, stringValue(styling.unsubscribeLabel, "Unsubscribe from these emails"));
  const footerText = stringValue(overrides.footerText, stringValue(styling.footerText, "© 2026 The Human Being Movement<br>Crafting deep human connections, 8 minutes at a time."));
  const headerTitle = stringValue(overrides.headerTitle, stringValue(styling.headerTitle));
  const headerSubtitle = stringValue(overrides.headerSubtitle, stringValue(styling.headerSubtitle));
  const headerMode = stringValue(overrides.headerMode, stringValue(styling.headerMode, "gradient"));
  const useDefaultHeader = boolValue(overrides.useDefaultHeader, boolValue(styling.useDefaultHeader, true));
  const useDefaultFooter = boolValue(overrides.useDefaultFooter, boolValue(styling.useDefaultFooter, true));
  const headerBackgroundColor = stringValue(overrides.headerBackgroundColor, stringValue(styling.headerBackgroundColor, primary));
  const headerBackgroundType = stringValue(overrides.headerBackgroundType, stringValue(styling.headerBackgroundType, "gradient"));
  const headerGradientFrom = stringValue(overrides.headerGradientFrom, stringValue(styling.headerGradientFrom, headerBackgroundColor));
  const headerGradientTo = stringValue(overrides.headerGradientTo, stringValue(styling.headerGradientTo, secondary));
  const headerGradientAngle = numberValue(overrides.headerGradientAngle, numberValue(styling.headerGradientAngle, 135));
  const headerTextColor = stringValue(overrides.headerTextColor, stringValue(styling.headerTextColor, "#ffffff"));
  const headerTextType = stringValue(overrides.headerTextType, stringValue(styling.headerTextType, "flat"));
  const headerTextGradientFrom = stringValue(overrides.headerTextGradientFrom, stringValue(styling.headerTextGradientFrom, headerTextColor));
  const headerTextGradientTo = stringValue(overrides.headerTextGradientTo, stringValue(styling.headerTextGradientTo, "#F7D5FF"));
  const headerTextGradientAngle = numberValue(overrides.headerTextGradientAngle, numberValue(styling.headerTextGradientAngle, 135));
  const footerBackgroundColor = stringValue(overrides.footerBackgroundColor, stringValue(styling.footerBackgroundColor, "#fafafc"));
  const footerBackgroundType = stringValue(overrides.footerBackgroundType, stringValue(styling.footerBackgroundType, "flat"));
  const footerGradientFrom = stringValue(overrides.footerGradientFrom, stringValue(styling.footerGradientFrom, footerBackgroundColor));
  const footerGradientTo = stringValue(overrides.footerGradientTo, stringValue(styling.footerGradientTo, secondary));
  const footerGradientAngle = numberValue(overrides.footerGradientAngle, numberValue(styling.footerGradientAngle, 135));
  const footerTextColor = stringValue(overrides.footerTextColor, stringValue(styling.footerTextColor, "#a0a0b0"));
  const footerTextType = stringValue(overrides.footerTextType, stringValue(styling.footerTextType, "flat"));
  const footerTextGradientFrom = stringValue(overrides.footerTextGradientFrom, stringValue(styling.footerTextGradientFrom, footerTextColor));
  const footerTextGradientTo = stringValue(overrides.footerTextGradientTo, stringValue(styling.footerTextGradientTo, secondary));
  const footerTextGradientAngle = numberValue(overrides.footerTextGradientAngle, numberValue(styling.footerTextGradientAngle, 135));

  const dir = language === "he" ? "rtl" : "ltr";
  const headerBaseBackground = backgroundCss({
    type: headerBackgroundType,
    flat: headerBackgroundColor,
    from: headerGradientFrom,
    to: headerGradientTo,
    angle: headerGradientAngle,
  });
  const footerBackground = backgroundCss({
    type: footerBackgroundType,
    flat: footerBackgroundColor,
    from: footerGradientFrom,
    to: footerGradientTo,
    angle: footerGradientAngle,
  });
  const headerBackground = headerMode === "image" && headerImageUrl
    ? `background: ${headerBackgroundColor}; background-image: linear-gradient(${headerGradientAngle}deg, ${headerGradientFrom}88, ${headerGradientTo}88), url('${headerImageUrl}'); background-size: cover; background-position: center;`
    : `background: ${headerBaseBackground};`;
  const headerTextStyle = textCss({
    type: headerTextType,
    flat: headerTextColor,
    from: headerTextGradientFrom,
    to: headerTextGradientTo,
    angle: headerTextGradientAngle,
  });
  const footerTextStyle = textCss({
    type: footerTextType,
    flat: footerTextColor,
    from: footerTextGradientFrom,
    to: footerTextGradientTo,
    angle: footerTextGradientAngle,
  });
  const headerHtml = useDefaultHeader
    ? `<div style="${headerBackground} padding: 56px 40px; text-align: center; color: ${headerTextColor};">
        ${headerLogoUrl ? `<img src="${headerLogoUrl}" style="width: 140px; max-width: 70%; max-height: 72px; object-fit: contain; margin-bottom: ${headerTitle || headerSubtitle ? "18px" : "0"};" alt="The HBM">` : ""}
        ${headerTitle ? `<div style="font-size: 24px; font-weight: 900; line-height: 1.2; ${headerTextStyle}">${escapeHtml(headerTitle)}</div>` : ""}
        ${headerSubtitle ? `<div style="font-size: 14px; font-weight: 700; opacity: 0.86; margin-top: 8px; ${headerTextStyle}">${escapeHtml(headerSubtitle)}</div>` : ""}
      </div>`
    : "";
  const footerHtml = useDefaultFooter
    ? `<div style="padding: 36px 40px; text-align: center; font-size: 12px; ${footerTextStyle} background: ${footerBackground}; direction: ${dir};">
        ${footerImageUrl ? `<img src="${footerImageUrl}" style="max-width: 140px; max-height: 60px; object-fit: contain; margin-bottom: 18px;" alt="">` : ""}
        <div>${footerText}</div>
        <a href="${unsubscribeUrl}" style="${footerTextStyle} text-decoration: underline; margin-top: 12px; display: block;">${escapeHtml(unsubscribeLabel)}</a>
      </div>`
    : "";

  return {
    primaryColor: primary,
    secondaryColor: secondary,
    fontFamily,
    signatureUrl,
    logoUrl,
    headerLogoUrl,
    headerHtml,
    footerHtml,
    headerTitle,
    headerSubtitle,
    headerBackgroundType,
    headerBackgroundColor,
    headerGradientFrom,
    headerGradientTo,
    headerGradientAngle,
    headerTextColor,
    headerTextType,
    headerTextGradientFrom,
    headerTextGradientTo,
    headerTextGradientAngle,
    footerText,
    footerBackgroundType,
    footerBackgroundColor,
    footerGradientFrom,
    footerGradientTo,
    footerGradientAngle,
    footerTextColor,
    footerTextType,
    footerTextGradientFrom,
    footerTextGradientTo,
    footerTextGradientAngle,
    unsubscribeUrl,
    unsubscribeLabel,
    useDefaultHeader,
    useDefaultFooter,
  };
}
