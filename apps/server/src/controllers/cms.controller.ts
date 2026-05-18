import type { Request, Response } from "express";
import {
  deleteAutomationFlow,
  getAutomationSettingsBundle,
  getSiteContentBundle,
  listEvents,
  saveAutomationSettingsBundle,
  saveEventsBatch,
  saveSiteContentBundle,
} from "../services/cms.service.js";
import { runtimeConfig } from "../config/runtime-config.js";
import { isAuthorizedRequest } from "../middleware/admin-auth.js";
import { brevoAdminTestAddToList } from "../services/brevo.service.js";
import { getEffectiveBrevoListCatalog } from "../services/brevo-catalog-resolve.service.js";
import { resolveListIdsFromKeys } from "../services/brevo-list-catalog.service.js";

function logCmsError(context: string, error: unknown) {
  console.error(`[cms.controller:${context}]`, error);
}

function isoFromMaybeDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null;
    return raw.toISOString();
  }
  if (typeof raw === "string") {
    const t = Date.parse(raw);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString();
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function timezoneString(raw: unknown, fallback = "Asia/Jerusalem"): string {
  return typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
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
    res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    const events = await listEvents();
    res.json(
      events.map((event) => ({
        id: event.legacyId || event.id,
        status: getEventStatus(event),
        folderName: event.folderName,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        endDate: isoFromMaybeDate((event as Record<string, unknown>).endDate),
        timezone: timezoneString((event as Record<string, unknown>).timezone),
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
    const { flows, sequences, smtpConfig, globalStyling, providerConfig } =
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
        useDefaultHeader: true,
        useDefaultFooter: true,
        headerMode: 'gradient',
        headerImageUrl: '',
        headerTitle: '',
        headerSubtitle: '',
        headerBackgroundColor: '',
        headerBackgroundType: 'gradient',
        headerGradientFrom: '',
        headerGradientTo: '',
        headerGradientAngle: 135,
        headerTextColor: '',
        headerTextType: 'flat',
        headerTextGradientFrom: '',
        headerTextGradientTo: '',
        headerTextGradientAngle: 135,
        footerText: '',
        footerImageUrl: '',
        footerBackgroundColor: '',
        footerBackgroundType: 'flat',
        footerGradientFrom: '',
        footerGradientTo: '',
        footerGradientAngle: 135,
        footerTextColor: '',
        footerTextType: 'flat',
        footerTextGradientFrom: '',
        footerTextGradientTo: '',
        footerTextGradientAngle: 135,
        unsubscribeLabel: '',
        unsubscribeUrl: '',
        signatureUrl: '',
      },
      providerConfig,
      flows: flows.map((f: any) => ({
        id: f.legacyId || f.id,
        name: f.name,
        trigger: f.trigger,
        icon: f.icon || '',
        status: f.status || 'published',
        active: f.active,
        deliveryMode: f.deliveryMode || 'architect_html',
        brevoTemplateId: f.brevoTemplateId || '',
        brevoTemplateIdEn: f.brevoTemplateIdEn || '',
        brevoTemplateIdHe: f.brevoTemplateIdHe || '',
        templateOverrides: f.templateOverrides || {},
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
        useDefaultHeader: true,
        useDefaultFooter: true,
        headerMode: 'gradient',
        headerImageUrl: '',
        headerTitle: '',
        headerSubtitle: '',
        headerBackgroundColor: '',
        headerBackgroundType: 'gradient',
        headerGradientFrom: '',
        headerGradientTo: '',
        headerGradientAngle: 135,
        headerTextColor: '',
        headerTextType: 'flat',
        headerTextGradientFrom: '',
        headerTextGradientTo: '',
        headerTextGradientAngle: 135,
        footerText: '',
        footerImageUrl: '',
        footerBackgroundColor: '',
        footerBackgroundType: 'flat',
        footerGradientFrom: '',
        footerGradientTo: '',
        footerGradientAngle: 135,
        footerTextColor: '',
        footerTextType: 'flat',
        footerTextGradientFrom: '',
        footerTextGradientTo: '',
        footerTextGradientAngle: 135,
        unsubscribeLabel: '',
        unsubscribeUrl: '',
        signatureUrl: '',
      },
      providerConfig: {
        emailProvider: runtimeConfig.emailProvider,
        brevoApiUrl: runtimeConfig.brevoApiUrl,
        brevoApiKey: "",
        brevoApiKeyMasked: runtimeConfig.brevoApiKey ? "********" : "",
        brevoApiKeySource: runtimeConfig.brevoApiKey ? "env" : "none",
        brevoConfigured: Boolean(runtimeConfig.brevoApiKey),
        brevoSenderName: "The HBM",
        brevoSenderEmail: runtimeConfig.defaultSmtpFrom,
        brevoAutomationEnabled: false,
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

    const { smtp, globalStyling, providerConfig, flows, sequences } = req.body || {};
    const { results, errors } = await saveAutomationSettingsBundle({
      smtp,
      globalStyling,
      providerConfig,
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

/**
 * Admin: upsert a contact into Brevo and add them to a list (triggers list-based automations).
 */
export async function postBrevoTestListSubscription(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { email, listKey, displayName } = req.body || {};
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const key = typeof listKey === "string" ? listKey.trim().toLowerCase() : "";

    if (!normalizedEmail || !key) {
      res.status(400).json({ error: "email and listKey are required" });
      return;
    }

    const catalog = await getEffectiveBrevoListCatalog();
    const { listIds, unknownKeys } = resolveListIdsFromKeys([key], catalog);
    if (unknownKeys.length || listIds.length === 0) {
      res.status(400).json({
        error: `Unknown list key "${listKey}". Check Site Settings override or BREVO_LIST_IDS.`,
      });
      return;
    }

    const result = await brevoAdminTestAddToList({
      email: normalizedEmail,
      listIds,
      displayName: typeof displayName === "string" ? displayName : undefined,
    });

    if (result.status === "skipped") {
      res.status(400).json({ error: result.message || "Brevo not configured" });
      return;
    }

    res.json({
      success: true,
      listIds,
      listKey: key,
      result,
    });
  } catch (err) {
    logCmsError("postBrevoTestListSubscription", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to subscribe test contact",
    });
  }
}

export async function deleteAutomationFlowController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await deleteAutomationFlow(id);
    res.json({ success: true, ...result });
  } catch (err) {
    logCmsError("deleteAutomationFlow", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to delete automation flow',
    });
  }
}
