"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasSeenCookie = localStorage.getItem("cookie_consent");
    if (!hasSeenCookie) {
      // Small delay for a smoother entrance
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          We use local storage to enhance your experience and remember your preferences. 
          By continuing to use this site, you agree to our use of cookies.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={accept}
            className="btn-primary text-sm px-6 py-2"
          >
            Accept
          </button>
          <button 
            onClick={accept} 
            className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}