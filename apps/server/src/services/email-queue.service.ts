import { Prisma, PrismaClient } from "@prisma/client";
import * as ics from "ics";
import inlineCss from "inline-css";
import { Liquid } from "liquidjs";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { runtimeConfig } from "../config/runtime-config.js";
import {
  deliverEmail,
  getEmailTemplate,
  isValidEmail,
  normalizeSmtpConfig,
  type SmtpConfigShape,
} from "./email-support.service.js";
import { loadAutomationRuntimeConfig } from "./automation-runtime.service.js";
import { sendBrevoTransactionalEmail } from "./brevo.service.js";
import { getCampaignById } from "./campaign.service.js";
import { logEngagement } from "./email-tracking.service.js";
import { listSuppression } from "./suppression.service.js";

const prisma = new PrismaClient();
const liquidEngine = new Liquid();

type JsonRecord = Record<string, unknown>;

type EmailQueuePayload = {
  email?: string;
  language?: string;
  date?: string;
  eventName?: string;
  location?: string;
  [key: string]: unknown;
};

type AutomationFlow = {
  id?: string;
  active?: boolean;
  trigger?: string;
  delayValue?: string | number;
  delayUnit?: string;
  subject_he?: string;
  subject_en?: string;
  subject?: string;
  body_he?: string;
  body_en?: string;
  body?: string;
  includeCalendar?: boolean;
  [key: string]: unknown;
};

type AutomationSequenceStep = {
  type?: string;
  duration?: string;
  flowId?: string;
  [key: string]: unknown;
};

type AutomationSequence = {
  id?: string;
  active?: boolean;
  trigger?: string;
  steps?: AutomationSequenceStep[];
  [key: string]: unknown;
};

type AutomationConfig = {
  flows?: AutomationFlow[];
  sequences?: AutomationSequence[];
  smtp?: SmtpConfigShape;
  globalStyling?: JsonRecord;
  [key: string]: unknown;
};

type CampaignDefinition = {
  id?: string;
  subject_he?: string;
  subject_en?: string;
  subject?: string;
  body_he?: string;
  body_en?: string;
  body?: string;
  includeCalendar?: boolean;
  [key: string]: unknown;
};

type EmailQueueEngineDeps = {
  baseUrl: string;
  logError: (context: string, err: unknown) => void;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asEmailQueuePayload(value: unknown): EmailQueuePayload {
  return isRecord(value) ? (value as EmailQueuePayload) : {};
}

function parseDelay(str: string | number): number {
  const raw = String(str);
  const value = parseInt(raw, 10);
  if (raw.includes("h")) return value * 60 * 60 * 1000;
  if (raw.includes("m")) return value * 60 * 1000;
  if (raw.includes("d")) return value * 24 * 60 * 60 * 1000;
  return 0;
}

export function createEmailQueueEngine({
  baseUrl,
  logError,
}: EmailQueueEngineDeps) {
  let processQueueRunning = false;
  let workerStarted = false;

  async function processQueue(specificItemId: string | null = null): Promise<boolean> {
    if (processQueueRunning) return false;
    processQueueRunning = true;

    try {
      console.log(
        `[Email] processQueue start (specificItemId=${specificItemId || "all"})`,
      );
      const now = new Date();
      const config = await loadAutomationRuntimeConfig();

      if (!config.smtp?.host && process.env.SMTP_HOST) {
        config.smtp = {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || "",
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          secure:
            process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1",
        };
      }

      config.smtp = normalizeSmtpConfig(config.smtp);
      const suppressionList = (await listSuppression()).map((email) =>
        email.toLowerCase(),
      );
      const emailProvider = runtimeConfig.emailProvider;

      if (emailProvider !== "brevo" && !config?.smtp?.host) {
        console.log("[Email] processQueue skipped: SMTP host is not configured");
        return false;
      }

      const port = parseInt(String(config.smtp.port), 10) || 587;
      const secure =
        typeof config.smtp.secure === "boolean" ? config.smtp.secure : port === 465;

      let transporter = null;
      if (emailProvider !== "brevo") {
        try {
          transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port,
            secure,
            requireTLS: port === 587 && !secure,
            auth: { user: config.smtp.user, pass: config.smtp.pass || "" },
          });
        } catch (error) {
          console.error("[Email] processQueue: createTransport failed", error);
          return false;
        }
      }

      const baseWhere = {
        status: "pending",
        stepType: "email",
        scheduledFor: { lte: now },
      };

      const items = await prisma.emailQueue.findMany({
        where: specificItemId ? { ...baseWhere, id: specificItemId } : baseWhere,
      });

      console.log(`[Email] processQueue found ${items.length} pending item(s)`);

      let success = true;

      for (const item of items) {
        const data = asEmailQueuePayload(item.data);

        if (typeof data.email === "string" && suppressionList.includes(data.email)) {
          await prisma.emailQueue.update({
            where: { id: item.id },
            data: { status: "suppressed" },
          });
          continue;
        }

        if (!isValidEmail(data.email)) {
          await prisma.emailQueue.update({
            where: { id: item.id },
            data: { status: "failed", error: "Invalid email format" },
          });
          console.log("[Email] Skipped (invalid email):", data.email);
          success = false;
          continue;
        }

        try {
          const flow = (config.flows || []).find((entry) => entry.id === item.flowId);
          const campaign = !flow && item.flowId ? await getCampaignById(item.flowId) : null;

          if (!flow && !campaign) {
            await prisma.emailQueue.update({
              where: { id: item.id },
              data: { status: "failed", error: "Source flow/campaign not found" },
            });
            success = false;
            continue;
          }

          const source: CampaignDefinition | AutomationFlow = flow || campaign!;
          const trackingId = item.id;
          const lang = typeof data.language === "string" ? data.language : "en";
          const renderData = {
            ...data,
            eventDate:
              typeof data.date === "string"
                ? new Date(data.date).toLocaleDateString()
                : "",
            year: new Date().getFullYear(),
          };

          const rawSubject =
            lang === "he" && source.subject_he
              ? source.subject_he
              : source.subject_en || source.subject;
          const rawBody =
            lang === "he" && source.body_he
              ? source.body_he
              : source.body_en || source.body;

          let subject = await liquidEngine.parseAndRender(rawSubject || "", renderData);
          let body = await liquidEngine.parseAndRender(
            String(rawBody || "").replace(/\n/g, "<br>"),
            renderData,
          );
          body = body.replace(/\s(src|href)="\/(?!\/)/g, ` $1="${baseUrl}/`);

          const html = await inlineCss(
            getEmailTemplate({
              body,
              config,
              trackingId,
              email: data.email,
              language: lang,
              baseUrl,
            }),
            { url: baseUrl },
          );

          const mailOptions: {
            from?: string;
            to: string;
            subject: string;
            html: string;
            attachments?: Array<{ filename: string; content: string }>;
          } = {
            from: config.smtp.from,
            to: data.email,
            subject,
            html,
          };

          if (source.includeCalendar && typeof data.date === "string") {
            const eventDate = new Date(data.date);
            const { value } = ics.createEvent({
              start: [
                eventDate.getFullYear(),
                eventDate.getMonth() + 1,
                eventDate.getDate(),
                19,
                0,
              ],
              duration: { hours: 3 },
              title:
                typeof data.eventName === "string" ? data.eventName : "HBM Event",
              location:
                typeof data.location === "string" ? data.location : "Tel Aviv",
            });

            if (value) {
              mailOptions.attachments = [
                { filename: "hbm-invite.ics", content: value },
              ];
            }
          }

          if (emailProvider === "brevo") {
            const providerResult = await sendBrevoTransactionalEmail({
              from: mailOptions.from || runtimeConfig.defaultSmtpFrom,
              to: data.email,
              toName: typeof data.name === "string" ? data.name : data.email,
              subject,
              html,
              attachments: mailOptions.attachments,
            });

            await prisma.emailQueue.update({
              where: { id: item.id },
              data: {
                status: "sent",
                sentAt: new Date(),
                provider: providerResult.provider,
                providerMessageId: providerResult.messageId,
                providerStatus: providerResult.status,
                providerData: providerResult.raw as Prisma.InputJsonValue,
              },
            });
            await logEngagement(trackingId, "sent", data.email, {
              provider: providerResult.provider,
              providerMessageId: providerResult.messageId,
            });
          } else {
            await deliverEmail(transporter!, mailOptions);

            await prisma.emailQueue.update({
              where: { id: item.id },
              data: {
                status: "sent",
                sentAt: new Date(),
                provider: "smtp",
                providerStatus: "sent",
              },
            });
            await logEngagement(trackingId, "sent", data.email, {
              provider: "smtp",
            });
          }
          console.log("[Email] Sent successfully to", data.email);
        } catch (error) {
          logError("SMTP/Queue", error);
          let errMsg = error instanceof Error ? error.message : String(error);
          const host = String(config.smtp?.host || "").toLowerCase();
          const isAuthError = /535|auth|login|invalid credentials/i.test(errMsg);

          if (
            isAuthError &&
            (host.includes("office365") || host.includes("outlook"))
          ) {
            errMsg =
              "SMTP auth failed. For Office 365 use an App Password (Security -> App passwords), not your account password.";
            console.log("[Email] Failed (auth):", data.email, "-", errMsg);
          } else {
            console.log("[Email] Failed to send to", data.email, "-", errMsg);
          }

          const attempts = (item.attempts || 0) + 1;
          const maxAttempts = 3;
          const status = attempts >= maxAttempts ? "failed" : "pending";

          await prisma.emailQueue.update({
            where: { id: item.id },
            data: {
              status,
              error: errMsg,
              attempts,
              provider: emailProvider === "brevo" ? "brevo" : "smtp",
              providerStatus: status === "failed" ? "failed" : "retrying",
              ...(status === "pending"
                ? { scheduledFor: new Date(Date.now() + 60000) }
                : {}),
            },
          });
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error("[Email] processQueue error:", error);
      return false;
    } finally {
      processQueueRunning = false;
    }
  }

  async function triggerAutomationByEvent(
    triggerType: string,
    userData: EmailQueuePayload,
  ): Promise<void> {
    try {
      const config = await loadAutomationRuntimeConfig();

      const toCreate: Array<{
        id: string;
        status: string;
        scheduledFor: Date;
        data: Prisma.InputJsonValue;
        stepType: string;
        flowId?: string;
        attempts: number;
        sequenceId?: string;
        stepIndex?: number;
      }> = [];
      const now = Date.now();

      const activeFlows = (config.flows || []).filter(
        (flow) => flow.active && flow.trigger === triggerType,
      );

      for (const flow of activeFlows) {
        let scheduledFor = now;
        if (flow.delayValue && flow.delayUnit) {
          const multiplier =
            flow.delayUnit === "h"
              ? 3600000
              : flow.delayUnit === "d"
                ? 86400000
                : 60000;
          scheduledFor += parseInt(String(flow.delayValue), 10) * multiplier;
        }

        toCreate.push({
          id: uuidv4(),
          status: "pending",
          scheduledFor: new Date(scheduledFor),
          data: userData as Prisma.InputJsonValue,
          stepType: "email",
          flowId: flow.id,
          attempts: 0,
        });
      }

      const activeSequences = (config.sequences || []).filter(
        (sequence) => sequence.active && sequence.trigger === triggerType,
      );

      for (const sequence of activeSequences) {
        let cumulativeDelay = 0;
        const sequenceSteps = Array.isArray(sequence.steps) ? sequence.steps : [];

        for (let stepIndex = 0; stepIndex < sequenceSteps.length; stepIndex++) {
          const step = sequenceSteps[stepIndex];
          if (step.type === "wait") {
            cumulativeDelay += parseDelay(step.duration || "");
          } else if (step.type === "email") {
            const stepDelay = step.duration ? parseDelay(step.duration) : 0;
            toCreate.push({
              id: uuidv4(),
              status: "pending",
              scheduledFor: new Date(now + cumulativeDelay + stepDelay),
              data: userData as Prisma.InputJsonValue,
              stepType: "email",
              flowId: step.flowId,
              attempts: 0,
              sequenceId: sequence.id,
              stepIndex,
            });
          }
        }
      }

      if (toCreate.length > 0) {
        await prisma.emailQueue.createMany({ data: toCreate });
        console.log(
          `🚀 [Email] Queued ${toCreate.length} items for trigger [${triggerType}] -> ${userData.email}`,
        );
        processQueue().catch((error) =>
          console.error("[Email] Immediate process failed:", error),
        );
      } else {
        console.log(
          `[Email] No active flows or sequences found for trigger: ${triggerType}`,
        );
      }
    } catch (error) {
      console.error("[Email] triggerAutomationByEvent Error:", error);
    }
  }

  function startWorker(): void {
    if (workerStarted) return;
    workerStarted = true;
    console.log("[Email] Worker polling started (interval=60000ms)");

    setInterval(() => {
      if (!processQueueRunning) {
        console.log("[Email] Worker tick: processing pending queue items");
        processQueue().catch((error) =>
          console.error("[Email] Interval run failed:", error),
        );
      }
    }, 60000);
  }

  return {
    processQueue,
    triggerAutomationByEvent,
    startWorker,
  };
}
