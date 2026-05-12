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
    window.open('https://drive.google.com/uc?export=download&id=1-b5Gd7UcvRWOK62Gh7Z8bVhknyvpr5_h', '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-4">
      <AnimatePresence>
        {showOptions && (
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, y: 20, scale: 0.9 }}
            className="flex flex-col gap-3 mb-2"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallPWA}
              className="bg-white/95 backdrop-blur-lg text-green-700 px-5 py-3 rounded-2xl font-bold shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-green-100 flex items-center gap-3 whitespace-nowrap group transition-all"
            >
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <LayoutGrid size={20} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Browser App</span>
                <span className="text-sm">Add to Home Screen</span>
              </div>
            </motion.button>

            <div className="relative group/apk">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadAPK}
                className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold shadow-[0_20px_40px_rgba(22,163,74,0.3)] border border-green-500/50 flex items-center gap-3 whitespace-nowrap group transition-all"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Smartphone size={20} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Android Native</span>
                  <span className="text-sm">Download APK File</span>
                </div>
              </motion.button>
              
              <div className="mt-2 flex justify-start">
                <span className="bg-green-800/90 backdrop-blur-sm text-white text-[9px] px-3 py-1.5 rounded-full font-bold shadow-xl border border-white/20 whitespace-nowrap">
                  ⚡ To use full feature download mobile app
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowOptions(!showOptions)}
        className={`bg-green-600 text-white p-5 rounded-3xl font-bold shadow-[0_20px_50px_rgba(22,163,74,0.4)] border-4 border-white backdrop-blur-sm flex items-center justify-center transition-all ${!showOptions ? 'animate-pulse' : ''}`}
        title="App Options"
      >
        {showOptions ? <X size={28} /> : <Download size={28} />}
      </motion.button>
    </div>
  );
};

export default InstallAppButton;
