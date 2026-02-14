'use client';

import { useEffect, useRef, useState } from 'react';

/* ── floating icon positions ── */
const FLOATING_ICONS = [
  { img: '/image-icon/vecteezy_minimalist-magnifying-glass-icon-with-blue-handle-3d-render_58144752.png', top: '6%',    left: '3%' },
  { img: '/image-icon/vecteezy_icon-business-3d-statistics-for-web-app-infographic_8525600.png', top: '15%',   left: '82%' },
  { img: '/image-icon/vecteezy_3d-light-bulb_18246162.png', top: '78%',   left: '70%' },
  { img: '/image-icon/vecteezy_a-blue-shield-with-a-white-border-on-a-black-background_65979356.png', top: '28%',   left: '22%' },
  { img: '/image-icon/vecteezy_3d-yellow-lightning-bolt-icon-with-glossy-finish-isolated_72951498.png', top: '3%',    left: '52%' },
  { img: '/image-icon/vecteezy_handshake-people-3d-graphic_45686485.png', top: '50%',   left: '92%' },
  { img: '/image-icon/vecteezy_light-blue-graduation-cap-with-tassel_73049008.png', top: '62%',   left: '4%' },
  { img: '/image-icon/vecteezy_leadership-for-successful-new-idea-excellent-business-graph_8879458.png', top: '42%',   left: '80%' },
  { img: '/image-icon/vecteezy_dramatic-classic-a-brain-human-medically-accurate-high_59623516.png', top: '82%',   left: '25%' },
  { img: '/image-icon/vecteezy_business-goal-3d-icon-illustration-or-business-target-3d_32851403.png', top: '70%',   left: '88%' },
  { img: '/image-icon/vecteezy_3d-clipboard-icon-for-business-isolated-on-clean-background_47308238.png', top: '88%',   left: '50%' },
  { img: '/image-icon/vecteezy_like-or-correct-symbol-confirmed-or-approved-button-check_18842660.png', top: '35%',   left: '6%' },
];

/* ── stats ── */
const STATS = [
  { text: 'Clear Explanations' },
  { text: 'Visual Insights' },
  { text: 'Educator-Focused' },
];

export default function LibrarySection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 → 1 over scroll

  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportH = window.innerHeight;

      // scrolled = how far past the top of the wrapper we've scrolled
      // progress goes from 0 (wrapper top at viewport top) to 1 (wrapper bottom at viewport bottom)
      const scrollable = wrapperHeight - viewportH;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(p);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Divide the progress into phases:
  // 0.00–0.12: label fades in
  // 0.12–0.37: stat 0 slides up
  // 0.37–0.62: stat 1 slides up
  // 0.62–0.87: stat 2 slides up
  // 0.87–1.00: hold (all visible)

  const labelOpacity = Math.min(1, progress / 0.12);
  const labelY = (1 - labelOpacity) * 30;

  const getStatStyle = (index: number) => {
    const start = 0.12 + index * 0.25;
    const end = start + 0.25;
    const p = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    // ease-out quad
    const eased = 1 - Math.pow(1 - p, 2);
    return {
      opacity: eased,
      transform: `translateY(${(1 - eased) * 50}px)`,
    };
  };

  // Icons appear early
  const iconsVisible = progress > 0.05;

  return (
    <div
      ref={wrapperRef}
      style={{
        /* Tall wrapper gives room to scroll through */
        height: '300vh',
        position: 'relative',
      }}
    >
      {/* Sticky inner section that stays pinned while we scroll the wrapper */}
      <section
        id="features"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '0 24px',
          background: '#fff',
        }}
      >
        {/* ── floating icons ── */}
        <div style={{ position: 'absolute', inset: '60px', pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            {FLOATING_ICONS.map((icon, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: icon.top,
                  left: icon.left,
                  opacity: 0.8, // Always visible
                  transform: 'scale(1)', // Always at scale 1
                  animation: `iconFloat${i % 3} ${3.5 + (i % 3) * 0.5}s ease-in-out ${i * 0.25}s infinite`,
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={icon.img}
                    alt=""
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── center text ── */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          {/* Label */}
          <p
            style={{
              fontSize: '24px',
              lineHeight: '30px',
              fontWeight: 650,
              color: '#292929',
              marginBottom: '24px',
              opacity: labelOpacity,
              transform: `translateY(${labelY}px)`,
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            Why Choose RIN?
          </p>

          {/* Stat rows — each slides in one at a time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STATS.map((stat, i) => {
              const s = getStatStyle(i);
              return (
                <div
                  key={i}
                  style={{
                    fontSize: '80px',
                    lineHeight: '80px',
                    letterSpacing: '-0.8px',
                    fontWeight: 650,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    color: 'rgb(41, 41, 41)',
                    opacity: s.opacity,
                    transform: s.transform,
                    WebkitFontSmoothing: 'antialiased',
                  }}
                >
                  {stat.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* keyframes for floating icons */}
        <style>{`
          @keyframes iconFloat0 {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); }
            50% { transform: translateY(-14px) translateX(6px) scale(1); }
          }
          @keyframes iconFloat1 {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); }
            50% { transform: translateY(-10px) translateX(-8px) scale(1); }
          }
          @keyframes iconFloat2 {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); }
            50% { transform: translateY(-18px) translateX(4px) scale(1); }
          }
        `}</style>
      </section>
    </div>
  );
}
