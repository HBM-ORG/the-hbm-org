import type { Request, Response } from "express";
import {
  getAutomationSettingsBundle,
  getSiteContentBundle,
  listEvents,
  saveAutomationSettingsBundle,
  saveEventsBatch,
  saveSiteContentBundle,
} from "../services/cms.service.js";
import { runtimeConfig } from "../config/runtime-config.js";
import { isAuthorizedRequest } from "../middleware/admin-auth.js";

function logCmsError(context: string, error: unknown) {
  console.error(`[cms.controller:${context}]`, error);
}

function getEventStatus(event: unknown): string {
  const raw =
    typeof event === "object" && event !== null && "status" in event
      ? (event as { status?: unknown }).status
      : undefined;
  return typeof raw === "string" && raw.trim() ? raw : "published";
}

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List events
 *     tags: [CMS]
 */
export async function getEvents(_req: Request, res: Response): Promise<void> {
  try {
    const events = await listEvents();
    res.json(
      events.map((event) => ({
        id: event.legacyId || event.id,
        status: getEventStatus(event),
        folderName: event.folderName,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        locationParams: event.locationParams,
        type: event.type,
        image: event.image,
        heroVideo: event.heroVideo,
        gallery: event.gallery || [],
        imageBubbles: event.imageBubbles || [],
        promoBubbles: event.promoBubbles || [],
        whatToExpect: event.whatToExpect,
        showPartnership: event.showPartnership,
        partnership: event.partnership,
        freeText: event.freeText,
        socialProof: event.socialProof,
        tags: event.tags || [],
        highlights: event.highlights || [],
        partners: event.partners || [],
        faqs: event.faqs || [],
        hostNote: event.hostNote,
        registration: event.registration,
        visuals: event.visuals,
        isLocked: event.isLocked,
        contentEnglishOnly: event.contentEnglishOnly,
        importantDetailsHeading: event.importantDetailsHeading,
        importantDetailsSectionLabel: event.importantDetailsSectionLabel,
      })),
    );
  } catch (err) {
    logCmsError("getEvents", err);
    res.status(200).json([]);
  }
}

/**
 * @openapi
 * /api/save-events:
 *   post:
 *     summary: Save events
 *     tags: [CMS]
 */
export async function saveEvents(req: Request, res: Response): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { events } = req.body || {};
    if (!Array.isArray(events)) {
      res.status(400).json({ error: 'Invalid data format: expected array' });
      return;
    }

    const { results, errors } = await saveEventsBatch(events);
    res.json({
      success: true,
      message: `Saved ${results.length} events successfully`,
      saved: results.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save events' });
  }
}

/**
 * @openapi
 * /api/site-content:
 *   get:
 *     summary: Get site content
 *     tags: [CMS]
 */
export async function getSiteContent(_req: Request, res: Response): Promise<void> {
  try {
    const { team, testimonials, partners } = await getSiteContentBundle();
    res.json({
      team: team.map((m) => ({
        id: m.legacyId || m.id,
        name: m.name,
        role: m.role,
        nickname: m.nickname,
        imageUrl: m.image,
        image: m.image,
        linkedin: m.linkedin,
        bio: m.bio,
        funFact: m.funFact,
        imagePosition: m.imagePosition,
        imageScale: m.imageScale,
      })),
      testimonials: testimonials.map((t) => ({
        id: t.legacyId || t.id,
        quote: t.quote,
        author: t.author,
        role: t.role,
        companyLogo: t.companyLogo,
        stars: t.stars,
      })),
      partners: partners.map((p) => ({
        id: p.legacyId || p.id,
        name: p.name,
        logoUrl: p.logoUrl,
      })),
      locks: { team: false, testimonials: false, partners: false },
    });
  } catch (err) {
    logCmsError("getSiteContent", err);
    res.status(200).json({
      team: [],
      testimonials: [],
      partners: [],
      locks: { team: false, testimonials: false, partners: false },
    });
  }
}

/**
 * @openapi
 * /api/site-content:
 *   post:
 *     summary: Save site content
 *     tags: [CMS]
 */
export async function saveSiteContent(req: Request, res: Response): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { team, testimonials, partners } = req.body || {};
    const { results, errors } = await saveSiteContentBundle({
      team: Array.isArray(team) ? team : [],
      testimonials: Array.isArray(testimonials) ? testimonials : [],
      partners: Array.isArray(partners) ? partners : [],
    });

    res.json({
      success: true,
      message: 'Site content saved successfully',
      results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save site content' });
  }
}

/**
 * @openapi
 * /api/automation-settings:
 *   get:
 *     summary: Get automation settings
 *     tags: [CMS]
 */
export async function getAutomationSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const { flows, sequences, smtpConfig, globalStyling } =
      await getAutomationSettingsBundle();

    res.json({
      smtp: smtpConfig || {
        host: runtimeConfig.defaultSmtpHost,
        port: runtimeConfig.defaultSmtpPort,
        user: '',
        pass: '',
        from: runtimeConfig.defaultSmtpFrom,
        secure: false,
      },
      globalStyling: globalStyling || {
        primaryColor: runtimeConfig.emailPrimaryColor,
        secondaryColor: runtimeConfig.emailSecondaryColor,
        logoUrl: runtimeConfig.emailLogoUrl,
        fontFamily: runtimeConfig.emailFontFamily,
      },
      flows: flows.map((f) => ({
        id: f.legacyId || f.id,
        name: f.name,
        trigger: f.trigger,
        active: f.active,
        subject: (f.subject as any)?.en || '',
        subject_en: (f.subject as any)?.en || '',
        subject_he: (f.subject as any)?.he || '',
        body: (f.body as any)?.en || '',
        body_en: (f.body as any)?.en || '',
        body_he: (f.body as any)?.he || '',
        subjectB: (f.subjectB as any)?.en || null,
        abTestActive: f.abTestActive,
        includeCalendar: f.includeCalendar,
      })),
      sequences: sequences.map((s) => ({
        id: s.legacyId || s.id,
        name: s.name,
        trigger: s.trigger,
        active: s.active,
        steps: s.steps || [],
      })),
    });
  } catch (err) {
    logCmsError("getAutomationSettings", err);
    res.status(200).json({
      smtp: {
        host: runtimeConfig.defaultSmtpHost,
        port: runtimeConfig.defaultSmtpPort,
        user: "",
        pass: "",
        from: runtimeConfig.defaultSmtpFrom,
        secure: false,
      },
      globalStyling: {
        primaryColor: runtimeConfig.emailPrimaryColor,
        secondaryColor: runtimeConfig.emailSecondaryColor,
        logoUrl: runtimeConfig.emailLogoUrl,
        fontFamily: runtimeConfig.emailFontFamily,
      },
      flows: [],
      sequences: [],
    });
  }
}

/**
 * @openapi
 * /api/automation-settings:
 *   post:
 *     summary: Save automation settings
 *     tags: [CMS]
 */
export async function saveAutomationSettings(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { smtp, globalStyling, flows, sequences } = req.body || {};
    const { results, errors } = await saveAutomationSettingsBundle({
      smtp,
      globalStyling,
      flows: Array.isArray(flows) ? flows : [],
      sequences: Array.isArray(sequences) ? sequences : [],
    });

    res.json({
      success: true,
      message: 'Automation settings saved successfully',
      results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Failed to save automation settings',
    });
  }
}
