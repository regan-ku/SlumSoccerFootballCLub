import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/footer";

// Load our custom fonts from Google
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Slum Stars FC | Community & Football",
  description: "Empowering the next generation through football, life skills, and community development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header is sticky at the top */}
        <Header />
        
        {/* Main content grows to push the footer to the bottom */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Footer at the bottom */}
        <Footer />
      </body>
    </html>
  );
}