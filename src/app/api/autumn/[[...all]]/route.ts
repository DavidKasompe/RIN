import { autumnHandler } from "autumn-js/next";
import { auth } from "@/lib/auth";

export const { GET, POST } = autumnHandler({
    identify: async (request) => {
        // Get the user from better-auth safely
        let session: any = null;
        try {
            session = await auth.api.getSession({
                headers: request.headers,
            });
        } catch (e: any) {
            console.warn("DB Timeout or Auth Error in Autumn Identify", e.message);
        }

        // If the user doesn't have a school yet (e.g., they are in onboarding), 
        // we use their user ID. Otherwise we use their school ID so billing is per-school.
        const customerId = session?.user?.schoolId || session?.user?.id || 'anonymous_visitor';

        return {
            customerId,
            customerData: {
                name: session?.user?.name,
                email: session?.user?.email,
            },
        };
    },
});
