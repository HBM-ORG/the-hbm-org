import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export type CampaignDefinition = {
  id?: string;
  subject_he?: string;
  subject_en?: string;
  subject?: string;
  body_he?: string;
  body_en?: string;
  body?: string;
  includeCalendar?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCampaign(input: Record<string, unknown>): CampaignDefinition {
  const id = typeof input.id === "string" && input.id.trim() ? input.id.trim() : uuidv4();
  const createdAt =
    typeof input.createdAt === "string" && input.createdAt.trim()
      ? input.createdAt
      : new Date().toISOString();

  return {
    ...input,
    id,
    createdAt,
  };
}

function mapCampaignRecord(
  row: { legacyId: string | null; data: Prisma.JsonValue; createdAt: Date },
): CampaignDefinition {
  const payload = isRecord(row.data) ? row.data : {};
  return {
    ...payload,
    id:
      typeof payload.id === "string" && payload.id.trim()
        ? payload.id
        : row.legacyId || undefined,
    createdAt:
      typeof payload.createdAt === "string" && payload.createdAt.trim()
        ? payload.createdAt
        : row.createdAt.toISOString(),
  };
}

export async function listCampaigns(): Promise<CampaignDefinition[]> {
  const rows = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCampaignRecord);
}

export async function getCampaignById(
  campaignId: string,
): Promise<CampaignDefinition | null> {
  const row = await prisma.emailCampaign.findFirst({
    where: {
      OR: [{ legacyId: campaignId }, { id: campaignId }],
    },
  });
  return row ? mapCampaignRecord(row) : null;
}

export async function createCampaign(
  body: Record<string, unknown>,
): Promise<CampaignDefinition> {
  const campaign = normalizeCampaign(body);
  const stored = await prisma.emailCampaign.create({
    data: {
      legacyId: campaign.id,
      data: campaign as Prisma.InputJsonValue,
    },
  });
  return mapCampaignRecord(stored);
}

export async function saveAllCampaigns(
  campaigns: CampaignDefinition[],
): Promise<void> {
  const normalized = campaigns.map((campaign) =>
    normalizeCampaign(campaign as Record<string, unknown>),
  );

  await prisma.$transaction(async (tx) => {
    const ids = normalized.map((campaign) => campaign.id).filter(Boolean) as string[];
    await tx.emailCampaign.deleteMany({
      where: ids.length > 0 ? { legacyId: { notIn: ids } } : {},
    });

    for (const campaign of normalized) {
      await tx.emailCampaign.upsert({
        where: { legacyId: campaign.id },
        update: {
          data: campaign as Prisma.InputJsonValue,
        },
        create: {
          legacyId: campaign.id,
          data: campaign as Prisma.InputJsonValue,
        },
      });
    }
  });
}

export async function queueCampaignSend(
  input: { campaignId: string; segment: string },
): Promise<{ count: number }> {
  const campaign = await getCampaignById(input.campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  let regs = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (input.segment !== "all") {
    const seg = String(input.segment).toLowerCase();
    regs = regs.filter(
      (row) => (row.source || row.registrationSource || "").toLowerCase() === seg,
    );
  }

  const toCreate = regs.map((row) => ({
    id: uuidv4(),
    status: "pending",
    scheduledFor: new Date(),
    data: {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      source: row.source,
      registrationSource: row.registrationSource,
      category: row.category,
      eventId: row.eventId,
      eventName: row.eventName,
      date: row.date.toISOString(),
      language: row.language,
      status: row.status,
      history: row.history,
    } as Prisma.InputJsonValue,
    stepType: "email",
    flowId: input.campaignId,
    attempts: 0,
  }));

  if (toCreate.length > 0) {
    await prisma.emailQueue.createMany({ data: toCreate });
  }

  await prisma.emailCampaign.updateMany({
    where: { legacyId: campaign.id as string },
    data: {
      data: {
        ...(campaign as Record<string, unknown>),
        sentToCount: toCreate.length,
      } as Prisma.InputJsonValue,
    },
  });

  return { count: toCreate.length };
}
