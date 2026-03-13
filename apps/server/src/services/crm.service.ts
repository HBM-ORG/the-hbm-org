import { PrismaClient } from "@prisma/client";

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
  const registrations = await prisma.registration.findMany({
    where: { email: normalizedEmail },
    orderBy: { date: "desc" },
  });

  const regList = registrations.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    eventId: row.eventId,
    eventName: row.eventName,
    date: row.date ? new Date(row.date).toISOString() : null,
    language: row.language,
    status: row.status,
    history: row.history,
  }));

  const allQueue = await prisma.emailQueue.findMany({
    orderBy: { scheduledFor: "desc" },
  });

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
    }));

  const engagementRows = await prisma.emailEngagement.findMany({
    where: { email: normalizedEmail },
    orderBy: { timestamp: "desc" },
  });

  const engagement = engagementRows.map((entry) => ({
    type: entry.eventType,
    timestamp: entry.timestamp.toISOString(),
    id: entry.trackingId || entry.id,
  }));

  const name = regList.length > 0 ? regList[0].name : "";
  const phone = regList.length > 0 ? regList[0].phone : "";

  return {
    contact: {
      email: normalizedEmail,
      name,
      phone,
      registrations: regList,
      emailActivity,
      engagement,
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
