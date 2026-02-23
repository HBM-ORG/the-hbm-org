import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'src', 'data', 'automationConfig.json');

async function runDiagnostic() {
    console.log('--- STARTING SMTP DIAGNOSTIC ---');
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ Error: automationConfig.json not found!');
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const smtp = config.smtp;

    console.log('\n[1] Current Configuration:');
    console.log(`- Host: ${smtp.host || '(empty)'}`);
    console.log(`- Port: ${smtp.port}`);
    console.log(`- User: ${smtp.user || '(empty)'}`);
    console.log(`- Pass: ${smtp.pass ? '********' : '(empty)'}`);

    if (!smtp.host || !smtp.user || !smtp.pass) {
        console.log('\n❌ DIAGNOSTIC FAILED: Missing SMTP credentials.');
        console.log('Please enter your SMTP Host, User, and Pass in the Admin Dashboard -> Setup tab first.');
        return;
    }

    console.log('\n[2] Initializing Transporter with verbose logging...');
    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: parseInt(smtp.port) || 587,
        secure: parseInt(smtp.port) === 465, // true for 465, false for other ports
        auth: {
            user: smtp.user,
            pass: smtp.pass
        },
        logger: true, // Enable built-in logger
        debug: true   // Include SMTP traffic in the logs
    });

    console.log('\n[3] Verifying Connection...');
    try {
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
    }
    
    console.log('\n--- END OF DIAGNOSTIC ---');
}

runDiagnostic();
