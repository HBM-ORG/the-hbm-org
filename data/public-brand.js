const WHATSAPP_PHONE_E164 = "972587073136";
const WHATSAPP_PHONE_DISPLAY = "0587073136";
const CONTACT_EMAIL = "office@thehbm.org";

export function buildWhatsappUrl(message = "") {
  const baseUrl = `https://wa.me/${WHATSAPP_PHONE_E164}`;
  const trimmedMessage = String(message || "").trim();
  return trimmedMessage
    ? `${baseUrl}?text=${encodeURIComponent(trimmedMessage)}`
    : baseUrl;
}

export const PUBLIC_BRAND = Object.freeze({
  organizationName: "The HBM",
  contact: Object.freeze({
    email: CONTACT_EMAIL,
    emailHref: `mailto:${CONTACT_EMAIL}`,
    whatsappPhoneE164: WHATSAPP_PHONE_E164,
    whatsappPhoneDisplay: WHATSAPP_PHONE_DISPLAY,
  }),
  socialLinks: Object.freeze({
    instagram: "https://www.instagram.com/the__hbm/",
    whatsapp: buildWhatsappUrl(),
    facebook: "https://www.facebook.com/people/The-HBM/61573100935457/",
    linkedin: "https://www.linkedin.com/company/the-human-being-movement/",
    youtube: "https://www.youtube.com/@TheHBM",
    email: `mailto:${CONTACT_EMAIL}`,
  }),
  socialProfiles: Object.freeze([
    "https://www.instagram.com/the__hbm/",
    "https://www.linkedin.com/company/the-human-being-movement/",
  ]),
  inquiryWhatsappUrl: buildWhatsappUrl(
    "אשמח לקבל פרטים נוספים על הארגון",
  ),
});
