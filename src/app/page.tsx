import { Navbar, Card, Button } from '@/components/shared';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import LibrarySection from '@/components/shared/LibrarySection';
import HowItWorksCarousel from '@/components/shared/HowItWorksCarousel';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section
        className="bg-white"
        style={{
          paddingTop: '176px',
          paddingBottom: '64px',
          paddingLeft: '24px',
          paddingRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {/* Pill badge */}
        <a
          href="/signup"
          className="no-underline"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-primary)',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 500,
            transition: 'color 0.2s, background-color 0.2s',
          }}
        >
          Empowering Educators with AI
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '16px' }}>
            <path d="M14 5.75L20.25 12L14 18.25M19.5 12H3.75" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        {/* Large heading */}
        <h1
          style={{
            fontSize: '68px',
            lineHeight: '68px',
            color: 'rgb(41, 41, 41)',
            letterSpacing: '-1.02px',
            fontFamily: "Georgia, 'Times New Roman', Times, serif",
            textAlign: 'center',
            textWrap: 'balance',
            maxWidth: '1326px',
            margin: '0 auto',
            fontWeight: 400,
          }}
        >
          AI decisions, <em style={{ fontStyle: 'italic' }}>explained</em> for humans.
        </h1>

        {/* Subtitle */}
        <h2
          style={{
            fontSize: '24px',
            lineHeight: '32px',
            color: 'rgb(114, 114, 110)',
            fontWeight: 300,
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            padding: '0 56px',
          }}
        >
          RIN helps educators understand student risk predictions with clear, actionable insights.
        </h2>

        {/* CTA Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href="/signup"
            className="no-underline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '56px',
              paddingLeft: '20px',
              paddingRight: '24px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: 500,
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
              position: 'relative',
              transition: 'all 0.075s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '20px', flexShrink: 0 }}>
              <path d="M14 5.75L20.25 12L14 18.25M19.5 12H3.75" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            &nbsp;&nbsp;Get Started Free
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-black mb-2">
                <AnimatedCounter end={10000} suffix="+" />
              </div>
              <div className="text-sm text-[var(--color-text-light)]">Students Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-black mb-2">
                <AnimatedCounter end={500} suffix="+" duration={1800} />
              </div>
              <div className="text-sm text-[var(--color-text-light)]">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-black mb-2">
                <AnimatedCounter end={95} suffix="%" duration={1600} />
              </div>
              <div className="text-sm text-[var(--color-text-light)]">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-black mb-2">
                24/7
              </div>
              <div className="text-sm text-[var(--color-text-light)]">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Library Section */}
      <LibrarySection />

      {/* How It Works */}
      <HowItWorksCarousel />

      {/* CTA Section — Granola style */}
      <section style={{ padding: '80px 24px 0', background: '#fff' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '64px 64px 0',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '8px',
            border: '0.8px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* Inner white card */}
          <div
            style={{
              padding: '96px 64px',
              backgroundColor: '#fff',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              position: 'relative',
            }}
          >
            {/* Traffic light dots */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: 'rgb(248, 113, 113)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: 'rgb(254, 190, 41)', marginLeft: '8px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', marginLeft: '8px' }} />
            </div>

            {/* Heading + subtitle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '100%' }}>
              <h2
                style={{
                  fontSize: '68px',
                  lineHeight: '68px',
                  letterSpacing: '-1.02px',
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  fontWeight: 400,
                  margin: 0,
                  textWrap: 'balance',
                  color: 'rgb(41, 41, 41)',
                }}
              >
                Ready for <em style={{ fontStyle: 'italic' }}>smarter</em>, more transparent AI?
              </h2>
              <p
                style={{
                  fontSize: '24px',
                  lineHeight: '32px',
                  color: 'rgb(114, 114, 110)',
                  fontWeight: 300,
                  textWrap: 'balance',
                  maxWidth: '896px',
                  margin: 0,
                }}
              >
                Try RIN for a few analyses today. It&apos;s free to get started.
              </p>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href="/signup"
                className="no-underline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '56px',
                  paddingLeft: '20px',
                  paddingRight: '24px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '20px',
                  lineHeight: '28px',
                  fontWeight: 500,
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.075s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '20px', flexShrink: 0 }}>
                  <path d="M14 5.75L20.25 12L14 18.25M19.5 12H3.75" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                &nbsp;&nbsp;Get Started Free
              </a>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '56px',
                  paddingLeft: '20px',
                  paddingRight: '24px',
                  backgroundColor: 'var(--color-card)',
                  color: 'rgb(41, 41, 41)',
                  fontSize: '20px',
                  lineHeight: '28px',
                  fontWeight: 500,
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.075s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.25rem', height: '20px' }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                </svg>
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — Granola style */}
      <footer
        id="about"
        style={{
          padding: '64px 64px 40px',
          background: '#fafafa',
          borderTop: '1px solid #eee',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top row: logo + link columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr', gap: '40px', marginBottom: '80px' }}>
            {/* Logo */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/RIN-Logo.png"
                  alt="RIN"
                  style={{
                    height: '72px',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>

            {/* Column 1 — Platform */}
            <div>
              <p style={{ fontSize: '14px', color: 'rgb(114, 114, 110)', marginBottom: '12px', fontWeight: 500 }}>Platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/dashboard" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Dashboard</a>
                <a href="/dashboard/analyze" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Analyze</a>
                <a href="/dashboard/input" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Data Input</a>
              </div>
            </div>

            {/* Column 2 — Product */}
            <div>
              <p style={{ fontSize: '14px', color: 'rgb(114, 114, 110)', marginBottom: '12px', fontWeight: 500 }}>Product</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#features" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Features</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Pricing</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>For Educators</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>For Administrators</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Explore more...</a>
              </div>
            </div>

            {/* Column 3 — Company */}
            <div>
              <p style={{ fontSize: '14px', color: 'rgb(114, 114, 110)', marginBottom: '12px', fontWeight: 500 }}>Company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>About</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Careers</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Press</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Research</a>
              </div>
            </div>

            {/* Column 4 — Resources */}
            <div>
              <p style={{ fontSize: '14px', color: 'rgb(114, 114, 110)', marginBottom: '12px', fontWeight: 500 }}>Resources</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Blog</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Help Center</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Contact us</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Terms</a>
                <a href="#" style={{ fontSize: '14px', color: '#292929', textDecoration: 'none' }}>Privacy</a>
              </div>
            </div>
          </div>

          {/* Bottom row: socials + copyright */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" style={{ color: '#292929', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* X / Twitter */}
              <a href="#" aria-label="X" style={{ color: '#292929', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" style={{ color: '#292929', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>

            {/* Copyright */}
            <p style={{ fontSize: '14px', color: 'rgb(114, 114, 110)', margin: 0 }}>
              © RIN, Inc. 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
