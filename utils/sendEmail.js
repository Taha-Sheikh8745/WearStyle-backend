import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const sendEmail = async (options) => {
    const transporterConfigs = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s/g, '') : '',
        },
    };

    try {
        const transporter = nodemailer.createTransport(transporterConfigs);

        const message = {
            from: `${process.env.FROM_NAME || 'WearStyle'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(message);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[SMTP Failure]:', error.message);
        
        // Fallback: Log email to local file if SMTP fails
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
            
            const logPath = path.join(logDir, 'email_failures.log');
            const logEntry = `
========================================
TIMESTAMP: ${new Date().toISOString()}
RECIPIENT: ${options.email}
SUBJECT: ${options.subject}
ERROR: ${error.message}
----------------------------------------
MESSAGE:
${options.message}
========================================
\n`;
            fs.appendFileSync(logPath, logEntry);
            console.log(`[Email Fallback]: Logged email to ${logPath}`);
        } catch (logErr) {
            console.error('[Logging Fallback Failed]:', logErr.message);
        }
        
        throw error;
    }
};

export default sendEmail;
