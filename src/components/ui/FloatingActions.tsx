"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

export default function FloatingActions() {
  const [showScroll, setShowScroll] = useState(false);
  // Replace with your actual WhatsApp number from the database or env
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000"; 

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="p-3 bg-card border border-border text-foreground rounded-full shadow-lg hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
}