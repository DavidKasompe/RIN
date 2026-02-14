'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const STEPS = [
  {
    title: 'Input Student Data',
    description:
      'Seamlessly upload attendance records, academic transcripts, and behavioral metrics in any format — CSV, JSON, or manual entry. RIN intelligently maps your data to its prediction engine in seconds, so you spend zero time on setup and all your time on what matters: your students.',
    step: '01',
  },
  {
    title: 'Get Prediction',
    description:
      'Within moments, receive a comprehensive AI-powered risk assessment complete with a confidence score and multi-dimensional analysis. Our advanced model cross-references attendance patterns, grade trajectories, participation trends, and behavioral signals to surface risks that human analysis alone might miss.',
    step: '02',
  },
  {
    title: 'Understand Why',
    description:
      'Go beyond the score. RIN delivers transparent, explainable breakdowns of every contributing factor — from declining assignment completion to social disengagement — alongside personalized, evidence-based intervention strategies that empower educators to act decisively and early.',
    step: '03',
  },
];

export default function HowItWorksCarousel() {
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ── sync active dot with scroll position ── */
  const handleScroll = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return;
    const scrollLeft = ul.scrollLeft;
    const width = ul.clientWidth;
    const idx = Math.round(scrollLeft / width);
    setActiveIndex(Math.min(idx, STEPS.length - 1));
  }, []);

  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    ul.addEventListener('scroll', handleScroll, { passive: true });
    return () => ul.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (index: number) => {
    const ul = listRef.current;
    if (!ul) return;
    const clamped = Math.max(0, Math.min(index, STEPS.length - 1));
    ul.scrollTo({ left: clamped * ul.clientWidth, behavior: 'smooth' });
  };

  return (
    <section
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '80px 0 60px',
        position: 'relative',
        overflow: 'hidden',
        background: '#fafafa',
      }}
    >
      {/* Heading */}
      <h2
        style={{
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          fontWeight: 400,
          fontSize: '68px',
          lineHeight: '74.8px',
          textAlign: 'center',
          color: '#292929',
          margin: 0,
          textWrap: 'balance',
        }}
      >
        How It Works
      </h2>

      {/* Carousel wrapper — 70% width like IKI */}
      <div
        style={{
          width: '70%',
          position: 'relative',
          overflow: 'hidden',
          padding: '20px 50px 20px 20px',
        }}
      >
        {/* Slides list */}
        <ul
          ref={listRef}
          style={{
            padding: 0,
            margin: 0,
            listStyle: 'none',
            display: 'flex',
            width: '100%',
            height: '100%',
            gap: '10px',
            alignItems: 'flex-start',
            flexDirection: 'row',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {STEPS.map((item, i) => (
            <li
              key={i}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  minHeight: '280px',
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Description */}
                <div style={{ width: '100%' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontWeight: 300,
                      fontSize: '32px',
                      lineHeight: '38.4px',
                      textAlign: 'left',
                      color: '#292929',
                      margin: 0,
                      textWrap: 'wrap',
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Title — right aligned */}
                <div style={{ width: '100%' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontWeight: 300,
                      fontSize: '32px',
                      lineHeight: '38.4px',
                      textAlign: 'right',
                      color: '#292929',
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </p>
                </div>

                {/* Step number — right aligned, muted */}
                <div style={{ width: '100%' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontWeight: 400,
                      fontSize: '15px',
                      letterSpacing: '-0.3px',
                      lineHeight: '19.5px',
                      textAlign: 'right',
                      color: 'rgba(0,0,0,0.4)',
                      margin: 0,
                    }}
                  >
                    Step {item.step}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Navigation arrows + dots */}
        <fieldset
          aria-label="Carousel pagination controls"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            border: 0,
            padding: 0,
            margin: 0,
          }}
        >
          {/* Left arrow */}
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollTo(activeIndex - 1)}
            style={{
              border: 'none',
              display: 'grid',
              placeContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '500px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.1)',
              opacity: activeIndex === 0 ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollTo(activeIndex + 1)}
            style={{
              border: 'none',
              display: 'grid',
              placeContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '500px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.1)',
              opacity: activeIndex === STEPS.length - 1 ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: '50%',
              bottom: '-6px',
              transform: 'translateX(-50%)',
              borderRadius: '50px',
              background: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'auto',
              padding: '6px 4px',
              gap: '0px',
            }}
          >
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Scroll to page ${i + 1}`}
                onClick={() => scrollTo(i)}
                style={{
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '6px 5px',
                  margin: 0,
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#292929',
                    opacity: i === activeIndex ? 1 : 0.4,
                    transition: 'opacity 0.2s',
                  }}
                />
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        ul::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
