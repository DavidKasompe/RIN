import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy — RIN',
    description: 'How RIN collects, uses, and protects your data and the student data you work with.',
};

const LAST_UPDATED = 'February 19, 2026';

export default function PrivacyPage() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAF3EC',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#230603',
        }}>
            {/* Nav */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: 'rgba(250,243,236,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(35,6,3,0.07)',
                padding: '0 32px',
            }}>
                <div style={{ maxWidth: 800, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 800, color: '#800532', letterSpacing: '-1.4px' }}>RIN</span>
                    </Link>
                    <Link href="/signup" style={{ fontSize: 14, fontWeight: 600, color: '#800532', textDecoration: 'none' }}>
                        Get started →
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px 96px' }}>
                {/* Header */}
                <div style={{ marginBottom: 48 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#800532', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Legal</p>
                    <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px', margin: '0 0 12px', lineHeight: 1.1 }}>Privacy Policy</h1>
                    <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: 0 }}>Last updated: {LAST_UPDATED}</p>
                </div>

                {/* Callout */}
                <div style={{
                    background: 'rgba(128,5,50,0.05)', border: '1px solid rgba(128,5,50,0.12)',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 48,
                    fontSize: 14, lineHeight: 1.7, color: 'rgba(35,6,3,0.75)',
                }}>
                    <strong style={{ color: '#800532' }}>Our commitment:</strong> We do not sell your data or student data. We do not use student information for advertising. Student data you enter is used only to provide the analysis you requested.
                </div>

                <div style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(35,6,3,0.82)' }}>

                    <Section title="1. Who We Are">
                        <p>RIN (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the RIN student dropout risk intelligence platform. This Privacy Policy explains how we collect, use, disclose, and protect information when you use our Service.</p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p><strong>Account information:</strong> When you create an account, we collect your name, email address, institutional affiliation, and role (e.g., educator, counselor).</p>
                        <p><strong>Usage data:</strong> We collect information about how you interact with the platform, including pages visited, features used, and session duration, to improve the Service.</p>
                        <p><strong>Student-related inputs:</strong> When you enter student data (e.g., attendance rates, GPA, behavioral information) into RIN for analysis, this data is transmitted to our AI processing layer and used solely to generate the requested output. We do not persistently store personally identifiable student information beyond any session data necessary for the analysis.</p>
                        <p><strong>Communications:</strong> If you contact us, we collect and retain your messages for support and legal purposes.</p>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Provide, maintain, and improve the RIN Service</li>
                            <li>Authenticate users and secure accounts</li>
                            <li>Process AI analysis requests you initiate</li>
                            <li>Send transactional communications (e.g., account confirmations, security alerts)</li>
                            <li>Comply with legal obligations</li>
                            <li>Detect and prevent fraud or abuse</li>
                        </ul>
                    </Section>

                    <Section title="4. Student Data & FERPA">
                        <p>RIN is designed to operate as a &quot;school official&quot; under FERPA with a legitimate educational interest when used by institutions covered by FERPA. We process student education records only as directed by the educator or institution, and we do not use student records for any purpose other than providing the requested Service.</p>
                        <p>We do not:</p>
                        <ul>
                            <li>Sell student data to third parties</li>
                            <li>Use student data for advertising or model training without explicit written consent</li>
                            <li>Share student information with parties not involved in providing the Service</li>
                        </ul>
                        <p>Institutions are responsible for ensuring their use of RIN complies with FERPA and any applicable state student privacy laws.</p>
                    </Section>

                    <Section title="5. Data Sharing & Disclosure">
                        <p>We do not sell, rent, or trade your personal information. We may share information only in these limited circumstances:</p>
                        <ul>
                            <li><strong>Service providers:</strong> We engage trusted vendors (e.g., cloud hosting, AI infrastructure) who process data on our behalf under strict data processing agreements</li>
                            <li><strong>Legal requirements:</strong> We may disclose data if required by law, court order, or to protect the rights or safety of users or the public</li>
                            <li><strong>Business transfers:</strong> In the event of a merger or acquisition, user data may be transferred, subject to the same privacy protections</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Retention">
                        <p>Account information is retained for as long as your account is active. Student analysis inputs are not stored beyond the active session unless you explicitly save a session. You may request deletion of your account and associated data at any time by contacting <a href="mailto:privacy@rin.edu" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>privacy@rin.edu</a>.</p>
                    </Section>

                    <Section title="7. Security">
                        <p>We implement industry-standard security measures including encryption in transit (TLS), access controls, and regular security assessments. However, no system is completely impenetrable, and we cannot guarantee absolute security. We will notify affected users promptly in the event of a data breach as required by law.</p>
                    </Section>

                    <Section title="8. Cookies & Tracking">
                        <p>We use strictly necessary cookies for authentication and session management. We do not use third-party advertising cookies. You may disable cookies in your browser settings, though this may affect platform functionality.</p>
                    </Section>

                    <Section title="9. Your Rights">
                        <p>Depending on your jurisdiction, you may have the right to:</p>
                        <ul>
                            <li>Access and obtain a copy of your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data</li>
                            <li>Object to or restrict certain processing</li>
                            <li>Data portability</li>
                        </ul>
                        <p>To exercise these rights, contact us at <a href="mailto:privacy@rin.edu" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>privacy@rin.edu</a>. We will respond within 30 days.</p>
                    </Section>

                    <Section title="10. Children's Privacy">
                        <p>RIN is not intended for use by individuals under 18. We do not knowingly collect personal information from minors. Student data entered by educators is processed as described in Section 4 and is governed by FERPA and institutional policies.</p>
                    </Section>

                    <Section title="11. Changes to This Policy">
                        <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notice. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.</p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>For privacy questions, data requests, or concerns, please contact our privacy team at <a href="mailto:privacy@rin.edu" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>privacy@rin.edu</a>.</p>
                    </Section>
                </div>

                {/* Footer nav */}
                <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(35,6,3,0.08)', display: 'flex', gap: 24, fontSize: 14 }}>
                    <Link href="/terms" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
                    <Link href="/signup" style={{ color: 'rgba(35,6,3,0.5)', textDecoration: 'none' }}>Create account</Link>
                    <Link href="/signin" style={{ color: 'rgba(35,6,3,0.5)', textDecoration: 'none' }}>Sign in</Link>
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px', color: '#230603' }}>{title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {children}
            </div>
        </div>
    );
}
