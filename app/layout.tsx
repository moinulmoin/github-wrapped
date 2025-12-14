import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./providers/convex";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://github-wrapped.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GitHub Wrapped 2025 - Your Year in Code",
    template: "%s | GitHub Wrapped 2025",
  },
  description:
    "Discover your GitHub journey in 2025. Get personalized insights, stats, and a beautiful summary of your contributions, commits, and coding achievements.",
  keywords: [
    "GitHub Wrapped",
    "GitHub Stats",
    "GitHub Year in Review",
    "Developer Stats",
    "GitHub Contributions",
    "Code Statistics",
    "GitHub 2025",
    "Developer Journey",
    "Open Source Stats",
    "Git Statistics",
  ],
  authors: [
    {
      name: "Moinul Moin",
      url: "https://moinulmoin.com",
    },
  ],
  creator: "Moinul Moin",
  publisher: "GitHub Wrapped",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GitHub Wrapped 2025",
    title: "GitHub Wrapped 2025 - Your Year in Code",
    description:
      "Discover your GitHub journey in 2025. Get personalized insights, stats, and a beautiful summary of your contributions, commits, and coding achievements.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Wrapped 2025 - Your Year in Code",
    description:
      "Discover your GitHub journey in 2025. Get personalized insights, stats, and a beautiful summary of your contributions, commits, and coding achievements.",
    creator: "@moinulmoin",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
        {process.env.NODE_ENV === "production" && (
          <Script
            src="https://umami.moinulmoin.com/script.js"
            data-website-id="bc47fc78-26ba-490b-ab4f-513dccc7f9ac"
            defer
          />
        )}
      </body>
    </html>
  );
}
