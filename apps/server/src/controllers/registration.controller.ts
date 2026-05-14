import type { Request, Response } from "express";
import {
  createOrUpdateNewsletterRegistration,
  createRegistration,
  deleteRegistrationById,
  deleteRegistrationsByEmail,
  getRegistrationStats,
  isValidEmail,
  listRegistrations,
  logContactSubmission,
  type TriggerAutomationByEvent,
} from "../services/registration.service.js";
import { syncContactToProviders } from "../services/provider-sync.service.js";
import { getSiteSettingsConfig, getVideoEventConfig } from "../services/content.service.js";
import {
  resolveBrevoListsForNewsletter,
  resolveBrevoListsForRegister,
} from "../services/cta-brevo-lists.service.js";
import {
  getCtaFormConfigForRegister,
  validateRegisterBodyAgainstRules,
  type RegisterValidationIssue,
} from "../services/register-cta-form.service.js";

type RegistrationControllerDeps = {
  triggerAutomationByEvent: TriggerAutomationByEvent;
};

function logRegistrationError(context: string, error: unknown): void {
  console.error(`[registration.controller:${context}]`, error);
}

function inferFieldFromProviderMessage(message: string | undefined): string | undefined {
  const m = (message || "").toLowerCase();
  if (m.includes("phone") || m.includes("sms")) return "phone";
  if (m.includes("email")) return "email";
  return undefined;
}

function validationJsonBody(issue: RegisterValidationIssue): Record<string, unknown> {
  const body: Record<string, unknown> = {
    error: issue.message,
    field: issue.field,
    code: issue.code,
  };
  if (issue.hint) body.hint = issue.hint;
  if (issue.hintHe) body.hintHe = issue.hintHe;
  return body;
}

function getQueryString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getRouteParam(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function createRegistrationController({
  triggerAutomationByEvent,
}: RegistrationControllerDeps) {
  return {
    /**
     * @openapi
     * /api/register:
     *   post:
     *     summary: Create event registration
     *     tags: [Registration]
     */
    async register(req: Request, res: Response): Promise<void> {
      try {
        const {
          name,
          email,
          phone,
          source,
          regSource,
          eventId,
          eventName,
          language,
          termsAccepted,
        } = req.body || {};

        const effectiveEventId =
          typeof eventId === "string" && eventId.trim() ? eventId.trim() : "general";

        if (effectiveEventId === "video-event") {
          const videoCfg = await getVideoEventConfig();
          if (!videoCfg.published) {
            res.status(403).json({
              error: "Video event registration is not available.",
              code: "video_event_unpublished",
            });
            return;
          }
        }

        const termsBool = termsAccepted === true;
        console.log(
          "[CRM] Register attempt",
          JSON.stringify({
            eventId: effectiveEventId,
            eventName:
              typeof eventName === "string" ? eventName.trim().slice(0, 200) : null,
            name: typeof name === "string" ? name.trim() : "",
            email: typeof email === "string" ? email.trim().toLowerCase() : "",
            phone: typeof phone === "string" ? phone.trim() : "",
            source: typeof source === "string" ? source.trim() : "",
            regSource:
              typeof regSource === "string" ? regSource.trim() : null,
            language: typeof language === "string" ? language.trim() : null,
            termsAccepted: termsBool,
          }),
        );

        const rules = await getCtaFormConfigForRegister(effectiveEventId);
        const validationIssue = validateRegisterBodyAgainstRules(
          { name, email, phone, source, termsAccepted: termsBool },
          rules,
        );
        if (validationIssue) {
          res.status(400).json(validationJsonBody(validationIssue));
          return;
        }

        const emailStr = typeof email === "string" ? email.trim() : "";
        if (emailStr && !isValidEmail(emailStr)) {
          res.status(400).json({
            error: "Invalid email format",
            field: "email",
            code: "invalid_email",
          });
          return;
        }

        const { row, automationPayload } = await createRegistration({
          name: typeof name === "string" ? name : "",
          email: typeof email === "string" ? email : "",
          phone: typeof phone === "string" ? phone : "",
          source,
          regSource,
          eventId: effectiveEventId,
          eventName,
          language,
        });

        console.log(
          `[CRM] New registration: ${name} (${email}) | Event: ${eventName} | Source: ${source}`,
        );

        const site = await getSiteSettingsConfig();
        const brevoLists = await resolveBrevoListsForRegister(
          effectiveEventId,
          site,
        );
        const syncResults = await syncContactToProviders(
          automationPayload.email,
          brevoLists,
        );

        for (const r of syncResults) {
          if (r.provider !== "brevo") continue;
          const extra = r.message ? ` — ${r.message}` : "";
          if (r.status === "failed") {
            console.error(`[CRM] Brevo sync failed for ${automationPayload.email}${extra}`);
          } else {
            console.log(`[CRM] Brevo sync ${r.status}${extra}`);
          }
        }

        const brevoResult = syncResults.find((r) => r.provider === "brevo");
        if (brevoResult?.status === "failed") {
          const field = inferFieldFromProviderMessage(brevoResult.message);
          res.status(502).json({
            error:
              brevoResult.message
              || "Registration saved but email service could not be updated. Please try again or contact us.",
            field,
            code: "crm_sync_failed",
            leadId: row.id,
          });
          return;
        }

        res.json({
          success: true,
          message: "Registration successful",
          leadId: row.id,
        });

        setImmediate(async () => {
          try {
            const bypass = site.brevo.ctaBypassEmailArchitect;
            if (!bypass) {
              if (effectiveEventId === "video-event") {
                await triggerAutomationByEvent(
                  "onVideoRegistration",
                  automationPayload,
                );
              } else {
                await triggerAutomationByEvent(
                  "onPhysicalRegistration",
                  automationPayload,
                );
              }

              if (source === "8min_journey") {
                await triggerAutomationByEvent("on8MinJourney", automationPayload);
              }

              await triggerAutomationByEvent("registration", automationPayload);
              await triggerAutomationByEvent("site_signup", automationPayload);
            }
          } catch (error) {
            console.error("[Email] Registration automation trigger error:", error);
          }
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Failed to save registration" });
      }
    },

    /**
     * @openapi
     * /api/newsletter:
     *   post:
     *     summary: Subscribe to newsletter
     *     tags: [Registration]
     */
    async newsletter(req: Request, res: Response): Promise<void> {
      try {
        const { email, name, language, source } = req.body || {};
        if (!email) {
          res.status(400).json({ error: "Missing email" });
          return;
        }

        if (!isValidEmail(email)) {
          res.status(400).json({ error: "Invalid email format" });
          return;
        }

        const { automationPayload } = await createOrUpdateNewsletterRegistration({
          email,
          name,
          language,
          source,
        });

        const site = await getSiteSettingsConfig();
        const brevoLists = await resolveBrevoListsForNewsletter(site);

        const runNewsletterArchitect =
          !site.brevo.ctaBypassEmailArchitect
          || Boolean(site.brevo.bePartUsesEmailArchitect);
        if (runNewsletterArchitect) {
          await triggerAutomationByEvent("onNewsletterSignup", automationPayload);
        }

        res.json({ success: true, message: "Newsletter signup successful" });

        setImmediate(async () => {
          try {
            await syncContactToProviders(automationPayload.email, brevoLists);
          } catch (error) {
            console.error("[CRM] Newsletter provider sync error:", error);
          }
        });
      } catch (error) {
        console.error("Newsletter error:", error);
        res.status(500).json({ error: "Failed" });
      }
    },

    /**
     * @openapi
     * /api/contact:
     *   post:
     *     summary: Submit contact form
     *     tags: [Registration]
     */
    async contact(req: Request, res: Response): Promise<void> {
      try {
        const { name, email, message, type } = req.body || {};
        if (!email || !message) {
          res.status(400).json({ error: "Missing email or message" });
          return;
        }

        if (!isValidEmail(email)) {
          res.status(400).json({ error: "Invalid email format" });
          return;
        }

        await logContactSubmission({
          name: typeof name === "string" ? name : "",
          email,
          message: typeof message === "string" ? message : "",
          type: typeof type === "string" ? type : null,
        });

        res.json({ success: true, message: "Message received" });

        setImmediate(async () => {
          try {
            await syncContactToProviders(email);
          } catch (error) {
            console.error("[CRM] Contact submission provider sync error:", error);
          }
        });
      } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ error: "Failed to submit" });
      }
    },

    /**
     * @openapi
     * /api/registrations:
     *   get:
     *     summary: List registrations
     *     tags: [Registration]
     */
    async list(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await listRegistrations());
      } catch (error) {
        logRegistrationError("list", error);
        res.status(200).json([]);
      }
    },

    /**
     * @openapi
     * /api/registrations/{id}:
     *   delete:
     *     summary: Delete registration by id
     *     tags: [Registration]
     */
    async remove(req: Request, res: Response): Promise<void> {
      try {
        const id = parseInt(getRouteParam(req.params.id), 10);
        if (Number.isNaN(id)) {
          res.status(400).json({ error: "Invalid id" });
          return;
        }

        await deleteRegistrationById(id);
        res.json({ success: true });
      } catch (error) {
        const prismaCode =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
            ? error.code
            : "";

        if (prismaCode === "P2025") {
          res.status(404).json({ error: "Not found" });
          return;
        }

        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to delete",
        });
      }
    },

    /**
     * @openapi
     * /api/registrations/by-contact:
     *   delete:
     *     summary: Delete registrations by email
     *     tags: [Registration]
     */
    async removeByContact(req: Request, res: Response): Promise<void> {
      try {
        const email = getQueryString(req.query.email).toLowerCase();
        if (!email) {
          res.status(400).json({ error: "Missing email" });
          return;
        }

        const result = await deleteRegistrationsByEmail(email);
        res.json({ success: true, deleted: result.count });
      } catch (error) {
        console.error("Error deleting by contact:", error);
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to delete",
        });
      }
    },

    /**
     * @openapi
     * /api/registrations/stats:
     *   get:
     *     summary: Get registration stats
     *     tags: [Registration]
     */
    async stats(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await getRegistrationStats());
      } catch (error) {
        logRegistrationError("stats", error);
        res.status(200).json({
          total: 0,
          today: 0,
          thisMonth: 0,
          all: [],
        });
      }
    },
  };
}
