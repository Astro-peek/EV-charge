import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Listen for the event that indicates the PWA can be installed
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the default browser install prompt
      setDeferredPrompt(e); // Save the event so we can trigger it later
      setIsInstallable(true); // Show our custom install button
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // We can only use the prompt once, so clear it
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // If the app is already installed or not supported, don't show the button
  if (!isInstallable) return null;

  return (
    <button 
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 lg:top-24 lg:bottom-auto lg:right-10 z-50 bg-green-600 text-white px-5 py-3 rounded-full font-bold shadow-2xl border-2 border-white hover:bg-green-700 hover:scale-105 transition-all flex items-center gap-2 animate-bounce hover:animate-none"
    >
      <Download size={20} />
      Download App
    </button>
  );
};

export default InstallAppButton;
