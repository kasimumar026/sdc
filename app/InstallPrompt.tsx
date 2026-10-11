"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaClient() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Service worker registration failed:", error);
      });
    }

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
    }
  }

  if (!isMobile || !installPrompt) return null;

  return (
    <aside
      aria-label="Install SDC"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-white/15 bg-[#12386b] p-4 text-white shadow-2xl md:hidden"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Get the SDC app</p>
        <p className="text-sm text-white/80">Install for quicker access on your phone.</p>
      </div>
      <button
        type="button"
        onClick={() => void installApp()}
        className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#12386b] transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Install
      </button>
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={() => setInstallPrompt(null)}
        className="-mr-2 -mt-2 self-start rounded-full px-2 py-1 text-lg leading-none text-white/75 hover:text-white"
      >
        ×
      </button>
    </aside>
  );
}
