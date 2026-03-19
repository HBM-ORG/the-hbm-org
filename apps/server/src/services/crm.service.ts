import { PrismaClient } from "@prisma/client";
import { getProviderStatusSummary } from "./provider-sync.service.js";

const prisma = new PrismaClient();

type EmailQueuePayload = {
  email?: string;
  [key: string]: unknown;
};

function asEmailQueuePayload(value: unknown): EmailQueuePayload {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as EmailQueuePayload)
    : {};
}

function getEmailFromPayload(value: unknown): string {
  const email = asEmailQueuePayload(value).email;
  return typeof email === "string" ? email : "";
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

export async function getCrmContactByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [registrations, allQueue, engagementRows, profile, submissions, providerSyncs, providerEvents] =
    await Promise.all([
      prisma.registration.findMany({
        where: { email: normalizedEmail },
        orderBy: { date: "desc" },
      }),
      prisma.emailQueue.findMany({
        orderBy: { scheduledFor: "desc" },
      }),
      prisma.emailEngagement.findMany({
        where: { email: normalizedEmail },
        orderBy: { timestamp: "desc" },
      }),
      prisma.contactProfile.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.contactSubmission.findMany({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactProviderSync.findMany({
        where: { email: normalizedEmail },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.providerWebhookEvent.findMany({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

  const regList = registrations.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    acquisitionSource: row.acquisitionSource,
    registrationSource: row.registrationSource,
    category: row.category,
    eventId: row.eventId,
    eventName: row.eventName,
    date: row.date ? new Date(row.date).toISOString() : null,
    language: row.language,
    status: row.status,
    history: row.history,
  }));

  const emailActivity = allQueue
    .filter(
      (item) =>
        getEmailFromPayload(item.data).toLowerCase().trim() === normalizedEmail,
    )
    .map((item) => ({
      id: item.id,
      status: item.status,
      sentAt: item.sentAt ? item.sentAt.toISOString() : null,
      stepType: item.stepType,
      flowId: item.flowId,
      attempts: item.attempts,
      error: item.error,
      provider: item.provider,
      providerStatus: item.providerStatus,
      providerMessageId: item.providerMessageId,
      providerData:
        item.providerData && typeof item.providerData === "object"
          ? item.providerData
          : null,
    }));

  const engagement = engagementRows.map((entry) => ({
    type: entry.eventType,
    timestamp: entry.timestamp.toISOString(),
    id: entry.trackingId || entry.id,
    metadata:
      entry.metadata && typeof entry.metadata === "object" && !Array.isArray(entry.metadata)
        ? entry.metadata
        : null,
  }));

  const contactSubmissions = submissions.map((entry) => ({
    id: entry.id,
    type: entry.type,
    message: entry.message,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
  }));

  const providerSyncEntries = providerSyncs.map((entry) => ({
    provider: entry.provider,
    externalId: entry.externalId,
    syncStatus: entry.syncStatus,
    lastSyncedAt: entry.lastSyncedAt?.toISOString() || null,
    lastError: entry.lastError,
    isUnsubscribed: entry.isUnsubscribed,
    isBlocklisted: entry.isBlocklisted,
    lastEventType: entry.lastEventType,
    lastEventAt: entry.lastEventAt?.toISOString() || null,
    details:
      entry.details && typeof entry.details === "object" && !Array.isArray(entry.details)
        ? entry.details
        : null,
  }));

  const providerTimeline = providerEvents.map((entry) => ({
    id: entry.id,
    provider: entry.provider,
    eventType: entry.eventType,
    externalId: entry.externalId,
    createdAt: entry.createdAt.toISOString(),
    processedAt: entry.processedAt?.toISOString() || null,
    payload:
      entry.payload && typeof entry.payload === "object" && !Array.isArray(entry.payload)
        ? entry.payload
        : null,
  }));

  const name = profile?.name || (regList.length > 0 ? regList[0].name : "");
  const phone = profile?.phone || (regList.length > 0 ? regList[0].phone : "");
  const providerStatus = getProviderStatusSummary();

  return {
    contact: {
      email: normalizedEmail,
      name,
      phone,
      language: profile?.language || regList[0]?.language || "",
      status: profile?.status || regList[0]?.status || "",
      registrationCount: profile?.registrationCount || regList.length,
      contactSubmissionCount:
        profile?.contactSubmissionCount || contactSubmissions.length,
      categories: Array.isArray(profile?.categories) ? profile.categories : [],
      sourceChannels: Array.isArray(profile?.sourceChannels)
        ? profile.sourceChannels
        : [],
      eventNames: Array.isArray(profile?.eventNames) ? profile.eventNames : [],
      firstSeenAt: profile?.firstSeenAt?.toISOString() || null,
      lastSeenAt: profile?.lastSeenAt?.toISOString() || null,
      lastRegistrationAt: profile?.lastRegistrationAt?.toISOString() || null,
      lastContactSubmissionAt:
        profile?.lastContactSubmissionAt?.toISOString() || null,
      registrations: regList,
      contactSubmissions,
      emailActivity,
      engagement,
      providerStatus,
      providerSyncs: providerSyncEntries,
      providerTimeline,
    },
  };
}

export async function exportCrmContactCsv(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const registrations = await prisma.registration.findMany({
    where: { email: normalizedEmail },
    orderBy: { date: "desc" },
  });

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Source",
    "Event",
    "EventId",
    "Date",
    "Status",
    "Language",
  ];

  const rows = registrations.map((row) => [
    `"${(row.name || "").replace(/"/g, '""')}"`,
    `"${(row.email || "").replace(/"/g, '""')}"`,
    `"${(row.phone || "").replace(/"/g, '""')}"`,
    `"${(row.source || "").replace(/"/g, '""')}"`,
    `"${(row.eventName || "").replace(/"/g, '""')}"`,
    `"${String(row.eventId || "").replace(/"/g, '""')}"`,
    `"${row.date ? new Date(row.date).toLocaleString() : ""}"`,
    `"${(row.status || "confirmed").replace(/"/g, '""')}"`,
    `"${(row.language || "").replace(/"/g, '""')}"`,
  ]);

  return {
    filename: `HBM_Contact_${normalizedEmail.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    csvContent:
      "\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((entry) => entry.join(",")).join("\n"),
  };
}

export async function listCrmLeads() {
  const rows = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map(serializeRegistration);
}

export async function updateCrmLeadStatus(id: number, status: string) {
  const lead = await prisma.registration.findUnique({ where: { id } });
  if (!lead) return null;

  const newHistory = [
    ...(Array.isArray(lead.history) ? lead.history : []),
    {
      type: "status_change",
      date: new Date().toISOString(),
      message: `Status changed to ${status}`,
    },
  ];

  const updated = await prisma.registration.update({
    where: { id },
    data: { status, history: newHistory },
  });

  return {
    ...updated,
    date: updated.date.toISOString(),
  };
}

export async function addCrmLeadNote(id: number, note: string) {
  const lead = await prisma.registration.findUnique({ where: { id } });
  if (!lead) return null;

  const newHistory = [
    ...(Array.isArray(lead.history) ? lead.history : []),
    { type: "note", date: new Date().toISOString(), message: note },
  ];

  const updated = await prisma.registration.update({
    where: { id },
    data: { history: newHistory },
  });

  return {
    ...updated,
    date: updated.date.toISOString(),
  };
}
