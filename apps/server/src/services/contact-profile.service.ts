import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type JsonArray = string[];

type ContactSyncPayload = {
  email: string;
  name: string;
  phone: string;
  language: string;
  status: string;
  categories: string[];
  sourceChannels: string[];
  acquisitionSources: string[];
  registrationSources: string[];
  eventIds: string[];
  eventNames: string[];
  registrationCount: number;
  contactSubmissionCount: number;
  lastRegisteredAt: string | null;
  lastContactSubmissionAt: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastAcquisitionSource: string;
  lastRegistrationSource: string;
  lastSource: string;
};

type ContactSubmissionInput = {
  name?: string;
  email: string;
  message: string;
  type?: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeText(value))
        .filter(Boolean),
    ),
  );
}

function asJsonArray(values: JsonArray): Prisma.InputJsonValue {
  return values as Prisma.InputJsonValue;
}

function pickPrimaryValue(values: Array<string | null | undefined>, fallback = ""): string {
  return (
    values
      .map((value) => normalizeText(value))
      .find(Boolean) || fallback
  );
}

function maxDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter((value): value is Date => value instanceof Date);
  if (filtered.length === 0) return null;
  return filtered.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

function minDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter((value): value is Date => value instanceof Date);
  if (filtered.length === 0) return null;
  return filtered.reduce((earliest, current) =>
    current.getTime() < earliest.getTime() ? current : earliest,
  );
}

export function normalizeRegistrationEmail(email: string): string {
  return normalizeEmail(email);
}

export async function rebuildContactProfileByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const [registrations, submissions, existing] = await Promise.all([
    prisma.registration.findMany({
      where: { email: normalizedEmail },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.contactSubmission.findMany({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactProfile.findUnique({
      where: { email: normalizedEmail },
    }),
  ]);

  if (registrations.length === 0 && submissions.length === 0) {
    if (existing) {
      await prisma.contactProfile.delete({ where: { email: normalizedEmail } });
    }
    return null;
  }

  const categories = uniqueStrings(registrations.map((row) => row.category));
  const sourceChannels = uniqueStrings(registrations.map((row) => row.source));
  const acquisitionSources = uniqueStrings(
    registrations.map((row) => row.acquisitionSource),
  );
  const registrationSources = uniqueStrings(
    registrations.map((row) => row.registrationSource),
  );
  const eventIds = uniqueStrings(registrations.map((row) => row.eventId));
  const eventNames = uniqueStrings(registrations.map((row) => row.eventName));
  const registrationDates = registrations.map((row) => row.date);
  const submissionDates = submissions.map((row) => row.createdAt);
  const firstSeenAt = minDate([
    ...registrationDates,
    ...submissions.map((row) => row.createdAt),
  ]);
  const lastRegistrationAt = maxDate(registrationDates);
  const lastContactSubmissionAt = maxDate(submissionDates);
  const lastSeenAt = maxDate([
    ...registrationDates,
    ...submissions.map((row) => row.createdAt),
  ]);
  const name =
    pickPrimaryValue(
      registrations.map((row) => row.name).concat(submissions.map((row) => row.name)),
    ) || "Unknown Contact";
  const phone = pickPrimaryValue(registrations.map((row) => row.phone));
  const language = pickPrimaryValue(registrations.map((row) => row.language), "en");
  const status = pickPrimaryValue(registrations.map((row) => row.status), "active");
  const lastAcquisitionSource = pickPrimaryValue(
    registrations.map((row) => row.acquisitionSource),
  );
  const lastRegistrationSource = pickPrimaryValue(
    registrations.map((row) => row.registrationSource),
  );
  const lastSource = pickPrimaryValue(registrations.map((row) => row.source));

  return prisma.contactProfile.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      phone: phone || null,
      language: language || null,
      status: status || null,
      categories: asJsonArray(categories),
      sourceChannels: asJsonArray(sourceChannels),
      acquisitionSources: asJsonArray(acquisitionSources),
      registrationSources: asJsonArray(registrationSources),
      eventIds: asJsonArray(eventIds),
      eventNames: asJsonArray(eventNames),
      registrationCount: registrations.length,
      contactSubmissionCount: submissions.length,
      firstSeenAt,
      lastSeenAt,
      lastRegistrationAt,
      lastContactSubmissionAt,
      lastAcquisitionSource: lastAcquisitionSource || null,
      lastRegistrationSource: lastRegistrationSource || null,
      lastSource: lastSource || null,
    },
    create: {
      email: normalizedEmail,
      name,
      phone: phone || null,
      language: language || null,
      status: status || null,
      categories: asJsonArray(categories),
      sourceChannels: asJsonArray(sourceChannels),
      acquisitionSources: asJsonArray(acquisitionSources),
      registrationSources: asJsonArray(registrationSources),
      eventIds: asJsonArray(eventIds),
      eventNames: asJsonArray(eventNames),
      registrationCount: registrations.length,
      contactSubmissionCount: submissions.length,
      firstSeenAt,
      lastSeenAt,
      lastRegistrationAt,
      lastContactSubmissionAt,
      lastAcquisitionSource: lastAcquisitionSource || null,
      lastRegistrationSource: lastRegistrationSource || null,
      lastSource: lastSource || null,
    },
  });
}

export async function recordContactSubmission(input: ContactSubmissionInput) {
  const normalizedEmail = normalizeEmail(input.email);
  if (!normalizedEmail) {
    throw new Error("Email missing");
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: normalizeText(input.name) || null,
      email: normalizedEmail,
      type: normalizeText(input.type) || null,
      message: normalizeText(input.message),
      status: "new",
    },
  });

  await rebuildContactProfileByEmail(normalizedEmail);
  return submission;
}

export async function getContactSyncPayloadByEmail(
  email: string,
): Promise<ContactSyncPayload | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const profile = await prisma.contactProfile.findUnique({
    where: { email: normalizedEmail },
  });

  if (!profile) return null;

  const asStringArray = (value: Prisma.JsonValue | null): string[] =>
    Array.isArray(value)
      ? value.map((entry) => normalizeText(entry)).filter(Boolean)
      : [];

  return {
    email: profile.email,
    name: profile.name,
    phone: normalizeText(profile.phone),
    language: normalizeText(profile.language) || "en",
    status: normalizeText(profile.status) || "active",
    categories: asStringArray(profile.categories),
    sourceChannels: asStringArray(profile.sourceChannels),
    acquisitionSources: asStringArray(profile.acquisitionSources),
    registrationSources: asStringArray(profile.registrationSources),
    eventIds: asStringArray(profile.eventIds),
    eventNames: asStringArray(profile.eventNames),
    registrationCount: profile.registrationCount,
    contactSubmissionCount: profile.contactSubmissionCount,
    lastRegisteredAt: profile.lastRegistrationAt?.toISOString() || null,
    lastContactSubmissionAt: profile.lastContactSubmissionAt?.toISOString() || null,
    firstSeenAt: profile.firstSeenAt?.toISOString() || null,
    lastSeenAt: profile.lastSeenAt?.toISOString() || null,
    lastAcquisitionSource: normalizeText(profile.lastAcquisitionSource),
    lastRegistrationSource: normalizeText(profile.lastRegistrationSource),
    lastSource: normalizeText(profile.lastSource),
  };
}
