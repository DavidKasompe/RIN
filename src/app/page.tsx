'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useSession } from '@/lib/auth-client';

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
  const { data: session, isPending } = useSession();

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
        className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-500 ${
          scrolled ? 'p-0 md:py-3 md:px-5' : 'p-3 md:py-3.5 md:px-7'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? 'max-w-[860px] gap-4 md:gap-10 rounded-none md:rounded-full bg-[#FAF3EC]/90 backdrop-blur-xl shadow-sm py-3 px-5 md:px-7'
              : 'max-w-[1120px] gap-4 md:gap-10 bg-transparent py-0 px-0'
          }`}
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
                { label: 'Integrations', href: '#integrations' },
                { label: 'Pricing', href: '#pricing' },
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
            {!isPending && session ? (
              <Link
                href="/dashboard"
                className="hidden md:block"
                style={{ textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'white', backgroundColor: '#800532', borderRadius: 9999, padding: '10px 20px', letterSpacing: '-0.4px' }}
              >
                Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
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
            {[{ label: 'Features', href: '#features' }, { label: 'Integrations', href: '#integrations' }, { label: 'Pricing', href: '#pricing' }].map(item => (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#230603', fontSize: 14, fontWeight: 500, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{item.label}</a>
            ))}
            {!isPending && session ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 10, padding: '12px', borderRadius: 9999, backgroundColor: '#800532', color: 'white', fontSize: 14, fontWeight: 600 }}>Dashboard</Link>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#230603', fontSize: 14, fontWeight: 500, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Sign In</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 10, padding: '12px', borderRadius: 9999, backgroundColor: '#800532', color: 'white', fontSize: 14, fontWeight: 600 }}>Start Free</Link>
              </>
            )}
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
          <div className="flex flex-col sm:flex-row justify-center items-center" style={{ gap: 12 }}>
            {!isPending && session ? (
              <Link href="/dashboard" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: 'white', color: '#800532', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: 'white', color: '#800532', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
                Get Started Free
              </Link>
            )}
            <a href="#features" style={{ textDecoration: 'none', fontWeight: 500, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px', backdropFilter: 'blur(4px)' }}>
              See How It Works
            </a>
          </div>
        </div>


      </section>

      {/* ════════════════════════════════════════════════════════════════
          PLATFORM PREVIEW
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#FAF3EC', paddingTop: 72, paddingBottom: 80, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 28px' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(128,5,50,0.5)', margin: '0 0 28px' }}>
            Meet RIN
          </p>
          <div style={{
            borderRadius: 20,
            border: '3px solid rgba(128,5,50,0.15)',
            overflow: 'hidden',
            boxShadow: '0 8px 24px -8px rgba(35,6,3,0.06)',
          }}>
            <img
              src="/platform-preview.png"
              alt="RIN platform preview — AI chat interface with integrations"
              style={{ width: '100%', display: 'block' }}
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ backgroundColor: '#F8E8CA', borderRadius: 21, overflow: 'hidden' }}>
              <div className="flex flex-col justify-end gap-4 p-8 sm:p-12 lg:p-14">
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
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 28, marginBottom: 28 }}>
            <div style={{ backgroundColor: '#E6EAF1', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={PX.f2} alt="AI Assessment" className="w-full h-64 object-cover block" />
              <div className="p-8 sm:p-11">
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>AI Risk Assessment</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Select any student and run a structured AI analysis. Get a risk score (0–100), contributing factors, and a plain-language summary grounded in their actual data.</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#E8E2ED', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={PX.f3} alt="Intervention Plans" className="w-full h-64 object-cover block" />
              <div className="p-8 sm:p-11">
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Intervention Plans</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Every at-risk assessment automatically generates a prioritized list of concrete interventions — ranked by impact and tailored to the student.</p>
              </div>
            </div>
          </div>

          {/* Row 3 – Burgundy pull-quote */}
          <div className="flex flex-col md:flex-row" style={{ backgroundColor: '#800532', borderRadius: 28, overflow: 'hidden', marginBottom: 28 }}>
            <div className="w-full md:w-[32%] flex items-end overflow-hidden">
              <img src="https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=600" alt="School Campus" className="object-cover w-full md:w-[130%] h-[300px] md:h-[400px]" />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-8 p-8 md:p-14 text-white">
              <p style={{ margin: 0, fontSize: 22, fontWeight: 400, lineHeight: 1.5, letterSpacing: '-0.4px' }}>
                Finally — a tool that analyzes attendance, grades, and behavior together and tells me which student needs me most. RIN is giving educators exactly what we&apos;ve been missing.
              </p>
            </div>
          </div>

          {/* Row 4 – Class Analytics + Parent Report */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 28, marginBottom: 28 }}>
            <div style={{ backgroundColor: '#F6E1E6', borderRadius: 22, overflow: 'hidden' }}>
              <img src={PX.f4} alt="Class Analytics" className="w-full h-60 object-cover block" />
              <div className="p-8 sm:p-11">
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Class Analytics</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>See risk distribution, top contributing factors, and improvement trends across your entire student roster at a glance.</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#E0E4CA', borderRadius: 22, overflow: 'hidden' }}>
              <img src={PX.f5} alt="Parent Report Generator" className="w-full h-60 object-cover block" />
              <div className="p-8 sm:p-11">
                <h4 style={{ color: '#272727', fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 14px' }}>Parent Report Generator</h4>
                <p style={{ color: '#6b6b6b', fontSize: 17, lineHeight: 1.6, margin: 0 }}>Generate clear, empathetic parent letters from any risk analysis — automatically formatted and ready to send.</p>
              </div>
            </div>
          </div>

          {/* Row 5 – See RIN in Action (video right, copy left) */}
          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-2" style={{ borderRadius: 21, overflow: 'hidden', backgroundColor: '#230603' }}>
            {/* Left copy */}
            <div className="flex flex-col justify-center gap-6 p-8 md:p-14 text-white">
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
          INTEGRATIONS
      ════════════════════════════════════════════════════════════════ */}
      <section id="integrations" style={{ backgroundColor: 'white', paddingTop: 120, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ color: '#800532', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Integrations</p>
            <h2 style={{ color: '#230603', fontSize: 42, fontWeight: 400, letterSpacing: '-2px', margin: '0 0 18px', lineHeight: 1.15 }}>
              Connects with the tools{' '}
              <span style={{ color: '#aa6b76' }}>your school already uses.</span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(35,6,3,0.55)', margin: 0, maxWidth: 640, marginInline: 'auto', lineHeight: 1.55 }}>
              RIN plugs directly into your school&apos;s existing ecosystem — email, calendars, learning platforms, spreadsheets, and team chat. No migration needed.
            </p>
          </div>

          {/* Integration categories — 2×2 grid with larger logos */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginBottom: 48 }}>
            {[
              {
                cat: 'Communication & Calendar',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800532" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
                tools: [
                  { name: 'Gmail', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' },
                  { name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
                  { name: 'Microsoft Teams', logo: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=128' },
                  { name: 'Outlook', logo: 'https://www.google.com/s2/favicons?domain=outlook.live.com&sz=128' },
                  { name: 'Google Calendar', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
                ],
              },
              {
                cat: 'LMS & Classroom',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800532" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
                tools: [
                  { name: 'Google Classroom', logo: 'https://www.gstatic.com/classroom/logo_square_rounded.svg' },
                  { name: 'Canvas LMS', logo: 'https://www.google.com/s2/favicons?domain=instructure.com&sz=128' },
                ],
              },
              {
                cat: 'Data & Reports',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800532" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
                tools: [
                  { name: 'Google Sheets', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg' },
                  { name: 'Microsoft Excel', iconify: 'vscode-icons:file-type-excel' },
                ],
              },
              {
                cat: 'Documents & Storage',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800532" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
                tools: [
                  { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
                  { name: 'Google Drive', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
                ],
              },
            ].map(group => (
              <div key={group.cat} style={{ backgroundColor: '#FAF3EC', borderRadius: 20, padding: '36px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(128,5,50,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {group.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(35,6,3,0.5)' }}>{group.cat}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {group.tools.map(tool => (
                    <div key={tool.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {(tool as any).iconify
                        ? <Icon icon={(tool as any).iconify} width={36} height={36} style={{ flexShrink: 0 }} />
                        : <img src={tool.logo} alt={tool.name} width={36} height={36} style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 6 }} />
                      }
                      <span style={{ fontSize: 16, fontWeight: 500, color: '#230603' }}>{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: '#800532', color: 'white', padding: '14px 28px', fontSize: 14, letterSpacing: '-0.5px' }}>
              Connect Your Tools — Free
            </Link>
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
              Built for schools.<br />Start free, scale when ready.
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(35,6,3,0.55)', margin: 0, maxWidth: 640, marginInline: 'auto', lineHeight: 1.5 }}>
              No credit card required. Every plan includes AI risk intelligence, 11 integrations, and unlimited student records.
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
              <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: '0 0 24px' }}>For individual schools and counselor intervention teams.</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#230603', letterSpacing: '-2px' }}>$249</span>
                <span style={{ fontSize: 15, color: 'rgba(35,6,3,0.5)', fontWeight: 500 }}> /school /mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Unlimited educators & administrators',
                  'AI risk analysis with conversational chat UI',
                  'Intervention plans, logging & history tracking',
                  'Gmail, Google Calendar & Slack integrations',
                  'Google Sheets & Drive data export',
                  'Custom workflow automations',
                  'SMS & email parent alerts',
                  'Report & slide deck generator',
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
              <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: '0 0 24px' }}>For large districts requiring SIS sync, compliance tools, and Microsoft ecosystem support.</p>
              <div style={{ marginBottom: 32, height: 56, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#230603', letterSpacing: '-1.5px' }}>Custom</span>
                <span style={{ fontSize: 15, color: 'rgba(35,6,3,0.5)', fontWeight: 500, marginLeft: 8 }}>per student pricing</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Everything in School Team, plus:',
                  'Microsoft Teams, Outlook & Excel integrations',
                  'Direct SIS/LMS sync (PowerSchool, Canvas)',
                  'Notion workspace for intervention docs',
                  'FERPA-compliant bulk data export',
                  'District-wide analytics & cohort heatmaps',
                  'SSO & role-based access control',
                  'Dedicated success manager & onboarding',
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
          {!isPending && session ? (
            <Link href="/dashboard" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: '#800532', color: 'white', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/signup" style={{ textDecoration: 'none', fontWeight: 600, borderRadius: 9999, backgroundColor: '#800532', color: 'white', padding: '15px 32px', fontSize: 14, letterSpacing: '-0.5px' }}>
              Start Free Trial
            </Link>
          )}
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
                { label: 'Integrations', href: '#integrations' },
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
