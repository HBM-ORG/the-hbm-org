export type LocalizedText = {
  en: string;
  he: string;
};

export type RegistrationFieldsConfig = {
  name: boolean;
  email: boolean;
  phone: boolean;
};

export type CtaFieldRule = {
  show: boolean;
  required: boolean;
};

/** Popup / hero registration field visibility + required flags (mirrors `lib/cta-form-fields.js`). */
export type CtaFormFieldsConfig = {
  name: CtaFieldRule;
  email: CtaFieldRule;
  phone: CtaFieldRule;
  source: CtaFieldRule;
  terms: CtaFieldRule;
  marketing: CtaFieldRule;
};

export type VideoEventConfig = {
  /** When false, public site hides the video block and video registration is disabled. */
  published: boolean;
  title: LocalizedText;
  /** yyyy-MM-dd in `timezone`. */
  date: string;
  time: string;
  /** IANA zone for interpreting `date` / `time` / optional end fields. */
  timezone: string;
  /** yyyy-MM-dd end date (same zone). Omit with endTime when no explicit end. */
  endDate?: string;
  endTime?: string;
  location: string;
  image: string;
  participants: number;
  registrationFields: RegistrationFieldsConfig;
  /** Normalized CTA form; legacy `registrationFields` migrates when absent. */
  formFields?: CtaFormFieldsConfig;
  /** Logical key from BREVO_LIST_IDS (e.g. `video`). Empty = server uses heuristic lists. */
  brevoListKey?: string;
  [key: string]: unknown;
};

export type HowItWorksStep = {
  [key: string]: unknown;
};

export type HowItWorksConfig = {
  videoSteps: HowItWorksStep[];
  physicalSteps: HowItWorksStep[];
  isLocked: boolean;
  [key: string]: unknown;
};

export type KnowledgeBaseBook = {
  [key: string]: unknown;
};

export type KnowledgeBaseVideo = {
  [key: string]: unknown;
};

export type KnowledgeBaseConfig = {
  books: KnowledgeBaseBook[];
  videos: KnowledgeBaseVideo[];
  isLocked: boolean;
  [key: string]: unknown;
};

export type ContentLockTarget = "howItWorks" | "knowledgeBase";
