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
    "The intelligent OS for education. Combining data, predictive analytics, and AI workflows to give educators superpowers.",
  keywords: [
    "AI",
    "education",
    "student risk",
    "explainable AI",
    "decision transparency",
    "education OS",
    "predictive analytics",
  ],
  openGraph: {
    title: "RIN — Responsible Insight Navigator",
    description: "The intelligent OS for education. Combining data, predictive analytics, and AI workflows to give educators superpowers.",
    images: ["/platform-preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RIN — Responsible Insight Navigator",
    description: "The intelligent OS for education. Combining data, predictive analytics, and AI workflows to give educators superpowers.",
    images: ["/platform-preview.png"],
    creator: "@withrin",
  },
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
