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

        return {
            success: true,
            data: { messageSid: response.sid, to }
        };
    } catch (err: any) {
        console.error("Twilio Error:", err);
        return { success: false, error: err.message };
    }
}
