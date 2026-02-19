'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────
   Pexels CDN video URLs (direct .mp4 from their files CDN — no auth needed)
   IDs confirmed working:
   • 3209828  – students writing at desks (wide classroom)
   • 7710181  – teacher walking around helping students
   • 5198705  – children learning in class
   • 8471745  – diverse high-school students in hallway
   • 4116208  – teacher at whiteboard with class
───────────────────────────────────────────────────────────────────────── */
/* Reliable free MP4s — served from Pixabay CDN, small file sizes, no auth */
const HERO_VIDEO = '/videos/rin-video-hero.mp4';
/* High-quality Pexels images */
const PX = {
  // Feature cards
  f1: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=1200',
  f2: 'https://images.pexels.com/photos/5926389/pexels-photo-5926389.jpeg?auto=compress&cs=tinysrgb&w=1200',
  f3: 'https://images.pexels.com/photos/4778621/pexels-photo-4778621.jpeg?auto=compress&cs=tinysrgb&w=1200',
  f4: 'https://images.pexels.com/photos/7407766/pexels-photo-7407766.jpeg?auto=compress&cs=tinysrgb&w=1200',
  f5: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  // Testimonial feature
  feat: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=600',
  // Avatars
  t1: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  t2: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  t3: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
  t4: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  t5: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=200',
  t6: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const SCHOOLS = [
  'Lincoln Unified School District', 'Riverside Charter K–12', 'Northside Elementary',
  'Madison Middle School', 'Jefferson High School', 'Sunrise Academy',
  'Parkview K–8', 'Westfield USD', 'Cedar Grove School', 'Clearwater District',
];

const TESTIMONIALS = [
  { avatar: PX.t1, name: 'Maria Santos', role: '8th Grade English Teacher', quote: '"Every at-risk student I hadn\'t noticed showed up in RIN within a week. I\'ve never had a tool flag concerns this early."', dark: false },
  { avatar: PX.t2, name: 'James Okafor', role: 'School Counselor, Lincoln Unified', quote: '"The intervention plans are exactly what I needed — specific, actionable, and tied directly to each student\'s actual data. Not guesses."', dark: true },
  { avatar: PX.t3, name: 'Priya Nair', role: 'Grade 10 Math Teacher', quote: '"Adding 28 students took about 5 minutes. Running full class analytics was instant."', dark: true },
  { avatar: PX.t4, name: 'Diane Foster', role: 'Academic Dean, Madison Middle', quote: '"The parent report generator alone is worth it. What used to take me 45 minutes per student now takes one click."', dark: false },
  { avatar: PX.t5, name: 'Carlos Reyes', role: '6th Grade Science Teacher', quote: '"I finally have a way to show administration concrete risk data, not just gut feelings. RIN gives me the receipts."', dark: true },
  { avatar: PX.t6, name: 'Ayasha Morningstar', role: 'Special Ed Coordinator, K–8', quote: '"Works perfectly alongside IEP data. I use the tags to group students and the AI picks up on patterns I miss."', dark: false },
  { avatar: PX.t1, name: 'Robert Chen', role: 'Grade 9 History Teacher', quote: '"RIN\'s early warning system caught a student sliding from Bs to Ds across three weeks. We intervened early enough to turn it around."', dark: false },
  { avatar: PX.t3, name: 'Nkechi Adeyemi', role: 'Attendance Counselor', quote: '"Our school was flagging absenteeism manually. Now RIN surfaces it automatically with context. This is the tool we\'ve been waiting for."', dark: true },
  { avatar: PX.t2, name: 'Linda Marsh', role: 'High School Vice Principal', quote: '"The class-wide radar chart made our Q3 review meeting half as long. Game changer for the whole team."', dark: false },
];

/* ── RIN Wordmark — clean Inter/sans ───────────────────────────────────── */
function RinWordmark({ size = 28, color = '#800532' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
        fontSize: size,
        fontWeight: 800,
        color,
        letterSpacing: '-1.5px',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      RIN
    </span>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#FAF3EC', overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════════ */}
      {/* ── NAVBAR — header is always transparent; only the pill has a bg ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'transparent',
          transition: 'padding 0.45s ease',
          padding: scrolled ? '12px 20px' : '14px 28px',
        }}
      >
        <div
          style={{
            maxWidth: scrolled ? 860 : 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40,
            /* When scrolled, wrap whole bar in a glass pill */
            borderRadius: scrolled ? 9999 : 0,
            backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
            backgroundColor: scrolled ? 'rgba(250,243,236,0.82)' : 'transparent',
            boxShadow: scrolled ? '0 4px 24px rgba(128,5,50,0.1), 0 1px 4px rgba(0,0,0,0.04)' : 'none',
            padding: scrolled ? '11px 28px' : '0',
            transition: 'max-width 0.45s ease, border-radius 0.45s ease, backdrop-filter 0.45s ease, background-color 0.45s ease, box-shadow 0.45s ease, padding 0.45s ease',
          }}
        >
          {/* Logo — white on hero, burgundy once scrolled */}
          <Link href="/" style={{ textDecoration: 'none', flex: '1 1 0' }}>
            <RinWordmark size={26} color={scrolled ? '#800532' : 'white'} />
          </Link>

          {/* Center pill — always white bg, always dark text */}
          <nav className="hidden md:flex" style={{ flex: '0 0 auto' }}>
            <div style={{
              display: 'flex', gap: 4, borderRadius: 9999,
              padding: '8px 12px',
              backgroundColor: 'white',
              boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
            }}>
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it Works', href: '#how-it-works' },
                { label: 'Educators', href: '#testimonials' },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{ textDecoration: 'none', color: '#230603', fontSize: 14, fontWeight: 500, borderRadius: 9999, padding: '7px 13px', transition: 'background 0.18s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,5,50,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* CTAs — white text on hero, branded once scrolled */}
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
            <Link
              href="/signin"
              className="hidden md:block"
              style={{ textDecoration: 'none', fontSize: 14, fontWeight: 500, color: scrolled ? '#800532' : 'rgba(255,255,255,0.9)', transition: 'color 0.35s ease' }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hidden md:block"
              style={{ textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'white', backgroundColor: '#800532', borderRadius: 9999, padding: '10px 20px', letterSpacing: '-0.4px' }}
            >
              Start Free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              aria-label="menu"
            >
              <svg width="22" height="22" fill="none" stroke={scrolled ? '#230603' : 'white'} strokeWidth={2} strokeLinecap="round">
                {mobileOpen
                  ? <><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></>
                  : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu — solid cream drop-down */}
        {mobileOpen && (
          <div style={{ maxWidth: 1120, margin: '8px auto 0', borderRadius: 16, backgroundColor: 'rgba(250,243,236,0.96)', backdropFilter: 'blur(16px)', padding: '12px 24px 18px' }}>
            {[{ label: 'Features', href: '#features' }, { label: 'How it Works', href: '#how-it-works' }, { label: 'Educators', href: '#testimonials' }, { label: 'Sign In', href: '/signin' }].map(item => (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#230603', fontSize: 14, fontWeight: 500, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{item.label}</a>
            ))}
            <Link href="/signup" onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 10, padding: '12px', borderRadius: 9999, backgroundColor: '#800532', color: 'white', fontSize: 14, fontWeight: 600 }}>Start Free</Link>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════
          HERO — full-bleed video background
      ════════════════════════════════════════════════════════════════ */}
      {/* Hero starts at top:0, sits behind transparent nav */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 0 }}>
        {/* Video */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Dark + burgundy gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(35,6,3,0.55) 0%, rgba(128,5,50,0.45) 60%, rgba(35,6,3,0.75) 100%)' }} />

        {/* Copy */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 28px', maxWidth: 760, margin: '0 auto' }}>
          <h1
            style={{
              color: 'white',
              fontSize: 'clamp(38px, 6vw, 62px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-3px',
              margin: '0 0 24px',
              textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            }}
          >
            Know which students need help —{' '}
            <span style={{ color: '#f9c8d5' }}>before it&apos;s too late.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 20, lineHeight: 1.55, margin: '0 0 36px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
            RIN gives K–12 teachers and counselors a real-time early warning dashboard. Track grades, attendance, and behavior — and get AI-powered risk alerts before any student falls through the cracks.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: 'white', color: '#800532', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
              Get Started Free
            </Link>
            <a href="#features" style={{ textDecoration: 'none', fontWeight: 500, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px', backdropFilter: 'blur(4px)' }}>
              See How It Works
            </a>
          </div>
        </div>


      </section>

      {/* ════════════════════════════════════════════════════════════════
          SCHOOL MARQUEE — prominent trust bar
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#FAF3EC', borderTop: '1px solid rgba(128,5,50,0.08)', borderBottom: '1px solid rgba(128,5,50,0.08)', overflow: 'hidden', paddingTop: 48, paddingBottom: 52 }}>
        {/* Bold headline */}
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(128,5,50,0.55)', margin: '0 0 32px' }}>
          Trusted by educators at
        </p>
        {/* Large school name strip */}
        <div style={{ display: 'flex', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
          <div className="animate-marquee" style={{ display: 'flex', gap: 64, whiteSpace: 'nowrap', alignItems: 'center', flexShrink: 0 }}>
            {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(35,6,3,0.65)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.3px' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#800532', opacity: 0.45, flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          FEATURES BENTO
      ════════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ backgroundColor: '#FBF7F5', paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>

          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ color: '#800532', fontSize: 35, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.84px', margin: 0, maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>
              A platform that puts students first to drive{' '}
              <span style={{ color: '#aa6b76' }}>insight</span>,{' '}
              <span style={{ color: '#aa6b76' }}>action</span>, &{' '}
              <span style={{ color: '#aa6b76' }}>impact</span>.
            </h2>
          </div>

          {/* Row 1 – Student Roster full-width */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ backgroundColor: '#F8E8CA', borderRadius: 21, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '48px 0 48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 16 }}>
                <span style={{ display: 'inline-block', backgroundColor: '#230603', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, alignSelf: 'flex-start', letterSpacing: '0.04em' }}>New</span>
                <h4 style={{ color: '#272727', fontSize: 31.5, fontWeight: 600, lineHeight: 1.2, margin: 0 }}>Student Roster</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Add your K–12 students manually or import a CSV. All attendance, GPA, and behavior data in one searchable, sortable table.</p>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <img src={PX.f1} alt="Student roster" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          </div>

          {/* Row 2 – AI Assessment + Intervention Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
            <div style={{ backgroundColor: '#E6EAF1', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={PX.f2} alt="AI Assessment" style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '36px 44px 44px' }}>
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>AI Risk Assessment</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Select any student and run a structured AI analysis. Get a risk score (0–100), contributing factors, and a plain-language summary grounded in their actual data.</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#E8E2ED', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={PX.f3} alt="Intervention Plans" style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '36px 44px 44px' }}>
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Intervention Plans</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Every at-risk assessment automatically generates a prioritized list of concrete interventions — ranked by impact and tailored to the student.</p>
              </div>
            </div>
          </div>

          {/* Row 3 – Burgundy pull-quote */}
          <div style={{ backgroundColor: '#800532', borderRadius: 28, overflow: 'hidden', display: 'flex', marginBottom: 28 }}>
            <div style={{ width: '32%', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
              <img src={PX.feat} alt="Educator" style={{ objectFit: 'cover', width: '130%', height: 400 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, padding: '56px 72px 44px 60px', color: 'white' }}>
              <blockquote style={{ margin: 0, fontSize: 22, fontWeight: 400, lineHeight: 1.5, letterSpacing: '-0.4px' }}>
                "Finally — a tool that analyzes attendance, grades, and behavior together and tells me which student needs me most. RIN is giving educators exactly what we&apos;ve been missing."
              </blockquote>
              <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.75 }}>
                — Maria Santos, 8th Grade English Teacher, Lincoln USD
              </div>
            </div>
          </div>

          {/* Row 4 – Class Analytics + Parent Report */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
            <div style={{ backgroundColor: '#F6E1E6', borderRadius: 22, overflow: 'hidden' }}>
              <img src={PX.f4} alt="Class Analytics" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '36px 44px 44px' }}>
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Class Analytics</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>See risk distribution, top contributing factors, and improvement trends across your entire student roster at a glance.</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#E0E4CA', borderRadius: 22, overflow: 'hidden' }}>
              <img src={PX.f5} alt="Parent Report Generator" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '36px 44px 44px' }}>
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Parent Report Generator</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Generate clear, empathetic parent letters from any risk analysis — automatically formatted and ready to send.</p>
              </div>
            </div>
          </div>

          {/* Row 5 – See RIN in Action (video right, copy left) */}
          <div id="how-it-works" style={{ borderRadius: 21, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#230603' }}>
            {/* Left copy */}
            <div style={{ padding: '56px 56px 56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, color: 'white' }}>
              <h4 style={{ color: 'white', fontSize: 31.5, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>See RIN in Action</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, margin: 0, lineHeight: 1.6 }}>
                Watch how educators add their K–12 students, run an AI risk assessment, and get an intervention plan — all in under 3 minutes.
              </p>
              <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: '#800532', color: 'white', padding: '14px 28px', fontSize: 14, letterSpacing: '-0.5px', alignSelf: 'flex-start' }}>
                Try It Free
              </Link>
            </div>
            {/* Right image */}
            <div style={{ position: 'relative', minHeight: 360, overflow: 'hidden' }}>
              <img
                src="https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Educator reviewing student data"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Subtle left-edge overlay so it blends into the dark card */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(35,6,3,0.55) 0%, transparent 45%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" style={{ backgroundColor: '#FBF7F5', paddingTop: 52, paddingBottom: 52 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ columnCount: 3, columnGap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ breakInside: 'avoid', display: 'inline-block', width: '100%', marginBottom: 18, borderRadius: 12, padding: '32px 28px', backgroundColor: t.dark ? '#800532' : '#F2E6EA' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ borderRadius: '50%', width: 44, height: 44, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={t.avatar} alt={t.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                    <div style={{ color: t.dark ? 'rgba(255,255,255,0.75)' : '#800532', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.5 }}>
                      {t.name}<br />{t.role}
                    </div>
                  </div>
                  <blockquote style={{ margin: 0, color: t.dark ? 'white' : '#600426', fontSize: 17, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.4px' }}>
                    {t.quote}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ backgroundColor: 'white', paddingTop: 140, paddingBottom: 140 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#800532', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ color: '#230603', fontSize: 48, fontWeight: 700, letterSpacing: '-2px', margin: '0 0 16px', lineHeight: 1.1 }}>
              Team-focused pricing.<br />Try free for 7 days.
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(35,6,3,0.55)', margin: 0, maxWidth: 600, marginInline: 'auto', lineHeight: 1.5 }}>
              No credit card required. Upgrade when you&apos;re ready to bring your whole school onto the platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'center' }}>

            {/* Tier 1: School Team */}
            <div style={{
              backgroundColor: '#fff', border: '1px solid rgba(128,5,50,0.15)', borderRadius: 24, padding: 48,
              boxShadow: '0 12px 24px -8px rgba(35,6,3,0.05)', position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#800532', color: 'white', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 16px', borderRadius: 9999 }}>
                Most Popular
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: '0 0 8px' }}>School Team</h3>
              <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: '0 0 24px' }}>Perfect for individual schools and intervention teams.</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#230603', letterSpacing: '-2px' }}>$249</span>
                <span style={{ fontSize: 15, color: 'rgba(35,6,3,0.5)', fontWeight: 500 }}> /school /mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Unlimited educators & administrators',
                  'Full AI risk analysis & conversational UI',
                  'Intervention logging & history',
                  'Google Calendar bi-directional sync',
                  'Automated parent email alerts',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15, color: '#230603', lineHeight: 1.4 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800532" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontWeight: 600, borderRadius: 12, backgroundColor: '#800532', color: 'white', padding: '16px', fontSize: 15, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Start 7-day free trial
              </Link>
            </div>

            {/* Tier 2: District */}
            <div style={{
              backgroundColor: '#FAF3EC', borderRadius: 24, padding: 48, border: '1px solid transparent'
            }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: '0 0 8px' }}>District Enterprise</h3>
              <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: '0 0 24px' }}>For large districts requiring SIS sync and compliance tools.</p>
              <div style={{ marginBottom: 32, height: 56, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#230603', letterSpacing: '-1.5px' }}>Custom</span>
                <span style={{ fontSize: 15, color: 'rgba(35,6,3,0.5)', fontWeight: 500, marginLeft: 8 }}>per student pricing</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Everything in School Team, plus:',
                  'Direct SIS/LMS integrations (PowerSchool, Canvas)',
                  'FERPA-compliant bulk data export',
                  'District-wide analytics & cohort heatmaps',
                  'Dedicated success manager',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15, color: '#230603', lineHeight: 1.4 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? 'rgba(35,6,3,0.3)' : '#800532'} strokeWidth={i === 0 ? '2' : '2.5'} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@rin.app" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontWeight: 600, borderRadius: 12, backgroundColor: 'transparent', border: '1.5px solid rgba(128,5,50,0.3)', color: '#800532', padding: '16px', fontSize: 15, transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(128,5,50,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                Contact Sales
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FAF3EC', paddingTop: 120, paddingBottom: 112, textAlign: 'center' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <h2 style={{ color: '#230603', fontSize: 'clamp(44px, 7vw, 64px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-3px', margin: 0 }}>
            Less guessing,<br />more helping.
          </h2>
          <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: '#800532', color: 'white', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER — big wordmark style
      ════════════════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: '#FAF3EC', paddingTop: 56, overflow: 'hidden' }}>

        {/* Top row: tagline left, nav links right */}
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
          {/* Left: tagline */}
          <p style={{ color: '#230603', fontSize: 18, fontWeight: 500, letterSpacing: '-0.4px', margin: 0, lineHeight: 1.4 }}>
            Responsible Insight Navigator.<br />
            <span style={{ color: 'rgba(35,6,3,0.45)', fontSize: 15, fontWeight: 400 }}>For K–12 educators.</span>
          </p>

          {/* Right: two link columns */}
          <div style={{ display: 'flex', gap: 64 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it Works', href: '#how-it-works' },
                { label: 'Educators', href: '#testimonials' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Sign In', href: '/signin' },
                { label: 'Get Started', href: '/signup' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{ textDecoration: 'none', color: 'rgba(35,6,3,0.55)', fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{l.label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Support', href: 'mailto:support@rin.app' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{ textDecoration: 'none', color: 'rgba(35,6,3,0.55)', fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Giant full-bleed wordmark */}
        <div style={{ width: '100%', lineHeight: 0.85, overflow: 'hidden', userSelect: 'none', textAlign: 'center' }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(120px, 22vw, 340px)',
              color: '#800532',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
              textAlign: 'center',
              opacity: 0.92,
            }}
          >
            RIN
          </span>
        </div>

        {/* Bottom bar */}
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '18px 28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RinWordmark size={18} color="rgba(35,6,3,0.5)" />
          </Link>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a href="/privacy" style={{ color: 'rgba(35,6,3,0.4)', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ color: 'rgba(35,6,3,0.4)', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>Terms</a>
            <span style={{ color: 'rgba(35,6,3,0.3)', fontSize: 12 }}>© RIN 2026</span>
          </div>
        </div>
      </footer>
    </div >
  );
}
