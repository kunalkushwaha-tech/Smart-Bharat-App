import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "./components/RegisterServiceWorker";

const siteDescription = "Sovereign AI civic services, cyber safety, complaints, and awareness dashboard.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Bharat App - Civic & Cyber Dashboard",
  description: siteDescription,
  manifest: "/manifest.json",
  openGraph: {
    title: "Bharat App - Civic & Cyber Dashboard",
    description: "One Platform for Cyber Safety & Citizen Services",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Bharat App - Cyber Safety and Citizen Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat App - Civic & Cyber Dashboard",
    description: "One Platform for Cyber Safety & Citizen Services",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bharat App",
              url: "https://smartbharat.me",
              founder: {
                "@type": "Person",
                name: "Kunal Kushwaha",
              },
              description: siteDescription,
              sameAs: ["https://github.com/kunalkushwaha-tech"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Bharat App",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Web",
              description: siteDescription,
            }),
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", function () {
                  navigator.serviceWorker.register("/sw.js").catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
