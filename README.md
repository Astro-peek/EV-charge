# IntelliRide ⚡ – Smart EV Ecosystem
**Team: civicshield**


[![Project Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://github.com/Astro-peek/EV-charge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://deepmind.google/technologies/gemini/)

IntelliRide is a cutting-edge web application designed to simplify the EV charging experience. It features an intelligent, floating AI assistant that helps users plan trips, find nearby charging stations, and book urgent slots instantly through natural language interaction.

---

## 🚀 Overview

IntelliRide is built for the modern EV owner. Navigating the world of electric vehicles can be complex—finding a working station, checking availability, and managing payments shouldn't be. IntelliRide integrates these workflows into a single, AI-powered interface that follows you across the site.

## ✨ Features

- **🤖 Floating AI Assistant**: Powered by Google Gemini, providing 24/7 support for site navigation and EV queries.
- **⚡ Urgent Slot Booking**: The AI can detect your location, find the nearest available charging slot, and book it for you instantly.
- **💳 Integrated Payments**: Seamless redirection to Razorpay for secure booking confirmations.
- **🗺️ Interactive Map View**: Real-time visualization of charging stations using Google Maps/Mapbox.
- **📱 PWA & APK Support**: Install as a Progressive Web App or download the dedicated Android APK for a native experience.
- **🌍 Multi-language & Voice Support**: Talk to the assistant in multiple Indian languages with integrated voice recognition and synthesis.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database & Auth**: Supabase (PostgreSQL).
- **AI Engine**: Google Gemini Pro API.
- **Payments**: Razorpay API.
- **Maps/Location**: Google Maps API / Leaflet.
- **State Management**: React Context API.

---

## 📂 Project Structure

```text
├── backend/
│   ├── routes/             # API Endpoints (Chatbot, Booking, etc.)
│   ├── services/           # AI Logic & Pricing Services
│   ├── index.js            # Server Entry Point
│   └── .env                # Backend Secrets
├── frontend/
│   ├── public/             # Static Assets (Favicons, Icons)
│   ├── src/
│   │   ├── components/     # Reusable UI (Hero, AIChatbot, etc.)
│   │   ├── context/        # Auth & App State
│   │   ├── pages/          # Home, Login, TripPlanner, etc.
│   │   ├── App.jsx         # Routing & Main Entry
│   │   └── index.css       # Global Styles
│   └── .env                # Frontend Env Vars
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase Project
- Google Gemini API Key
- Razorpay Account (Test mode)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Astro-peek/EV-charge.git
   cd bgi
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the environment variables section below
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env file based on the environment variables section below
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Anon Key | `eyJhbGci...` |
| `VITE_API_URL` | Production Backend URL | `https://api.yoursite.com` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Public Key | `rzp_test_...` |

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google AI API Key | `AIzaSy...` |
| `DATABASE_URL` | Supabase Postgres Connection | `postgresql://...` |
| `RAZORPAY_KEY_ID` | Razorpay Key | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | `vj2UQ...` |
| `FRONTEND_URL` | Allowed CORS Origin | `https://yoursite.com` |

---

## 🔄 How It Works

1. **User Request**: User asks the AI, *"I need an urgent charging slot near me."*
2. **Intent Detection**: Gemini API parses the request and identifies the "Urgent Booking" intent.
3. **Location Retrieval**: The app fetches the user's current GPS coordinates.
4. **Slot Search**: The backend queries the database for the nearest available station within a 5km radius.
5. **Confirmation**: The AI responds: *"I found a slot at ChargeNest Station (2km away). Would you like to book it for ₹250?"*
6. **Payment**: Upon user confirmation, the AI generates a payment link and redirects the user to the Razorpay gateway.

---

## 🧠 Gemini API Integration

The chatbot uses the `gemini-pro` model to provide context-aware responses. It is configured with a system instruction that defines its persona as an "EV Charging Expert." The integration includes:
- **Intent Mapping**: Custom logic to trigger bookings vs. general Q&A.
- **Multilingual Support**: Real-time translation for diverse user bases.
- **Streaming Responses**: (Optional) For a more natural conversation feel.

---

## 📸 Screenshots

![Home Page](https://via.placeholder.com/800x400?text=IntelliRide+Home+Page)
*Placeholder for Home Page UI*

![AI Chatbot](https://via.placeholder.com/400x600?text=AI+Chatbot+Interface)
*Placeholder for AI Assistant in Action*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ✉️ Contact

**Paras Gupta**  
GitHub: [@Astro-peek](https://github.com/Astro-peek)  
Project Link: [https://github.com/Astro-peek/EV-charge](https://github.com/Astro-peek/EV-charge)

⚡ *Powering your journey with intelligence.*
