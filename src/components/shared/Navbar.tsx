'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Outer padding area */}
      <div className="flex justify-center px-4 sm:px-6 pt-5 pb-2">
        {/* Floating pill container */}
        <div
          className="flex items-center justify-between gap-1 w-full max-w-4xl px-5 sm:px-6 py-2.5 rounded-full bg-white"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <img
              src="/RIN-Logo.png"
              alt="RIN"
              style={{ height: '64px', objectFit: 'contain' }}
            />
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-0">
            {isDashboard ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-1.5 rounded-full text-sm font-medium select-none transition-all duration-150 no-underline border-[0.8px] border-transparent ${
                    isActive('/dashboard') 
                      ? 'text-[#292929] border-[rgba(0,0,0,0.05)]' 
                      : 'text-[#72726e] hover:text-[#292929]'
                  }`}
                >
                  Analyze
                </Link>
                <Link 
                  href="/dashboard/overview" 
                  className={`px-3 py-1.5 rounded-full text-sm font-medium select-none transition-all duration-150 no-underline border-[0.8px] border-transparent ${
                    pathname?.startsWith('/dashboard/overview')
                      ? 'text-[#292929] border-[rgba(0,0,0,0.05)]' 
                      : 'text-[#72726e] hover:text-[#292929]'
                  }`}
                >
                  Overview
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="#features" 
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-[#72726e] hover:text-[#292929] select-none transition-all duration-150 no-underline border-[0.8px] border-transparent"
                >
                  Features
                </Link>
                <Link 
                  href="#about" 
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-[#72726e] hover:text-[#292929] select-none transition-all duration-150 no-underline border-[0.8px] border-transparent"
                >
                  About
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-0 flex-shrink-0">
            {isDashboard ? (
              <Link 
                href="/"
                className="px-3 py-1.5 rounded-full text-sm font-medium text-[#72726e] hover:text-[#292929] select-none transition-all duration-150 no-underline border-[0.8px] border-transparent"
              >
                Sign Out
              </Link>
            ) : (
              <>
                <Link 
                  href="/signin"
                  className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full text-sm font-medium text-[#292929] select-none transition-all duration-150 no-underline border-[0.8px] border-[rgba(0,0,0,0.05)] hover:border-[rgba(0,0,0,0.15)]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Sign In</span>
                </Link>
              </>
            )}

            {/* Hamburger (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#292929]"
              aria-label="Toggle menu"
              style={{ background: 'none', border: 'none' }}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - drops below the pill */}
      {mobileMenuOpen && (
        <div className="md:hidden flex justify-center px-4 sm:px-6">
          <div className="w-full max-w-3xl bg-white border border-[#d5d5d2] rounded-xl p-2 animate-fade-in" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            {isDashboard ? (
              <>
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline ${
                    isActive('/dashboard') ? 'bg-[#f5f5f5] text-[#292929]' : 'text-[#72726e] hover:bg-[#f5f5f5]'
                  }`}
                >
                  🎯 Analyze Student
                </Link>
                <Link 
                  href="/dashboard/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline ${
                    pathname?.startsWith('/dashboard/overview') ? 'bg-[#f5f5f5] text-[#292929]' : 'text-[#72726e] hover:bg-[#f5f5f5]'
                  }`}
                >
                  📊 Overview
                </Link>
                <div className="border-t border-[#e3e3e3] my-1.5" />
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#72726e] hover:bg-[#f5f5f5] transition-all duration-150 no-underline"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#72726e] hover:bg-[#f5f5f5] transition-all duration-150 no-underline">
                  Features
                </Link>
                <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#72726e] hover:bg-[#f5f5f5] transition-all duration-150 no-underline">
                  About
                </Link>
                <div className="border-t border-[#e3e3e3] my-1.5" />
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#72726e] hover:bg-[#f5f5f5] transition-all duration-150 no-underline">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#292929] bg-[#f5f5f5] hover:bg-[#ebebeb] transition-all duration-150 no-underline text-center mt-1">
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
