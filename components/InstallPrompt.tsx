'use client';

import { useEffect, useState } from 'react';
import { Download, Share, MonitorDown, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneCheck);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIosDevice && !standaloneCheck) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowManualModal(true);
    }
  };

  if (isStandalone) {
    return null;
  }

  if (isIOS) {
    return (
      <div className="flex items-center gap-2 bg-surface/60 shadow-sm mx-auto p-3.5 border border-white/10 rounded-xl max-w-sm text-text-muted text-xs text-left">
        <Share size={16} className="text-sky-400 shrink-0" />
        <span>
          To install: Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 shadow-md px-5 py-2.5 rounded-full font-semibold text-white text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Download size={16} />
        Install App
      </button>

      {showManualModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative bg-zinc-900 shadow-2xl p-6 border border-white/10 rounded-2xl w-full max-w-md text-white">
            <button
              onClick={() => setShowManualModal(false)}
              className="top-4 right-4 absolute hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-sky-500/10 p-3 rounded-xl text-sky-400">
                <MonitorDown size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base">Install Boblo</h3>
                <p className="text-white/50 text-xs">Run as a standalone native app</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-300 text-sm">
              <p>To install in Chrome / Edge:</p>
              <ol className="space-y-2 bg-black/40 p-3 border border-white/5 rounded-lg text-neutral-400 text-xs list-decimal list-inside">
                <li>
                  Click the <strong>Install</strong> icon in the address bar (right side of URL), or
                </li>
                <li>
                  Open the Chrome menu (<strong>⋮</strong>) &rarr; select <strong>Save and share</strong> &rarr; <strong>Install Boblo</strong>.
                </li>
              </ol>
              <p className="text-[11px] text-white/40">
                Note: In development mode (<code className="text-sky-300">next dev</code>), the Service Worker is disabled. Run <code className="text-sky-300">npm run build && npm start</code> to test the native prompt.
              </p>
            </div>

            <button
              onClick={() => setShowManualModal(false)}
              className="bg-white hover:bg-white/90 mt-5 py-2 rounded-lg w-full font-semibold text-black text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
