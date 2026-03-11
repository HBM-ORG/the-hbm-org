import { Prisma, PrismaClient } from "@prisma/client";
import fs from "fs";
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

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function listCampaigns(campaignsFilePath: string): CampaignDefinition[] {
  return readJsonFile<CampaignDefinition[]>(campaignsFilePath, []);
}

export function createCampaign(
  campaignsFilePath: string,
  body: Record<string, unknown>,
): CampaignDefinition {
  const campaigns = readJsonFile<CampaignDefinition[]>(campaignsFilePath, []);
  const newCampaign: CampaignDefinition = {
    ...body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  campaigns.push(newCampaign);
  fs.writeFileSync(campaignsFilePath, JSON.stringify(campaigns, null, 2));
  return newCampaign;
}

export function saveAllCampaigns(
  campaignsFilePath: string,
  campaigns: CampaignDefinition[],
): void {
  fs.writeFileSync(campaignsFilePath, JSON.stringify(campaigns, null, 2));
}

export async function queueCampaignSend(
  campaignsFilePath: string,
  input: { campaignId: string; segment: string },
): Promise<{ count: number }> {
  if (!fs.existsSync(campaignsFilePath)) {
    throw new Error("No campaigns file");
  }

  const campaigns = readJsonFile<CampaignDefinition[]>(campaignsFilePath, []);
  const campaign = campaigns.find((entry) => entry.id === input.campaignId);
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

  return { count: toCreate.length };
}
