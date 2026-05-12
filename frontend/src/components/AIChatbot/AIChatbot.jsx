import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Globe, Zap, CreditCard } from 'lucide-react';
import api from '../../utils/api';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hey there! 👋 I'm your EV charging assistant! I can help you book urgent slots, find stations, and answer charging questions. I speak multiple languages & support voice too! Need charging help? 🔋",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(selectedLanguage);
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
        
        if (event.results[0].isFinal) {
          setIsListening(false);
          sendMessageWithIntent();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const getLanguageCode = (lang) => {
    const codes = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN'
    };
    return codes[lang] || 'en-US';
  };

  const handleSendMessage = async () => {
    // We will merge this into sendMessageWithIntent
  };

  // Removed checkUrgentBooking and handleUrgentBooking (logic moved to backend)

  const sendMessageWithIntent = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    await handleGeminiChat(currentInput);
    
    setIsLoading(false);
  };

  const handleGeminiChat = async (userInput) => {
    try {
      let userLocation = { lat: 28.6139, lng: 77.2090 }; // Fallback to New Delhi
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Using real user location:', userLocation);
      } catch (geoError) {
        console.warn('Geolocation failed or denied, using fallback:', geoError.message);
      }
      
      const response = await api.post('/chatbot/chat', {
        message: userInput,
        language: selectedLanguage,
        userLocation
      });

      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        language: response.data.language
      };

      if (response.data.isBooking) {
        botMessage.isBooking = true;
        botMessage.station = response.data.station;
        botMessage.slot = response.data.slot;
        botMessage.paymentData = response.data.paymentData;
      }

      setMessages(prev => [...prev, botMessage]);
      
      if (isSpeaking) {
        speakText(response.data.response);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        sender: 'bot'
      }]);
    }
  };

  const handlePaymentRedirect = (paymentData) => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        openRazorpay(paymentData);
      };
      document.body.appendChild(script);
    } else {
      openRazorpay(paymentData);
    }
  };

  const openRazorpay = (paymentData) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.order_id,
      name: paymentData.name,
      description: paymentData.description,
      image: paymentData.image,
      handler: function (response) {
        console.log('Payment successful:', response);
        window.location.href = '/payment/success';
      },
      prefill: paymentData.prefill,
      notes: paymentData.notes,
      theme: paymentData.theme,
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(selectedLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoice = () => {
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking && messages.length > 0) {
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
      if (lastBotMessage) {
        speakText(lastBotMessage.text);
      }
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageWithIntent();
    }
  };

  return (
    <div className="fixed bottom-2 right-4" style={{ zIndex: 999999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/30 backdrop-blur-sm"
          style={{
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.1)',
            animation: 'pulse 2s infinite'
          }}
        >
          <MessageCircle size={24} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>
      )}

      {isOpen && (
        <div 
          className="absolute bottom-14 sm:bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 flex flex-col overflow-hidden"
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.2)',
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base">EV Charging Assistant</h3>
                <p className="text-xs text-emerald-100">Voice & Multi-language 🎤</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-all duration-200 ${isSpeaking ? 'bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                title="Toggle Voice Response"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl transition-all duration-200 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                }`}>
                  {msg.isBooking ? (
                    <div>
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*/g, '').replace(/\n/g, '<br>') }} />
                      <button
                        onClick={() => handlePaymentRedirect(msg.paymentData)}
                        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <CreditCard size={16} />
                        Proceed to Payment
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-3 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-emerald-600 flex-shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
                title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask about EV charging..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessageWithIntent}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Send size={18} />
              </button>
            </div>
            {isListening && (
              <div className="mt-2 text-sm text-red-500 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Listening... Speak now!
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 border-t border-emerald-100">
            <p className="text-xs text-emerald-700 text-center font-medium">
              💡 Try: "I need urgent charging" or "Find nearest station"
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;
