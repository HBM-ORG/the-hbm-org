/**
 * JSON to Database Migration Script
 * Migrates data from JSON files to MySQL database using Prisma
 *
 * Usage:
 *   npx tsx scripts/migrate-json-to-db.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Preview migrations without writing to database
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Paths to JSON files
const EVENTS_FILE_PATH = path.join(PROJECT_ROOT, 'public', 'data', 'events.json');
const SITE_CONFIGS_PATH = path.join(PROJECT_ROOT, 'data', 'site-configs.json');
const AUTOMATION_CONFIG_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'automationConfig.json');

/**
 * Load JSON file safely
 */
function loadJsonFile(filePath: string): any {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * Migrate events from events.json to Event table
 */
async function migrateEvents(): Promise<{ count: number; errors: string[] }> {
  const events = loadJsonFile(EVENTS_FILE_PATH);
  if (!Array.isArray(events)) {
    return { count: 0, errors: ['Invalid or missing events.json'] };
  }

  const errors: string[] = [];
  let count = 0;

  for (const event of events) {
    try {
      const data = {
        legacyId: String(event.id || ''),
        folderName: event.folderName || null,
        title: event.title || { en: '', he: '' },
        description: event.description || { en: '', he: '' },
        date: event.date ? new Date(event.date) : new Date(),
        location: event.location || '',
        locationParams: event.locationParams || null,
        type: event.type || 'Face to Face',
        image: event.image || null,
        heroVideo: event.heroVideo || null,
        gallery: Array.isArray(event.gallery) ? event.gallery : [],
        imageBubbles: Array.isArray(event.imageBubbles) ? event.imageBubbles : [],
        promoBubbles: Array.isArray(event.promoBubbles) ? event.promoBubbles : [],
        whatToExpect: event.whatToExpect || null,
        showPartnership: event.showPartnership || false,
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
        isLocked: event.isLocked || false,
        contentEnglishOnly: event.contentEnglishOnly || false,
        importantDetailsHeading: event.importantDetailsHeading || null,
        importantDetailsSectionLabel: event.importantDetailsSectionLabel || null,
      };

      if (!dryRun) {
        await prisma.event.upsert({
          where: { legacyId: data.legacyId },
          update: data,
          create: data,
        });
      }

      count++;
      console.log(`  Migrated event: ${data.legacyId} - ${data.title?.en || 'Untitled'}`);
    } catch (error) {
      const errorMsg = `Failed to migrate event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`  ERROR: ${errorMsg}`);
    }
  }

  return { count, errors };
}

/**
 * Migrate site configs from site-configs.json to TeamMember, Testimonial, Partner tables
 */
async function migrateSiteConfigs(): Promise<{
  teamCount: number;
  testimonialCount: number;
  partnerCount: number;
  errors: string[];
}> {
  const config = loadJsonFile(SITE_CONFIGS_PATH);
  if (!config) {
    return { teamCount: 0, testimonialCount: 0, partnerCount: 0, errors: ['Invalid or missing site-configs.json'] };
  }

  const errors: string[] = [];
  let teamCount = 0;
  let testimonialCount = 0;
  let partnerCount = 0;

  // Migrate team members
  if (Array.isArray(config.team)) {
    for (let i = 0; i < config.team.length; i++) {
      const member = config.team[i];
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

        if (!dryRun) {
          await prisma.teamMember.upsert({
            where: { legacyId: data.legacyId },
            update: data,
            create: data,
          });
        }

        teamCount++;
        console.log(`  Migrated team member: ${data.legacyId} - ${data.name}`);
      } catch (error) {
        const errorMsg = `Failed to migrate team member ${member.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ERROR: ${errorMsg}`);
      }
    }
  }

  // Migrate testimonials
  if (Array.isArray(config.testimonials)) {
    for (let i = 0; i < config.testimonials.length; i++) {
      const testimonial = config.testimonials[i];
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

        if (!dryRun) {
          await prisma.testimonial.upsert({
            where: { legacyId: data.legacyId },
            update: data,
            create: data,
          });
        }

        testimonialCount++;
        console.log(`  Migrated testimonial: ${data.legacyId} - ${data.author}`);
      } catch (error) {
        const errorMsg = `Failed to migrate testimonial ${testimonial.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ERROR: ${errorMsg}`);
      }
    }
  }

  // Migrate partners
  if (Array.isArray(config.partners)) {
    for (let i = 0; i < config.partners.length; i++) {
      const partner = config.partners[i];
      try {
        const data = {
          legacyId: partner.id || `partner-${i}`,
          name: partner.name || '',
          logoUrl: partner.logoUrl || '',
          website: null, // Not in current JSON schema
          displayOrder: i,
        };

        if (!dryRun) {
          await prisma.partner.upsert({
            where: { legacyId: data.legacyId },
            update: data,
            create: data,
          });
        }

        partnerCount++;
        console.log(`  Migrated partner: ${data.legacyId} - ${data.name}`);
      } catch (error) {
        const errorMsg = `Failed to migrate partner ${partner.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ERROR: ${errorMsg}`);
      }
    }
  }

  return { teamCount, testimonialCount, partnerCount, errors };
}

/**
 * Migrate automation config from automationConfig.json to EmailFlow, EmailSequence, SmtpConfig, GlobalStyling tables
 */
async function migrateAutomationConfig(): Promise<{
  flowCount: number;
  sequenceCount: number;
  errors: string[];
}> {
  const config = loadJsonFile(AUTOMATION_CONFIG_PATH);
  if (!config) {
    return { flowCount: 0, sequenceCount: 0, errors: ['Invalid or missing automationConfig.json'] };
  }

  const errors: string[] = [];
  let flowCount = 0;
  let sequenceCount = 0;

  // Migrate SMTP config (single row)
  if (config.smtp) {
    try {
      const smtpData = {
        id: 'default',
        host: config.smtp.host || 'smtp.office365.com',
        port: config.smtp.port || 587,
        user: config.smtp.user || '',
        pass: config.smtp.pass || '', // Note: Should be encrypted in production
        from: config.smtp.from || '',
        secure: config.smtp.secure || false,
      };

      if (!dryRun) {
        await prisma.smtpConfig.upsert({
          where: { id: 'default' },
          update: smtpData,
          create: smtpData,
        });
      }

      console.log(`  Migrated SMTP config: ${smtpData.host}:${smtpData.port}`);
    } catch (error) {
      const errorMsg = `Failed to migrate SMTP config: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`  ERROR: ${errorMsg}`);
    }
  }

  // Migrate global styling (single row)
  if (config.globalStyling) {
    try {
      const stylingData = {
        id: 'default',
        primaryColor: config.globalStyling.primaryColor || '#6160AB',
        secondaryColor: config.globalStyling.secondaryColor || '#F07B3C',
        logoUrl: config.globalStyling.logoUrl || '/logo.png',
        fontFamily: config.globalStyling.fontFamily || 'Sora, sans-serif',
      };

      if (!dryRun) {
        await prisma.globalStyling.upsert({
          where: { id: 'default' },
          update: stylingData,
          create: stylingData,
        });
      }

      console.log(`  Migrated global styling: ${stylingData.primaryColor} / ${stylingData.secondaryColor}`);
    } catch (error) {
      const errorMsg = `Failed to migrate global styling: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`  ERROR: ${errorMsg}`);
    }
  }

  // Migrate email flows
  if (Array.isArray(config.flows)) {
    for (const flow of config.flows) {
      try {
        const data = {
          legacyId: flow.id || '',
          name: flow.name || '',
          trigger: flow.trigger || '',
          active: flow.active !== false,
          subject: flow.subject ? { en: flow.subject, he: flow.subject_he || '' } : flow.subject_en ? { en: flow.subject_en, he: flow.subject_he || '' } : { en: '', he: '' },
          body: flow.body ? { en: flow.body, he: flow.body_he || '' } : flow.body_en ? { en: flow.body_en, he: flow.body_he || '' } : { en: '', he: '' },
          subjectB: flow.subjectB ? { en: flow.subjectB, he: '' } : undefined,
          abTestActive: flow.abTestActive || false,
          includeCalendar: flow.includeCalendar || false,
        };

        if (!dryRun) {
          await prisma.emailFlow.upsert({
            where: { legacyId: data.legacyId },
            update: data,
            create: data,
          });
        }

        flowCount++;
        console.log(`  Migrated email flow: ${data.legacyId} - ${data.name}`);
      } catch (error) {
        const errorMsg = `Failed to migrate flow ${flow.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ERROR: ${errorMsg}`);
      }
    }
  }

  // Migrate email sequences
  if (Array.isArray(config.sequences)) {
    for (const sequence of config.sequences) {
      try {
        const data = {
          legacyId: sequence.id || '',
          name: sequence.name || '',
          trigger: sequence.trigger || '',
          active: sequence.active !== false,
          steps: Array.isArray(sequence.steps) ? sequence.steps : [],
        };

        if (!dryRun) {
          await prisma.emailSequence.upsert({
            where: { legacyId: data.legacyId },
            update: data,
            create: data,
          });
        }

        sequenceCount++;
        console.log(`  Migrated email sequence: ${data.legacyId} - ${data.name}`);
      } catch (error) {
        const errorMsg = `Failed to migrate sequence ${sequence.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ERROR: ${errorMsg}`);
      }
    }
  }

  return { flowCount, sequenceCount, errors };
}

/**
 * Main migration function
 */
async function main() {
  console.log('========================================');
  console.log('JSON to Database Migration');
  console.log('========================================');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (writing to database)'}`);
  console.log(`Database: ${process.env.DATABASE_URL}`);
  console.log('');

  try {
    // Migrate events
    console.log('--- Migrating Events ---');
    const eventResult = await migrateEvents();
    console.log(`Events: ${eventResult.count} migrated, ${eventResult.errors.length} errors`);
    console.log('');

    // Migrate site configs
    console.log('--- Migrating Site Configs ---');
    const siteResult = await migrateSiteConfigs();
    console.log(`Team Members: ${siteResult.teamCount} migrated`);
    console.log(`Testimonials: ${siteResult.testimonialCount} migrated`);
    console.log(`Partners: ${siteResult.partnerCount} migrated`);
    console.log(`Errors: ${siteResult.errors.length}`);
    console.log('');

    // Migrate automation config
    console.log('--- Migrating Automation Config ---');
    const automationResult = await migrateAutomationConfig();
    console.log(`Email Flows: ${automationResult.flowCount} migrated`);
    console.log(`Email Sequences: ${automationResult.sequenceCount} migrated`);
    console.log(`Errors: ${automationResult.errors.length}`);
    console.log('');

    // Summary
    console.log('========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Events: ${eventResult.count}`);
    console.log(`Team Members: ${siteResult.teamCount}`);
    console.log(`Testimonials: ${siteResult.testimonialCount}`);
    console.log(`Partners: ${siteResult.partnerCount}`);
    console.log(`Email Flows: ${automationResult.flowCount}`);
    console.log(`Email Sequences: ${automationResult.sequenceCount}`);
    console.log('');

    const totalErrors = eventResult.errors.length + siteResult.errors.length + automationResult.errors.length;
    if (totalErrors > 0) {
      console.log(`ERRORS: ${totalErrors}`);
      const allErrors = [...eventResult.errors, ...siteResult.errors, ...automationResult.errors];
      allErrors.forEach((err) => console.log(`  - ${err}`));
    } else {
      console.log('All migrations completed successfully!');
    }

    if (dryRun) {
      console.log('');
      console.log('This was a dry run. No data was written to the database.');
      console.log('Run without --dry-run to perform the actual migration.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
