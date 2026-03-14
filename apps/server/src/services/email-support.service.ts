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

export async function deliverEmail(
  transporter: { sendMail: (mailOptions: unknown) => Promise<unknown> },
  mailOptions: unknown,
): Promise<unknown> {
  return transporter.sendMail(mailOptions);
}

export function getEmailTemplate({
  body,
  config,
  trackingId,
  email,
  language,
  baseUrl,
}: {
  body: string;
  config: EmailTemplateConfig | null | undefined;
  trackingId: string;
  email: string;
  language?: string;
  baseUrl: string;
}): string {
  const styling = config?.globalStyling || {
    primaryColor: runtimeConfig.emailPrimaryColor,
    secondaryColor: runtimeConfig.emailSecondaryColor,
    signatureUrl: "",
    logoUrl: runtimeConfig.emailLogoUrl,
    fontFamily: runtimeConfig.emailFontFamily,
  };

  const primary =
    typeof styling.primaryColor === "string"
      ? styling.primaryColor
      : runtimeConfig.emailPrimaryColor;
  const secondary =
    typeof styling.secondaryColor === "string"
      ? styling.secondaryColor
      : runtimeConfig.emailSecondaryColor;
  const signatureUrl =
    typeof styling.signatureUrl === "string" ? styling.signatureUrl : "";
  const logoUrl =
    typeof styling.logoUrl === "string"
      ? styling.logoUrl
      : runtimeConfig.emailLogoUrl;
  const resolvedLogoUrl = logoUrl
    ? logoUrl.startsWith("http")
      ? logoUrl
      : `${baseUrl}${logoUrl}`
    : "";
  const trackingUrl = `${baseUrl}/api/track/open/${trackingId}`;
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  const dir = language === "he" ? "rtl" : "ltr";
  const align = language === "he" ? "right" : "left";

  return `
    <!DOCTYPE html>
    <html dir="${dir}">
    <head>
        <style>
            body { font-family: 'Sora', sans-serif; background-color: #f7f7fc; margin: 0; padding: 0; direction: ${dir}; text-align: ${align}; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7fc; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f5; text-align: ${align}; }
            .header { background: linear-gradient(135deg, ${primary}, ${secondary}); padding: 60px 40px; text-align: center; }
            .logo { width: 140px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1)); }
            .content { padding: 50px 40px; color: #1a1a1a; line-height: 1.8; font-size: 16px; text-align: ${align}; }
            .signature { margin-top: 40px; max-width: 200px; }
            .footer { padding: 40px; text-align: center; font-size: 12px; color: #a0a0b0; background: #fafafc; direction: ${dir}; }
            .btn { display: inline-block; padding: 16px 40px; background: ${secondary}; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 30px; box-shadow: 0 10px 20px ${secondary}44; }
            .tracking-pixel { display: none; }
            .unsub { color: #a0a0b0; text-decoration: underline; margin-top: 10px; display: block; }
        </style>
    </head>
    <body dir="${dir}">
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    ${resolvedLogoUrl ? `<img src="${resolvedLogoUrl}" class="logo" alt="The HBM">` : ""}
                </div>
                <div class="content">
                    ${body}
                    ${signatureUrl ? `<br><img src="${signatureUrl}" class="signature" alt="Signature">` : ""}
                </div>
                <div class="footer">
                    <strong>© 2026 The Human Being Movement</strong><br>
                    Crafting deep human connections, 8 minutes at a time.<br>
                    <a href="${unsubscribeUrl}" class="unsub">Unsubscribe from these emails</a>
                </div>
            </div>
        </div>
        <img src="${trackingUrl}" class="tracking-pixel" width="1" height="1" />
    </body>
    </html>
    `;
}
