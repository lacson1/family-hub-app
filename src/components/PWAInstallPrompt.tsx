import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Check if user has previously dismissed
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Install Family Hub
                        </h3>
                        <p className="text-sm text-gray-600">
                            Install our app for quick access and offline use!
                        </p>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                        aria-label="Dismiss install prompt"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleInstall}
                        className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all font-medium text-sm shadow-soft"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component to show install status
export const PWAInstallStatus: React.FC = () => {
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is running in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsInstalled(isStandalone);
    }, []);

    if (!isInstalled) return null;

    return (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 font-medium shadow-soft z-50 animate-fade-in">
            ✓ Running as installed app
        </div>
    );
};

