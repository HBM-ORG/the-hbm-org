import { PrismaClient } from '@prisma/client';
import { eventDateFieldToUtcIso } from '../shared/zoned-schedule.js';
import { runtimeConfig } from '../config/runtime-config.js';
import {
  getPublicEmailProviderConfig,
  saveEmailProviderConfig,
} from './email-provider-config.service.js';

const prisma = new PrismaClient();

function withLegacyId<T extends { id: string; legacyId?: string | null }>(row: T) {
  return {
    ...row,
    id: row.legacyId || row.id,
    databaseId: row.id,
  };
}

function normalizeAutomationTrigger(trigger: unknown) {
  const value = String(trigger || '').trim();
  const aliases: Record<string, string> = {
    site_signup: 'on8MinJourney',
    on_site_signup: 'on8MinJourney',
  };
  return aliases[value] || value;
}

function getFlowPriority(flow: any) {
  let score = 0;
  if (flow?.active) score += 10;
  if (flow?.deliveryMode && flow.deliveryMode !== 'architect_html') score += 5;
  if (flow?.legacyId && !String(flow.legacyId).startsWith('flow_')) score += 3;
  if (flow?.updatedAt instanceof Date) score += flow.updatedAt.getTime() / 1_000_000_000_000;
  return score;
}

function dedupeAutomationFlows<T extends { trigger: string; active?: boolean; deliveryMode?: string | null; legacyId?: string | null; updatedAt?: Date }>(flows: T[]) {
  const byTrigger = new Map<string, T>();
  for (const flow of flows) {
    const normalized = { ...flow, trigger: normalizeAutomationTrigger(flow.trigger) };
    const key = normalized.trigger.toLowerCase();
    if (!key) continue;
    const current = byTrigger.get(key);
    if (!current || getFlowPriority(normalized) >= getFlowPriority(current)) {
      byTrigger.set(key, normalized);
    }
  }
  return Array.from(byTrigger.values());
}

function parseStoredEventInstant(raw: unknown, timezone: string): Date | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string' && !raw.trim()) return null;
  const iso =
    typeof raw === 'number' ||
    typeof raw === 'string' ||
    raw instanceof Date
      ? eventDateFieldToUtcIso(raw as string | number | Date, timezone)
      : '';
  if (!iso) return null;
  return new Date(iso);
}

function getGlobalStylingData(globalStyling: any) {
  return {
    primaryColor: globalStyling.primaryColor || runtimeConfig.emailPrimaryColor,
    secondaryColor: globalStyling.secondaryColor || runtimeConfig.emailSecondaryColor,
    logoUrl: globalStyling.logoUrl || runtimeConfig.emailLogoUrl,
    fontFamily: globalStyling.fontFamily || runtimeConfig.emailFontFamily,
    useDefaultHeader: globalStyling.useDefaultHeader !== false,
    useDefaultFooter: globalStyling.useDefaultFooter !== false,
    headerMode: globalStyling.headerMode || 'gradient',
    headerImageUrl: globalStyling.headerImageUrl || null,
    headerTitle: globalStyling.headerTitle || null,
    headerSubtitle: globalStyling.headerSubtitle || null,
    headerBackgroundColor: globalStyling.headerBackgroundColor || null,
    headerBackgroundType: globalStyling.headerBackgroundType || null,
    headerGradientFrom: globalStyling.headerGradientFrom || null,
    headerGradientTo: globalStyling.headerGradientTo || null,
    headerGradientAngle: Number.isFinite(Number(globalStyling.headerGradientAngle)) ? Number(globalStyling.headerGradientAngle) : null,
    headerTextColor: globalStyling.headerTextColor || null,
    headerTextType: globalStyling.headerTextType || null,
    headerTextGradientFrom: globalStyling.headerTextGradientFrom || null,
    headerTextGradientTo: globalStyling.headerTextGradientTo || null,
    headerTextGradientAngle: Number.isFinite(Number(globalStyling.headerTextGradientAngle)) ? Number(globalStyling.headerTextGradientAngle) : null,
    footerText: globalStyling.footerText || null,
    footerImageUrl: globalStyling.footerImageUrl || null,
    footerBackgroundColor: globalStyling.footerBackgroundColor || null,
    footerBackgroundType: globalStyling.footerBackgroundType || null,
    footerGradientFrom: globalStyling.footerGradientFrom || null,
    footerGradientTo: globalStyling.footerGradientTo || null,
    footerGradientAngle: Number.isFinite(Number(globalStyling.footerGradientAngle)) ? Number(globalStyling.footerGradientAngle) : null,
    footerTextColor: globalStyling.footerTextColor || null,
    footerTextType: globalStyling.footerTextType || null,
    footerTextGradientFrom: globalStyling.footerTextGradientFrom || null,
    footerTextGradientTo: globalStyling.footerTextGradientTo || null,
    footerTextGradientAngle: Number.isFinite(Number(globalStyling.footerTextGradientAngle)) ? Number(globalStyling.footerTextGradientAngle) : null,
    unsubscribeLabel: globalStyling.unsubscribeLabel || null,
    unsubscribeUrl: globalStyling.unsubscribeUrl || null,
    signatureUrl: globalStyling.signatureUrl || null,
  };
}

export async function listEvents() {
  const rows = await prisma.event.findMany({ orderBy: { date: 'desc' } });
  return rows.map(withLegacyId);
}

export async function saveEventsBatch(events: any[]) {
  const results: any[] = [];
  const errors: Array<{ id: any; error: string }> = [];

  for (const event of events) {
    try {
      const legacyId = String(event.id || '');
      const normalizedStatus = ['draft', 'published', 'past'].includes(String(event.status || '').toLowerCase())
        ? String(event.status).toLowerCase()
        : 'published';
      const timezoneRaw = typeof event.timezone === 'string' ? event.timezone.trim() : '';
      let tz = timezoneRaw || 'Asia/Jerusalem';
      if (timezoneRaw) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: timezoneRaw });
        } catch {
          tz = 'Asia/Jerusalem';
        }
      }

      const resolvedStart =
        parseStoredEventInstant(event.date, tz) ??
        (event.date ? new Date(event.date as string) : new Date());
      const resolvedEndRaw =
        event.endDate != null && String(event.endDate).trim()
          ? parseStoredEventInstant(event.endDate, tz) ?? new Date(event.endDate as string)
          : null;

      const data = {
        legacyId,
        status: normalizedStatus,
        folderName: event.folderName || null,
        title: event.title || { en: '', he: '' },
        description: event.description || { en: '', he: '' },
        date: resolvedStart,
        endDate: resolvedEndRaw,
        timezone: tz,
        location: event.location || '',
        locationParams: event.locationParams || null,
        type: event.type || 'Face to Face',
        image: event.image || null,
        heroVideo: event.heroVideo || null,
        gallery: Array.isArray(event.gallery) ? event.gallery : [],
        imageBubbles: Array.isArray(event.imageBubbles) ? event.imageBubbles : [],
        promoBubbles: Array.isArray(event.promoBubbles) ? event.promoBubbles : [],
        whatToExpect: event.whatToExpect || null,
        showPartnership: Boolean(event.showPartnership),
        partnership: event.partnership || null,
        freeText: event.freeText || null,
        socialProof: event.socialProof || null,
        tags: Array.isArray(event.tags) ? event.tags : [],
        highlights: Array.isArray(event.highlights) ? event.highlights : [],
        partners: Array.isArray(event.partners) ? event.partners : [],
        faqs: Array.isArray(event.faqs) ? event.faqs : [],
        hostNote: event.hostNote || null,
        registration: event.registration || { status: 'open' },
        visuals: event.visuals || { brightness: 100, blur: 0, videoScale: 1 },
        isLocked: Boolean(event.isLocked),
        contentEnglishOnly: Boolean(event.contentEnglishOnly),
        importantDetailsHeading: event.importantDetailsHeading || null,
        importantDetailsSectionLabel: event.importantDetailsSectionLabel || null,
      };

      const result = await prisma.event.upsert({
        where: { legacyId },
        update: data,
        create: data,
      });
      results.push(result);
    } catch (err) {
      errors.push({
        id: event?.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return { results, errors };
}

export async function getSiteContentBundle() {
  const [team, testimonials, partners] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.testimonial.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.partner.findMany({ orderBy: { displayOrder: 'asc' } }),
  ]);

  return {
    team: team.map(withLegacyId),
    testimonials: testimonials.map(withLegacyId),
    partners: partners.map(withLegacyId),
  };
}

export async function saveSiteContentBundle({
  team = [],
  testimonials = [],
  partners = [],
}: {
  team?: any[];
  testimonials?: any[];
  partners?: any[];
}) {
  const errors: string[] = [];
  const results = { team: 0, testimonials: 0, partners: 0 };

  for (let i = 0; i < team.length; i++) {
    const member = team[i];
    try {
      const data = {
        legacyId: member.id || `team-${i}`,
        name: member.name || '',
        role: member.role || '',
        nickname: member.nickname || '',
        image: member.imageUrl || member.image || null,
        linkedin: member.linkedin || null,
        bio: member.bio || '',
        funFact: member.funFact || '',
        imagePosition: member.imagePosition || null,
        imageScale: member.imageScale || null,
        displayOrder: i,
      };

      await prisma.teamMember.upsert({
        where: { legacyId: data.legacyId },
        update: data,
        create: data,
      });
      results.team++;
    } catch (err) {
      errors.push(`Team member ${member?.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  for (let i = 0; i < testimonials.length; i++) {
    const testimonial = testimonials[i];
    try {
      const data = {
        legacyId: testimonial.id || `testimonial-${i}`,
        quote: testimonial.quote || '',
        author: testimonial.author || '',
        role: testimonial.role || '',
        companyLogo: testimonial.companyLogo || null,
        stars: testimonial.stars || 5,
        displayOrder: i,
      };

      await prisma.testimonial.upsert({
        where: { legacyId: data.legacyId },
        update: data,
        create: data,
      });
      results.testimonials++;
    } catch (err) {
      errors.push(`Testimonial ${testimonial?.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    try {
      const data = {
        legacyId: partner.id || `partner-${i}`,
        name: partner.name || '',
        logoUrl: partner.logoUrl || '',
        website: partner.website || null,
        displayOrder: i,
      };

      await prisma.partner.upsert({
        where: { legacyId: data.legacyId },
        update: data,
        create: data,
      });
      results.partners++;
    } catch (err) {
      errors.push(`Partner ${partner?.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { results, errors };
}

export async function getAutomationSettingsBundle() {
  const [flows, sequences, smtpConfig, globalStyling, providerConfig] = await Promise.all([
    prisma.emailFlow.findMany({ orderBy: { name: 'asc' } }),
    prisma.emailSequence.findMany({ orderBy: { name: 'asc' } }),
    prisma.smtpConfig.findFirst(),
    prisma.globalStyling.findFirst(),
    getPublicEmailProviderConfig(),
  ]);

  return {
    flows: dedupeAutomationFlows(flows).map(withLegacyId),
    sequences: sequences.map(withLegacyId),
    smtpConfig,
    globalStyling,
    providerConfig,
  };
}

export async function saveAutomationSettingsBundle({
  smtp,
  globalStyling,
  providerConfig,
  flows = [],
  sequences = [],
}: {
  smtp?: any;
  globalStyling?: any;
  providerConfig?: any;
  flows?: any[];
  sequences?: any[];
}) {
  const errors: string[] = [];
  const results = { smtp: false, globalStyling: false, providerConfig: false, flows: 0, sequences: 0 };

  if (smtp) {
    try {
      await prisma.smtpConfig.upsert({
        where: { id: 'default' },
        update: {
          host: smtp.host || runtimeConfig.defaultSmtpHost,
          port: smtp.port || runtimeConfig.defaultSmtpPort,
          user: smtp.user || '',
          pass: smtp.pass || '',
          from: smtp.from || runtimeConfig.defaultSmtpFrom,
          secure: Boolean(smtp.secure),
        },
        create: {
          id: 'default',
          host: smtp.host || runtimeConfig.defaultSmtpHost,
          port: smtp.port || runtimeConfig.defaultSmtpPort,
          user: smtp.user || '',
          pass: smtp.pass || '',
          from: smtp.from || runtimeConfig.defaultSmtpFrom,
          secure: Boolean(smtp.secure),
        },
      });
      results.smtp = true;
    } catch (err) {
      errors.push(`SMTP: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  if (globalStyling) {
    try {
      const data = getGlobalStylingData(globalStyling);
      await prisma.globalStyling.upsert({
        where: { id: 'default' },
        update: data,
        create: {
          id: 'default',
          ...data,
        },
      });
      results.globalStyling = true;
    } catch (err) {
      errors.push(`Global Styling: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  if (providerConfig) {
    try {
      await saveEmailProviderConfig(providerConfig);
      results.providerConfig = true;
    } catch (err) {
      errors.push(`Provider Config: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  for (const flow of flows) {
    try {
      const legacyId = String(flow.id || '');
      const deliveryMode = ['architect_html', 'brevo_template', 'brevo_automation'].includes(String(flow.deliveryMode || '').toLowerCase())
        ? String(flow.deliveryMode).toLowerCase()
        : 'architect_html';
      const status = String(flow.status || '').toLowerCase() === 'draft' ? 'draft' : 'published';
      const data = {
        legacyId,
        name: flow.name || '',
        trigger: normalizeAutomationTrigger(flow.trigger),
        icon: flow.icon ? String(flow.icon).trim() : null,
        status,
        active: flow.active !== false,
        deliveryMode,
        brevoTemplateId: flow.brevoTemplateId ? String(flow.brevoTemplateId).trim() : null,
        brevoTemplateIdEn: flow.brevoTemplateIdEn ? String(flow.brevoTemplateIdEn).trim() : null,
        brevoTemplateIdHe: flow.brevoTemplateIdHe ? String(flow.brevoTemplateIdHe).trim() : null,
        templateOverrides: flow.templateOverrides && typeof flow.templateOverrides === 'object' ? flow.templateOverrides : undefined,
        subject: {
          en: flow.subject || flow.subject_en || '',
          he: flow.subject_he || '',
        },
        body: {
          en: flow.body || flow.body_en || '',
          he: flow.body_he || '',
        },
        subjectB: flow.subjectB ? { en: flow.subjectB, he: '' } : undefined,
        abTestActive: Boolean(flow.abTestActive),
        includeCalendar: Boolean(flow.includeCalendar),
      };

      await prisma.emailFlow.upsert({
        where: { legacyId },
        update: data,
        create: data,
      });
      results.flows++;
    } catch (err) {
      errors.push(`Flow ${flow?.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  for (const sequence of sequences) {
    try {
      const legacyId = String(sequence.id || '');
      const data = {
        legacyId,
        name: sequence.name || '',
        trigger: sequence.trigger || '',
        active: sequence.active !== false,
        steps: Array.isArray(sequence.steps) ? sequence.steps : [],
      };

      await prisma.emailSequence.upsert({
        where: { legacyId },
        update: data,
        create: data,
      });
      results.sequences++;
    } catch (err) {
      errors.push(`Sequence ${sequence?.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { results, errors };
}

export async function deleteAutomationFlow(id: string) {
  const value = String(id || '').trim();
  if (!value) {
    throw new Error('Missing flow id');
  }

  const existing = await prisma.emailFlow.findFirst({
    where: {
      OR: [{ id: value }, { legacyId: value }],
    },
  });

  if (!existing) {
    return { deleted: false };
  }

  await prisma.emailFlow.delete({ where: { id: existing.id } });
  return { deleted: true };
}
