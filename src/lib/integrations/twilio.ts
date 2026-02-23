import { ExecutionResult, StepContext } from "../workflow-engine/types";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SendSMSConfig {
    to: string;
    message: string;
    _context?: StepContext;
}

export async function sendSMSStep(config: SendSMSConfig): Promise<ExecutionResult> {
    const { to, message, _context } = config;

    console.log(`[Workflow: ${_context?.nodeName}] Sending SMS to ${to}...`);

    if (!client || !fromPhone) {
        console.warn("Twilio credentials or phone number missing. Simulating SMS send.");
        return {
            success: true,
            data: { messageSid: "simulated-sms-id", to }
        };
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: fromPhone,
            to: to,
        });

        console.log(`[Twilio] SMS sent successfully. SID: ${response.sid}`);
        return {
            success: true,
            data: { messageSid: response.sid, to, status: response.status }
        };
    } catch (err: any) {
        const errCode = err.code;
        const errMsg = err.message;
        const moreInfo = err.moreInfo || '';
        console.error(`[Twilio Error ${errCode}] ${errMsg}`, moreInfo);
        // Common codes: 21608 = unverified number (trial), 21211 = invalid to number
        const hint = errCode === 21608
            ? ' — Twilio trial accounts can only send to verified numbers. Visit twilio.com/console to verify the recipient or upgrade your account.'
            : errCode === 21211
                ? ' — Invalid phone number format. Include country code (e.g. +260777731615).'
                : moreInfo ? ` — ${moreInfo}` : '';
        return { success: false, error: `${errMsg}${hint}` };
    }
}
