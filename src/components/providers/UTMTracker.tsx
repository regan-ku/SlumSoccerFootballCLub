"use client";

import { useUTMTracker } from "@/hooks/useUTNTracker";

export default function UTMTracker() {
  useUTMTracker(); // Activates the tracking
  return null; // Renders nothing visually
}