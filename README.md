# EV Charge OS — BGI Hackathon
**Revolutionizing EV Charging for Bharat**

## 📖 Overview
EV Charge OS is an AI-powered orchestration layer designed to solve the critical infrastructure gaps in India's EV ecosystem. By leveraging existing infrastructure (peer-to-peer charging), universal compatibility (VehicleID), and smart automation (GridSense), we ensure a seamless charging experience for everyone—from premium EV car owners to Bharat's e-rickshaw drivers.

---

## 🚀 Key Features (1, 2, 3, 6)

### 1. ChargeAnna (Peer-to-Peer Charging)
*The "Airbnb" for EV Chargers.*
- **Frontend**: Users can list their 15A/16A home/shop/dhaba sockets or find nearby peer-hosted chargers. Features a real-time slot booking interface and UPI-based instant payment.
- **Backend**: Integrates with IoT Smart Plugs (ESP32) via MQTT to meter kWh consumption. Automated billing and settlement logic via Razorpay/UPI AutoPay.
- **Working**: When a user books a slot, the Master Orchestrator checks the smart plug status. Once the session ends, the backend calculates the bill based on actual units consumed and triggers a UPI payment link.

### 2. VehicleID Protocol
*One QR, Zero Confusion.*
- **Frontend**: A universal QR code (scanned from the vehicle's registration or dashboard). The app automatically filters and displays only compatible chargers.
- **Backend**: A central database (linked to VAHAN 4.0 API) that maps vehicle registration numbers to their specific charging profile (connector type, battery capacity, max voltage).
- **Working**: Scanning the QR sends the vehicle ID to the backend, which fetches the VCP (Vehicle Charging Profile). The search API then uses this profile to filter Map results in real-time.

### 3. ChargeSaathi (Smart Highway Trip Planner)
*The IRCTC of EV Travel.*
- **Frontend**: A multi-stop route planning interface. Users enter their destination, and the app plots the most efficient path with guaranteed charging slots.
- **Backend**: Uses a **TripPlanner Agent** to calculate range based on vehicle battery, terrain, and Indian weather conditions (adjusting for heat-induced range loss).
- **Working**: The system auto-books slots at each stop along the route using the OCPP protocol. If a booked charger goes offline, the agent proactively re-routes the user to the next best available slot.

### 6. ReChakra (Voice-First E-Rickshaw App)
*Empowering Bharat's 3W Revolution.*
- **Frontend**: A simplified, voice-first interface supporting regional languages (Bhojpuri, Hindi, etc.) powered by **Bhashini API**.
- **Backend**: Voice intent classification (ASR/TTS) routed to the locator service. Includes a lightweight battery health monitoring model.
- **Working**: An e-rickshaw driver asks for a charger in their native dialect. The backend translates the speech, finds the cheapest 5A/15A socket nearby, and responds via voice with directions and pricing.

---

## 🛠️ Tech Stack

### Frontend (User & Operator Layer)
- **Framework**: React Native (Expo) for iOS/Android apps.
- **Web Dashboard**: React.js with TailwindCSS for CPO management.
- **Voice Integration**: Bhashini NLP MCP (Government of India API).
- **Messaging**: WhatsApp/SMS fallback via Twilio MCP.

### Backend (MERN Logic & AI Layer)
- **Core API**: Node.js + Express.js — The central Agent Gateway.
- **Database**: MongoDB (with GeoJSON) — For station locations, user profiles, and session data.
- **Charger Comms**: Node.js — Handling OCPP 2.0.1 WebSocket sessions.
- **Task Queue**: BullMQ + Redis — For async background jobs (slot monitoring, notifications).
- **AI Orchestration**: Claude 3.5 Sonnet (via Anthropic Node.js SDK).

---

## 🏗️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or Local)
- Redis Server (for BullMQ)

### Quick Setup
1. **Clone and Install Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Environment Configuration**:
   Create a `.env` file in the `backend` root:
   ```env
   ANTHROPIC_API_KEY=your_key
   DATABASE_URL=postgresql://user:pass@localhost/evcharge
   REDIS_URL=redis://localhost:6379
   ```

---

## 🏆 Hackathon Goals
- **Zero Human Touch**: Automated failure recovery and routing.
- **Inclusive Tech**: Making EV charging accessible to Bharat's non-English speaking population.
- **Asset Monetization**: Converting existing electricity points into a national charging grid.
