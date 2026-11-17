import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "./components/RegisterServiceWorker";

const siteDescription = "Free cyber-safety tools, emergency helplines, a government scheme finder and fraud-awareness quiz for Indian citizens. Not affiliated with any government agency.";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.smartbharat.me"),
  title: "Bharat App - Civic & Cyber Dashboard",
  description: siteDescription,
  manifest: "/manifest.json",
  openGraph: {
    title: "Bharat App - Civic & Cyber Dashboard",
    description: siteDescription,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bharat App - Cyber Safety and Citizen Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat App - Civic & Cyber Dashboard",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${devanagari.variable} h-full antialiased`}
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
      </head>
      <body className="min-h-full flex flex-col">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
