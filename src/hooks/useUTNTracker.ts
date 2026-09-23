"use client";

import { useEffect } from "react";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const STORAGE_PREFIX = "slum_stars_utm_";
const EXPIRATION_DAYS = 30;

export function useUTMTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    let hasNewUTM = false;

    UTM_PARAMS.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        // Save to localStorage with an expiration timestamp
        const expiry = new Date().getTime() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(`${STORAGE_PREFIX}${param}`, JSON.stringify({ value, expiry }));
        hasNewUTM = true;
      }
    });

    // Optional: Clean up the URL so it looks clean to the user after tracking
    if (hasNewUTM) {
      UTM_PARAMS.forEach((param) => urlParams.delete(param));
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);
}

// Helper function to retrieve active UTM data (useful for forms)
export function getActiveUTMData() {
  if (typeof window === "undefined") return {};
  
  const utmData: Record<string, string> = {};
  const now = new Date().getTime();

  UTM_PARAMS.forEach((param) => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${param}`);
    if (stored) {
      const { value, expiry } = JSON.parse(stored);
      if (now < expiry) {
        utmData[param] = value;
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}${param}`); // Clean up expired data
      }
    }
  });

  return utmData;
}