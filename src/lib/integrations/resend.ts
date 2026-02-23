import { ExecutionResult, StepContext } from "../workflow-engine/types";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
// Conditionally instantiate so tests or dev envs without the key don't immediately crash on boot,
// but rather fail when the step is actually executed.
const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailConfig {
    to: string;
    subject: string;
    body: string;
    from?: string; // e.g. "RIN Updates <notifications@resend.dev>"
    _context?: StepContext;
}

export async function sendEmailStep(config: SendEmailConfig): Promise<ExecutionResult> {
    const { to, subject, body, from, _context } = config;

    console.log(`[Workflow: ${_context?.nodeName}] Sending email to ${to}...`);

    if (!resend) {
        console.warn("RESEND_API_KEY is not set. Simulating email send.");
        return {
            success: true,
            data: { messageId: "simulated-email-id", to, subject }
        };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from || 'RIN Notifications <noreply@withrin.co>',
            to: to,
            subject: subject,
            html: body,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: { messageId: data?.id, to, subject }
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
