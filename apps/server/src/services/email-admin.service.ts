import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { normalizeSmtpConfig } from "./email-support.service.js";

const prisma = new PrismaClient();

export async function listEmailQueueItems() {
  return prisma.emailQueue.findMany({
    orderBy: { scheduledFor: "asc" },
  });
}

export async function verifySmtpConnection(input: {
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
  secure?: boolean;
}): Promise<{ success: boolean; configured: boolean; connected: boolean; message: string }> {
  let { host, port, user, pass, secure } = input;

  if (!host || !user || !pass) {
    return {
      success: false,
      configured: false,
      connected: false,
      message: !host || !user ? "SMTP not configured" : "SMTP password/app key is missing",
    };
  }

  const normalized = normalizeSmtpConfig({ host, port, secure });
  host = normalized?.host || host;
  port = normalized?.port || port;

  const portNum = parseInt(String(port), 10) || 587;
  const useSecure = typeof secure === "boolean" ? secure : portNum === 465;
  const isOffice365 =
    String(host || "")
      .toLowerCase()
      .includes("office365") ||
    String(host || "")
      .toLowerCase()
      .includes("outlook");

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure: useSecure,
      requireTLS: portNum === 587 && !useSecure,
      auth: { user, pass: pass || "" },
      connectionTimeout: 10000,
    });
    await transporter.verify();
    return {
      success: true,
      configured: true,
      connected: true,
      message: "SMTP connection verified",
    };
  } catch (error) {
    console.error("SMTP Check Error:", error);
    let message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "Connection failed";

    if (
      /535|auth|login|invalid credentials/i.test(String(message)) &&
      isOffice365
    ) {
      message =
        "Auth failed. For Office 365 use an App Password (not your account password). Account -> Security -> App passwords.";
    }

    return {
      success: false,
      configured: true,
      connected: false,
      message,
    };
  }
}

export async function queueTestFlow(input: {
  email: string;
  flowId?: string;
  language?: string;
}) {
  const testUser = {
    name: "Test User",
    email: input.email,
    eventName: "HBM Live Demo",
    date: new Date().toISOString(),
    location: "Tel Aviv Hub",
    id: "TEST-" + Math.floor(Math.random() * 1000),
    language: input.language || "en",
  };

  const itemId = uuidv4();
  await prisma.emailQueue.create({
    data: {
      id: itemId,
      status: "pending",
      scheduledFor: new Date(),
      data: testUser,
      stepType: "email",
      flowId: input.flowId || null,
      attempts: 0,
    },
  });

  return { itemId };
}

export async function getEmailQueueItemError(id: string): Promise<string | null> {
  const item = await prisma.emailQueue.findUnique({
    where: { id },
  });

  return item?.error || null;
}
