import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, 'apps', 'server', '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), override: false });

const prisma = new PrismaClient();

async function runDiagnostic() {
    try {
        console.log('--- STARTING SMTP DIAGNOSTIC ---');

        const smtp = await prisma.smtpConfig.findFirst();

        console.log('\n[1] Current Configuration:');
        console.log(`- Host: ${smtp?.host || process.env.SMTP_HOST || '(empty)'}`);
        console.log(`- Port: ${smtp?.port || process.env.SMTP_PORT || '(empty)'}`);
        console.log(`- User: ${smtp?.user || process.env.SMTP_USER || '(empty)'}`);
        console.log(`- Pass: ${smtp?.pass || process.env.SMTP_PASS ? '********' : '(empty)'}`);

        const resolvedSmtp = {
            host: smtp?.host || process.env.SMTP_HOST || '',
            port: smtp?.port || process.env.SMTP_PORT || 587,
            user: smtp?.user || process.env.SMTP_USER || '',
            pass: smtp?.pass || process.env.SMTP_PASS || '',
        };

        if (!resolvedSmtp.host || !resolvedSmtp.user || !resolvedSmtp.pass) {
            console.log('\n❌ DIAGNOSTIC FAILED: Missing SMTP credentials.');
            console.log('Please configure SMTP in the admin dashboard or apps/server/.env first.');
            return;
        }

        console.log('\n[2] Initializing Transporter with verbose logging...');
        const transporter = nodemailer.createTransport({
            host: resolvedSmtp.host,
            port: parseInt(String(resolvedSmtp.port), 10) || 587,
            secure: parseInt(String(resolvedSmtp.port), 10) === 465, // true for 465, false for other ports
            auth: {
                user: resolvedSmtp.user,
                pass: resolvedSmtp.pass
            },
            logger: true, // Enable built-in logger
            debug: true   // Include SMTP traffic in the logs
        });

        console.log('\n[3] Verifying Connection...');
        const success = await transporter.verify();
        if (success) {
            console.log('\n✅ DIAGNOSTIC SUCCESS: Connected to the SMTP server successfully!');
            console.log('You are ready to send emails.');
        }
    } catch (error) {
        console.error('\n❌ DIAGNOSTIC FAILED: Could not connect to the SMTP server.');
        console.error('\n--- Error Details ---');
        console.error(error.message);
        console.error('---------------------');
        
        // Provide helpful tips based on common errors
        if (error.code === 'EAUTH') {
            console.log('\n💡 Fix: Check your username and password. If using Gmail, you may need an "App Password".');
        } else if (error.code === 'ESOCKET' || error.command === 'CONN') {
            console.log('\n💡 Fix: Check the Host and Port. Some providers block standard ports.');
        }
    } finally {
        console.log('\n--- END OF DIAGNOSTIC ---');
        await prisma.$disconnect();
    }
}

runDiagnostic();
