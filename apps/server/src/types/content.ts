export type LocalizedText = {
  en: string;
  he: string;
};

export type RegistrationFieldsConfig = {
  name: boolean;
  email: boolean;
  phone: boolean;
};

export type VideoEventConfig = {
  title: LocalizedText;
  date: string;
  time: string;
  location: string;
  image: string;
  participants: number;
  registrationFields: RegistrationFieldsConfig;
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
