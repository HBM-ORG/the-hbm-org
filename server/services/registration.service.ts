import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type RegistrationAutomationPayload = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  acquisitionSource?: string | null;
  registrationSource?: string | null;
  source?: string | null;
  category?: string | null;
  eventId?: string | null;
  eventName?: string | null;
  date: string;
  language?: string | null;
  status?: string | null;
  history: unknown;
};

export type TriggerAutomationByEvent = (
  triggerType: string,
  userData: RegistrationAutomationPayload,
) => Promise<void>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

function serializeRegistration(row: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  acquisitionSource: string | null;
  registrationSource: string | null;
  source: string | null;
  category: string | null;
  eventId: string | null;
  eventName: string | null;
  date: Date;
  language: string | null;
  status: string | null;
  history: unknown;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    acquisitionSource: row.acquisitionSource,
    registrationSource: row.registrationSource,
    source: row.source,
    category: row.category,
    eventId: row.eventId,
    eventName: row.eventName,
    date: row.date.toISOString(),
    timestamp: row.createdAt.toISOString(),
    language: row.language,
    status: row.status,
    history: row.history,
  };
}

export async function createRegistration(input: {
  name: string;
  email: string;
  phone: string;
  source?: string;
  regSource?: string;
  eventId?: string;
  eventName?: string;
  language?: string;
}) {
  const history = [
    {
      type: "registration",
      date: new Date().toISOString(),
      message: `Registered for ${input.eventName || "General"}`,
    },
  ];

  const row = await prisma.registration.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      acquisitionSource: input.source || "Direct",
      registrationSource: input.regSource || "website_general",
      source: input.regSource || input.source || "Direct Web",
      category: input.eventId === "video-event" ? "Video Lead" : "Event Lead",
      eventId: input.eventId || "general",
      eventName: input.eventName || "General Registration",
      date: new Date(),
      language: input.language || "en",
      status: "confirmed",
      history,
    },
  });

  return {
    row,
    automationPayload: {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      acquisitionSource: row.acquisitionSource,
      registrationSource: row.registrationSource,
      source: row.source,
      category: row.category,
      eventId: row.eventId,
      eventName: row.eventName,
      date: row.date.toISOString(),
      language: row.language,
      status: row.status,
      history: row.history || history,
    } satisfies RegistrationAutomationPayload,
  };
}

export async function createOrUpdateNewsletterRegistration(input: {
  email: string;
  name?: string;
  language?: string;
  source?: string;
}) {
  const existing = await prisma.registration.findFirst({
    where: { email: input.email },
  });

  if (!existing) {
    const row = await prisma.registration.create({
      data: {
        name: input.name || "Subscriber",
        email: input.email,
        phone: "",
        acquisitionSource: null,
        registrationSource: null,
        source: input.source || "Newsletter Footer",
        category: "Subscriber",
        eventId: "newsletter",
        eventName: "Newsletter Subscription",
        date: new Date(),
        language: input.language || "en",
        status: "confirmed",
        history: [
          {
            type: "subscription",
            date: new Date().toISOString(),
            message: "Subscribed to Newsletter",
          },
        ],
      },
    });

    return {
      automationPayload: {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        source: row.source,
        category: row.category,
        date: row.date.toISOString(),
        language: row.language,
        status: row.status,
        history: row.history,
      } satisfies RegistrationAutomationPayload,
    };
  }

  const newHistory = [
    ...(Array.isArray(existing.history) ? existing.history : []),
    {
      type: "subscription",
      date: new Date().toISOString(),
      message: "Re-subscribed to Newsletter",
    },
  ];
  const category =
    existing.category === "Lead"
      ? "Lead + Subscriber"
      : existing.category || "Subscriber";

  await prisma.registration.update({
    where: { id: existing.id },
    data: { category, history: newHistory },
  });

  return {
    automationPayload: {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      source: existing.source,
      category,
      date: existing.date.toISOString(),
      language: existing.language,
      status: existing.status,
      history: newHistory,
    } satisfies RegistrationAutomationPayload,
  };
}

export function logContactSubmission(input: {
  name?: string;
  email: string;
  message: string;
  type?: string | null;
}) {
  console.log("[Contact]", {
    name: input.name || "",
    email: input.email.trim(),
    message: input.message.slice(0, 200),
    type: input.type ?? null,
  });
}

export async function listRegistrations() {
  const rows = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map(serializeRegistration);
}

export async function deleteRegistrationById(id: number) {
  await prisma.registration.delete({ where: { id } });
}

export async function deleteRegistrationsByEmail(email: string) {
  return prisma.registration.deleteMany({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function getRegistrationStats() {
  const all = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();
  const todayStr = now.toDateString();
  const thisMonth = now.getMonth();

  return {
    total: all.length,
    today: all.filter((row) => row.createdAt.toDateString() === todayStr).length,
    thisMonth: all.filter((row) => row.createdAt.getMonth() === thisMonth).length,
    all: all.map(serializeRegistration),
  };
}
