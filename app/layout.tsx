import type { Metadata } from "next";
import { inter, instrumentSerif } from "./fonts";
import { Header } from "@/components/layout/Header";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { FeedbackWidget } from "@/components/layout/FeedbackWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://runclubs.es"),
  title: {
    default: "RunClubs.es — Directorio de clubs de running en España",
    template: "%s | RunClubs.es",
  },
  description:
    "Encuentra clubs de running, carreras y eventos deportivos en España. El directorio más completo de running en español.",
  keywords: ["running", "clubs running España", "carreras populares", "correr en grupo"],
  authors: [{ name: "RunClubs.es" }],
  creator: "RunClubs.es",
  publisher: "RunClubs.es",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://runclubs.es",
    siteName: "RunClubs.es",
    title: "RunClubs.es — Directorio de clubs de running en España",
    description:
      "Encuentra clubs de running, carreras y eventos deportivos en España.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunClubs.es",
    description: "El directorio de clubs de running en España.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://runclubs.es" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RunClubs.es",
  url: "https://runclubs.es",
  description: "Directorio de clubs de running en España",
  inLanguage: "es-ES",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://runclubs.es/buscar?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RunClubs.es",
  url: "https://runclubs.es",
  description: "Directorio de clubs de running en España",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <TooltipProvider delayDuration={300}>
          <Header />
          <main className="pt-24">{children}</main>
          <Footer />
          <FeedbackWidget />
          <CookieBanner />
        </TooltipProvider>
      </body>
    </html>
  );
}
