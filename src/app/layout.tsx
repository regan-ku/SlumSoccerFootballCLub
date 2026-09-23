import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

// Layout Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/footer"; 

// UI Enhancements
import CookieBanner from "@/components/ui/CookieBanner";
import FloatingActions from "@/components/ui/FloatingActions";
import ScrollProgress from "@/components/ui/ScrollProgress";

// Providers
import { ThemeProvider } from "@/components/providers/ThemeProviders"; // <-- Fixed to singular 'ThemeProvider'
import UTMTracker from "@/components/providers/UTMTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-heading" });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organization")
      .select("name, tagline")
      .limit(1)
      .single();

    return {
      title: data?.name ? `${data.name} | Community & Football` : "Slum Stars FC",
      description: data?.tagline || "Empowering the next generation through football, life skills, and community development.",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
      openGraph: {
        title: data?.name || "Slum Stars FC",
        description: data?.tagline || "Empowering the next generation through football.",
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "Slum Stars FC | Community & Football",
      description: "Empowering the next generation through football, life skills, and community development.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        
        {/* FIXED: Removed invalid props (attribute, enableSystem, etc.) */}
        <ThemeProvider defaultTheme="system" storageKey="slum-stars-theme">
          
          <UTMTracker />

          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded-sm focus:font-bold focus:shadow-lg"
          >
            Skip to main content
          </a>

          <ScrollProgress />
          <Header />
          
          <main id="main-content" className="flex-grow w-full">
            {children}
          </main>
          
          <Footer />
          <FloatingActions />
          <CookieBanner />
          
        </ThemeProvider>
      </body>
    </html>
  );
}