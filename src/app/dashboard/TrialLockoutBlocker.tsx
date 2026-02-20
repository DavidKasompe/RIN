'use client';

import { useCustomer, CheckoutDialog } from 'autumn-js/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
    Activity,
    LogoutCurve,
    Crown,
    Check,
} from 'iconsax-reactjs';

export default function TrialLockoutBlocker() {
    const { customer, checkout } = useCustomer();
    const router = useRouter();
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!customer) return;

        // Check if there are any active products
        const hasActivePlans = customer.products.length > 0;

        // If they have no active plans and no features?
        // Let's rely on checking if they have an active plan or active trial.

        // Let's assume the product ID is "pro" as per our autumn.config.ts
        const proProduct = customer.products.find((p: any) => p.id === 'pro');

        // A customer is locked if their pro plan has expired/past_due, or if they have no products (unlikely if auto_enabled, but we didn't auto_enable).
        // Wait, wait... in our instructions, we didn't auto_enable. But normally, they should evaluate the trial status.
        // Actually, if they are legally allowed to use the app, `customer.products` will have a status of "active" or "trialing".
        // If status is "past_due" or "expired", they shouldn't access the app.

        // For safety, let's say they are locked if they don't have *any* plan in 'active' or 'trialing' state, OR if it's explicitly 'expired'. 
        // We can just rely on checking if `proProduct` is active/trialing.

        // For Devpost/hackathon, let's look at `status` of the 'pro' plan if it exists
        if (proProduct) {
            const statusStr = proProduct.status as string;
            if (statusStr === 'expired' || statusStr === 'past_due' || statusStr === 'canceled') {
                setIsLocked(true);
            }
        } else {
            // If they don't even have a plan attached, ideally they shouldn't be locked out *yet* unless we require it immediately.
            // But they might be setting up their school. For now, let's restrict locking to explicit expiry/past_due.
            setIsLocked(false);
        }

    }, [customer]);

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push('/signin');
                    },
                },
            });
        } catch (error) {
            console.error('Sign out error:', error);
            router.push('/signin');
        }
    };

    if (!isLocked) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(250,243,236,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 48,
                maxWidth: 460,
                width: '100%',
                boxShadow: '0 24px 48px -12px rgba(128,5,50,0.15)',
                textAlign: 'center',
                border: '1px solid rgba(128,5,50,0.08)'
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    backgroundColor: '#F2E6EA', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Crown size="32" color="#800532" variant="Bulk" />
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                    Trial Expired
                </h2>

                <p style={{ fontSize: 16, color: 'rgba(35,6,3,0.6)', margin: '0 0 32px', lineHeight: 1.5 }}>
                    Your school's 7-day free trial has come to an end. Upgrade your workspace to continue using RIN's AI assessments, intervention planning, and early warning systems.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await checkout({
                                    productId: 'pro',
                                    dialog: CheckoutDialog,
                                });
                            } catch (e) {
                                console.error('Checkout failed', e);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: '#800532',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Opening Checkout...' : 'Upgrade to School Team'}
                    </button>

                    <button
                        onClick={handleSignOut}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: 'transparent',
                            color: 'rgba(35,6,3,0.5)',
                            border: '1.5px solid rgba(128,5,50,0.15)',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(128,5,50,0.05)';
                            e.currentTarget.style.color = '#800532';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(35,6,3,0.5)';
                        }}
                    >
                        <LogoutCurve size="18" />
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
}
