import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service — RIN',
    description: 'Read the Terms of Service for the RIN student dropout risk intelligence platform.',
};

const LAST_UPDATED = 'February 19, 2026';

export default function TermsPage() {
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
                    <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px', margin: '0 0 12px', lineHeight: 1.1 }}>Terms of Service</h1>
                    <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: 0 }}>Last updated: {LAST_UPDATED}</p>
                </div>

                <div style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(35,6,3,0.82)' }}>

                    <Section title="1. Acceptance of Terms">
                        <p>By accessing or using the RIN platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using the Service on behalf of an educational institution, you represent that you have authority to bind that institution to these Terms. If you do not agree, please do not use the Service.</p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>RIN is an AI-powered student dropout risk intelligence platform designed to assist K–12 educators, school administrators, and academic advisors in identifying at-risk students, generating intervention strategies, and supporting data-informed decision-making. RIN does not make final decisions about students — it provides analytical insights to support professional educator judgment.</p>
                    </Section>

                    <Section title="3. Eligibility">
                        <p>You must be at least 18 years of age and employed by or affiliated with an accredited educational institution to use this Service. RIN is not intended for use by students directly.</p>
                    </Section>

                    <Section title="4. User Accounts">
                        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. RIN is not liable for any loss resulting from unauthorized use of your account.</p>
                    </Section>

                    <Section title="5. Acceptable Use">
                        <p>You agree to use RIN solely for lawful educational and professional purposes. You must not:</p>
                        <ul>
                            <li>Upload or input any personally identifiable student information beyond what is necessary for analysis</li>
                            <li>Use RIN to discriminate against students based on protected characteristics</li>
                            <li>Share AI-generated outputs as definitive diagnoses or final assessments</li>
                            <li>Attempt to reverse-engineer, scrape, or interfere with the platform</li>
                            <li>Use the Service in violation of FERPA, COPPA, or any applicable data protection law</li>
                        </ul>
                    </Section>

                    <Section title="6. Student Data & FERPA Compliance">
                        <p>RIN takes student privacy seriously. Any student data you enter into the platform is processed solely to provide the requested analysis. We do not sell, share, or use student data for advertising or model training without explicit consent. Users are responsible for ensuring that their use of RIN complies with FERPA and all applicable institutional data governance policies.</p>
                    </Section>

                    <Section title="7. AI Outputs & Disclaimer">
                        <p>RIN uses artificial intelligence to generate risk assessments and recommendations. <strong>These outputs are advisory in nature and are not a substitute for professional educator judgment, school counselor assessment, or institutional policy.</strong> RIN does not guarantee the accuracy, completeness, or fitness of any AI-generated content. Always verify AI insights against official school records and consult qualified professionals for significant decisions affecting students.</p>
                    </Section>

                    <Section title="8. Intellectual Property">
                        <p>All platform software, design, branding, and underlying models are the intellectual property of RIN and its licensors. You retain ownership of any data you input. By using the Service, you grant RIN a limited, non-exclusive license to process your inputs for the purpose of providing the Service.</p>
                    </Section>

                    <Section title="9. Termination">
                        <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms or if we determine that continued access poses a risk to students, the platform, or other users. You may delete your account at any time by contacting support.</p>
                    </Section>

                    <Section title="10. Limitation of Liability">
                        <p>To the maximum extent permitted by law, RIN and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to decisions made based on AI-generated outputs.</p>
                    </Section>

                    <Section title="11. Changes to These Terms">
                        <p>We may update these Terms from time to time. We will notify you of material changes by email or by posting a notice on the platform. Continued use of the Service after such changes constitutes acceptance of the updated Terms.</p>
                    </Section>

                    <Section title="12. Governing Law">
                        <p>These Terms are governed by the laws of the jurisdiction in which RIN is incorporated, without regard to conflict-of-law principles.</p>
                    </Section>

                    <Section title="13. Contact Us">
                        <p>For questions about these Terms, please contact us at <a href="mailto:legal@rin.edu" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>legal@rin.edu</a>.</p>
                    </Section>
                </div>

                {/* Footer nav */}
                <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(35,6,3,0.08)', display: 'flex', gap: 24, fontSize: 14 }}>
                    <Link href="/privacy" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
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
