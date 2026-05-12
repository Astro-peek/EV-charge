import { useState, useEffect } from 'react';
import { Download, Smartphone, LayoutGrid, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA install prompt is ready!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert("To install as an app: \n\nOn Chrome/Edge: Click the 'Install' icon in the address bar.\nOn Safari: Click 'Share' -> 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDownloadAPK = () => {
    const link = document.createElement('a');
    link.href = '/chargenest.apk';
    link.download = 'chargenest.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {showOptions && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-3 mb-2"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallPWA}
              className="bg-white/90 backdrop-blur-md text-green-700 px-5 py-3 rounded-2xl font-bold shadow-2xl border border-green-100 flex items-center gap-3 whitespace-nowrap group transition-all"
            >
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <LayoutGrid size={20} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold uppercase tracking-wider opacity-60">Web App</span>
                <span>Add to Home Screen</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadAPK}
              className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold shadow-2xl border border-green-500/50 flex items-center gap-3 whitespace-nowrap group transition-all"
            >
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                <Smartphone size={20} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Android Only</span>
                <span>Download APK File</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowOptions(!showOptions)}
        className={`bg-green-600 text-white p-5 rounded-full font-bold shadow-2xl border-4 border-white ring-4 ring-green-600/20 backdrop-blur-sm flex items-center justify-center transition-all ${!showOptions ? 'animate-bounce shadow-green-500/50' : ''}`}
      >
        {showOptions ? <X size={28} /> : <Download size={28} />}
      </motion.button>
    </div>
  );
};

export default InstallAppButton;
