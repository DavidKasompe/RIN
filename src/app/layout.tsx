import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./genui-sdk.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RIN — Responsible Insight Navigator",
  description:
    "AI decisions, explained for humans. Understand student risk predictions with clear, actionable insights.",
  keywords: [
    "AI",
    "education",
    "student risk",
    "explainable AI",
    "decision transparency",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Script id="scroll-reset" strategy="beforeInteractive">{`
          if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
          }
          window.scrollTo(0, 0);
        `}</Script>
        {children}
      </body>
    </html>
  );
}
