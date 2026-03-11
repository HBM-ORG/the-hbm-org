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

type RegistrationControllerDeps = {
  triggerAutomationByEvent: TriggerAutomationByEvent;
};

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
        const { name, email, phone, source, regSource, eventId, eventName, language } =
          req.body || {};

        if (!name || !email || !phone) {
          res.status(400).json({ error: "Missing required fields" });
          return;
        }

        if (!isValidEmail(email)) {
          res.status(400).json({ error: "Invalid email format" });
          return;
        }

        const { row, automationPayload } = await createRegistration({
          name,
          email,
          phone,
          source,
          regSource,
          eventId,
          eventName,
          language,
        });

        console.log(
          `[CRM] New registration: ${name} (${email}) | Event: ${eventName} | Source: ${source}`,
        );

        res.json({
          success: true,
          message: "Registration successful",
          leadId: row.id,
        });

        setImmediate(async () => {
          try {
            if (eventId === "video-event") {
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

        await triggerAutomationByEvent("onNewsletterSignup", automationPayload);
        res.json({ success: true, message: "Newsletter signup successful" });
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

        logContactSubmission({
          name: typeof name === "string" ? name : "",
          email,
          message: typeof message === "string" ? message : "",
          type: typeof type === "string" ? type : null,
        });

        res.json({ success: true, message: "Message received" });
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
        console.error("Error reading registrations:", error);
        res.status(500).json({ error: "Failed to read registrations" });
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
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
      }
    },
  };
}
