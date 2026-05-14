const DEFAULT_PUBLIC_BRAND_STATE = Object.freeze({
  organizationName: "The HBM",
  contactEmail: "office@thehbm.org",
  whatsappPhoneE164: "972587073136",
  whatsappPhoneDisplay: "0587073136",
  syncSmsAttributeToBrevo: true,
  socialLinks: Object.freeze({
    instagram: "https://www.instagram.com/the__hbm/",
    facebook: "https://www.facebook.com/people/The-HBM/61573100935457/",
    linkedin: "https://www.linkedin.com/company/the-human-being-movement/",
    youtube: "https://www.youtube.com/@TheHBM",
  }),
  inquiryWhatsappMessage: "אשמח לקבל פרטים נוספים על הארגון",
});

let publicBrandState = {
  ...DEFAULT_PUBLIC_BRAND_STATE,
  socialLinks: { ...DEFAULT_PUBLIC_BRAND_STATE.socialLinks },
};

export function applyPublicBrandSettings(settings = {}) {
  const socialLinks = settings?.socialLinks || {};
  publicBrandState = {
    organizationName:
      String(settings?.organizationName || "").trim()
      || DEFAULT_PUBLIC_BRAND_STATE.organizationName,
    contactEmail:
      String(settings?.contactEmail || "").trim()
      || DEFAULT_PUBLIC_BRAND_STATE.contactEmail,
    whatsappPhoneE164:
      String(settings?.whatsappPhoneE164 || "").trim()
      || DEFAULT_PUBLIC_BRAND_STATE.whatsappPhoneE164,
    whatsappPhoneDisplay:
      String(settings?.whatsappPhoneDisplay || "").trim()
      || DEFAULT_PUBLIC_BRAND_STATE.whatsappPhoneDisplay,
    socialLinks: {
      instagram:
        String(socialLinks.instagram || "").trim()
        || DEFAULT_PUBLIC_BRAND_STATE.socialLinks.instagram,
      facebook:
        String(socialLinks.facebook || "").trim()
        || DEFAULT_PUBLIC_BRAND_STATE.socialLinks.facebook,
      linkedin:
        String(socialLinks.linkedin || "").trim()
        || DEFAULT_PUBLIC_BRAND_STATE.socialLinks.linkedin,
      youtube:
        String(socialLinks.youtube || "").trim()
        || DEFAULT_PUBLIC_BRAND_STATE.socialLinks.youtube,
    },
    inquiryWhatsappMessage:
      String(settings?.inquiryWhatsappMessage || "").trim()
      || DEFAULT_PUBLIC_BRAND_STATE.inquiryWhatsappMessage,
    syncSmsAttributeToBrevo: settings?.brevo?.syncSmsAttributeToBrevo !== false,
  };
}

export function buildWhatsappUrl(message = "") {
  const baseUrl = `https://wa.me/${publicBrandState.whatsappPhoneE164}`;
  const trimmedMessage = String(message || "").trim();
  return trimmedMessage
    ? `${baseUrl}?text=${encodeURIComponent(trimmedMessage)}`
    : baseUrl;
}

export const PUBLIC_BRAND = {
  get organizationName() {
    return publicBrandState.organizationName;
  },
  get contact() {
    return Object.freeze({
      email: publicBrandState.contactEmail,
      emailHref: `mailto:${publicBrandState.contactEmail}`,
      whatsappPhoneE164: publicBrandState.whatsappPhoneE164,
      whatsappPhoneDisplay: publicBrandState.whatsappPhoneDisplay,
    });
  },
  get socialLinks() {
    return Object.freeze({
      instagram: publicBrandState.socialLinks.instagram,
      whatsapp: buildWhatsappUrl(),
      facebook: publicBrandState.socialLinks.facebook,
      linkedin: publicBrandState.socialLinks.linkedin,
      youtube: publicBrandState.socialLinks.youtube,
      email: `mailto:${publicBrandState.contactEmail}`,
    });
  },
  get socialProfiles() {
    return Object.freeze([
      publicBrandState.socialLinks.instagram,
      publicBrandState.socialLinks.linkedin,
    ]);
  },
  get inquiryWhatsappUrl() {
    return buildWhatsappUrl(publicBrandState.inquiryWhatsappMessage);
  },
  get syncSmsAttributeToBrevo() {
    return publicBrandState.syncSmsAttributeToBrevo !== false;
  },
};
