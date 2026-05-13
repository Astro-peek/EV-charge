# IntelliRide EV Charging System - Backend & Database Code Explanation

## 📋 Project Overview
**IntelliRide** is a comprehensive EV charging management system that enables users to find charging stations, book slots, plan trips with charging stops, and manage payments. The backend uses Node.js with Express, Prisma ORM, PostgreSQL, and integrates with multiple external services.

---

## 🏗️ Backend Architecture

### 1. Main Server File (`backend/index.js`)

**Lines 1-3: Dependencies & Configuration**
```javascript
const express = require('express');      // Express.js framework for REST API
const cors = require('cors');            // Cross-Origin Resource Sharing middleware
require('dotenv').config();              // Load environment variables
```

**Lines 5-6: App Initialization**
```javascript
const app = express();
const PORT = process.env.PORT || 8000;  // Server port configuration
```

**Lines 8-10: Middleware Setup**
```javascript
app.use(cors());                         // Enable CORS for frontend communication
app.use(express.json());                 // Parse JSON request bodies
```

**Lines 12-13: Database Connection**
```javascript
console.log('⚡ Prisma ORM initialized with PostgreSQL');
// Prisma auto-connects to PostgreSQL using DATABASE_URL
```

**Lines 15-16: IoT Integration**
```javascript
require('./services/mqttService');       // Initialize MQTT listener for real-time station data
```

**Lines 19-29: Route Imports**
```javascript
const stationRoutes = require('./routes/stationRoutes');      // Station management
const bookingRoutes = require('./routes/bookingRoutes');      // Booking operations
const vehicleRoutes = require('./routes/vehicleRoutes');      // Vehicle management
const tripRoutes = require('./routes/tripRoutes');            // Trip planning
const paymentRoutes = require('./routes/paymentRoutes');      // Payment processing
const analyticsRoutes = require('./routes/analyticsRoutes');  // Analytics & reports
const queueRoutes = require('./routes/queueRoutes');          // Booking queue management
const invoiceRoutes = require('./routes/invoiceRoutes');      // Invoice generation
const chargeNestRoutes = require('./routes/chargeNestRoutes'); // ChargeNest integration
const chatbotRoutes = require('./routes/chatbotRoutes');      // AI chatbot
```

**Lines 31-40: API Route Registration**
```javascript
app.use('/api/stations', stationRoutes);     // /api/stations/*
app.use('/api/bookings', bookingRoutes);     // /api/bookings/*
app.use('/api/vehicles', vehicleRoutes);     // /api/vehicles/*
app.use('/api/trips', tripRoutes);           // /api/trips/*
app.use('/api/payments', paymentRoutes);     // /api/payments/*
app.use('/api/analytics', analyticsRoutes);  // /api/analytics/*
app.use('/api/queue', queueRoutes);          // /api/queue/*
app.use('/api/invoices', invoiceRoutes);      // /api/invoices/*
app.use('/api/chargenest', chargeNestRoutes); // /api/chargenest/*
app.use('/api/chatbot', chatbotRoutes);       // /api/chatbot/*
```

**Lines 42-49: Basic Health Routes**
```javascript
app.get('/', (req, res) => {
    res.json({ message: 'EV Charge OS API (MERN) is running', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});
```

**Lines 51-58: AI Agent Integration**
```javascript
const { orchestrateQuery } = require('./services/aiService');

app.post('/api/agent/orchestrate', async (req, res) => {
    const { query, lang } = req.body;        // User query and language
    const result = await orchestrateQuery(query, lang || 'en'); // Process with AI
    res.json(result);
});
```

**Lines 61-65: Server Start**
```javascript
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
```

---

## 🗄️ Database Schema (Prisma)

### 1. Database Configuration (`backend/prisma/schema.prisma`)

**Lines 1-4: Prisma Generator**
```prisma
generator client {
  provider        = "prisma-client-js"    // Use Prisma Client
  previewFeatures = ["multiSchema"]       // Enable multi-schema support
}
```

**Lines 6-10: Data Source**
```prisma
datasource db {
  provider = "postgresql"                // PostgreSQL database
  url      = env("DATABASE_URL")         // Database connection string
  schemas  = ["auth", "public"]          // Multiple schemas (Supabase auth + custom)
}
```

### 2. Station Model (`backend/prisma/schema.prisma` lines 12-31)

```prisma
model Station {
  id              String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  name            String                         // Station name
  address         String?                        // Physical address
  lat             Float?                         // Latitude coordinate
  lng             Float?                         // Longitude coordinate
  type            String?                        // AC/DC/Both
  power           String?   @default("15kW")    // Power rating
  status          String?   @default("available") // available/occupied/offline
  price_per_unit  Float                          // Price per electricity unit
  connector_types String[]                       // Available connector types
  host_id         String?   @db.Uuid            // Station host reference
  images          String[]                       // Station images
  createdAt       DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  bookings        Booking[]                      // Related bookings
  users           User?     @relation(fields: [host_id], references: [id])

  @@map("stations")
  @@schema("public")
}
```

### 3. Booking Model (`backend/prisma/schema.prisma` lines 33-50)

```prisma
model Booking {
  id             String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  user_id        String    @db.Uuid              // User who made booking
  station_id     String    @db.Uuid              // Station being booked
  start_time     DateTime  @map("start_time") @db.Timestamptz(6) // Booking start
  end_time       DateTime  @map("end_time") @db.Timestamptz(6)   // Booking end
  status         String?   @default("pending")   // pending/active/completed/cancelled
  total_amount   Float?    @map("total_amount")  // Total cost
  units_consumed Float?    @default(0) @map("units_consumed") // Electricity used
  payment_id     String?   @map("payment_id")    // Payment reference
  vehicle_id     String?   @map("vehicle_id")    // Vehicle being charged
  createdAt      DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  station        Station   @relation(fields: [station_id], references: [id])
  users          User      @relation(fields: [user_id], references: [id])

  @@map("bookings")
  @@schema("public")
}
```

---

## 🛣️ API Routes Breakdown

### 1. Station Management (`backend/routes/stationRoutes.js`)

**Lines 7-20: Get All Stations**
```javascript
router.get('/', async (req, res) => {
    const { type, status } = req.query;         // Optional filters
    try {
        const stations = await prisma.station.findMany({
            where: {
                ...(type && { type }),           // Filter by station type (AC/DC)
                ...(status && { status })        // Filter by status (available/occupied)
            }
        });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
```

**Lines 23-30: Station Discovery**
```javascript
router.get('/discovery', async (req, res) => {
    const { lat, lng, connector_type } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Lat/Lng required" });

    try {
        const whereClause = {
            lat: { gte: parseFloat(lat) - 1, lte: parseFloat(lat) + 1 },  // ±1 degree lat
            lng: { gte: parseFloat(lng) - 1, lte: parseFloat(lng) + 1 }   // ±1 degree lng
        };
```

### 2. Booking Operations (`backend/routes/bookingRoutes.js`)

**Lines 6-18: Get User Bookings**
```javascript
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;            // Optional user filter
        const query = userId ? { where: { user_id: userId } } : {};
        const bookings = await prisma.booking.findMany({
            ...query,
            include: { station: true }           // Include station details
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
```

**Lines 21-30: Create New Booking**
```javascript
router.post('/', async (req, res) => {
    try {
        const newBooking = await prisma.booking.create({
            data: {
                user_id: req.body.user_id,
                station_id: req.body.station_id,
                start_time: new Date(req.body.start_time),
                end_time: new Date(req.body.end_time),
                status: req.body.status || 'pending',
                total_amount: req.body.total_amount,
```

---

## ⚡ Core Services

### 1. Trip Planner Service (`backend/services/tripPlannerService.js`)

**Lines 9-20: Haversine Distance Formula**
```javascript
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;                              // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));  // Distance in km
};
```

**Lines 26-30: Route Optimization**
```javascript
const isOnRoute = (stationLat, stationLng, startLat, startLng, endLat, endLng) => {
    const directDist = haversine(startLat, startLng, endLat, endLng);
    const viaStation = haversine(startLat, startLng, stationLat, stationLng) 
                     + haversine(stationLat, stationLng, endLat, endLng);
    // Check if station is reasonably on the route
```

### 2. Dynamic Pricing Service (`backend/services/pricingService.js`)

**Lines 16-30: Real-time Pricing**
```javascript
async getStationPrice(stationId, durationHours = 2) {
    try {
      const station = await prisma.station.findUnique({
        where: { id: stationId }
      });

      if (!station) {
        throw new Error('Station not found');
      }

      const basePricePerUnit = station.price_per_unit || 15; // Default ₹15 per unit
      const powerKW = this.extractPowerKW(station.power);
      
      // Calculate dynamic pricing factors
      const timeMultiplier = this.getTimeMultiplier();
```

---

## 🔌 External Integrations

### 1. MQTT IoT Service (`backend/services/mqttService.js`)
- **Purpose**: Real-time communication with charging stations
- **Protocol**: MQTT for IoT device communication
- **Features**: Station status updates, power consumption monitoring

### 2. Payment Service (`backend/services/paymentService.js`)
- **Gateway**: Razorpay integration
- **Features**: Payment processing, refund handling, webhook verification

### 3. AI Service (`backend/services/aiService.js`)
- **Provider**: Google Gemini API
- **Features**: Natural language processing, trip recommendations, chatbot responses

---

## 📊 Database Relationships

### User ↔ Station (One-to-Many)
- One user (host) can own multiple stations
- Station.host_id references User.id

### User ↔ Booking (One-to-Many)
- One user can have multiple bookings
- Booking.user_id references User.id

### Station ↔ Booking (One-to-Many)
- One station can have multiple bookings
- Booking.station_id references Station.id

---

## 🔐 Security Features

### 1. Row Level Security (RLS)
- Supabase RLS policies in `supabase_schema.sql`
- Users can only access their own bookings
- Public read access for stations

### 2. Authentication
- Supabase Auth integration
- JWT token validation
- Google OAuth support

---

## 🚀 Deployment Architecture

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection
- `GEMINI_API_KEY`: AI service
- `RAZORPAY_KEY_ID/SECRET`: Payment gateway
- `REDIS_URL`: Caching layer
- `MQTT_BROKER`: IoT communication

### Multi-Environment Support
- Development: Local PostgreSQL
- Production: Supabase PostgreSQL
- Vercel deployment ready

---

## 📈 Key Features Implemented

### 1. **Station Discovery**
- Geospatial search with coordinates
- Real-time availability status
- Multiple connector types support

### 2. **Smart Trip Planning**
- Route optimization with charging stops
- Battery range calculations
- Dynamic pricing integration

### 3. **Booking Management**
- Time-slot reservations
- Queue management system
- Real-time status updates

### 4. **Payment Processing**
- Razorpay integration
- Invoice generation
- Refund handling

### 5. **IoT Integration**
- MQTT for real-time station data
- Power consumption monitoring
- Status synchronization

### 6. **AI-Powered Features**
- Natural language chatbot
- Intelligent recommendations
- Trip optimization algorithms

---

## 🎯 Hackathon Highlights

### Technical Innovation
- **Multi-Modal Architecture**: REST API + MQTT + AI
- **Real-time Capabilities**: Live station status via IoT
- **Smart Algorithms**: Route optimization with charging stops
- **Dynamic Pricing**: Time-based demand pricing

### Business Value
- **Solves Range Anxiety**: Intelligent trip planning
- **Optimizes Resource Usage**: Real-time station utilization
- **Enhances User Experience**: Seamless booking and payment
- **Scalable Solution**: Cloud-native architecture

### Competitive Advantages
- **AI Integration**: Smart recommendations and chatbot
- **IoT Connectivity**: Real hardware integration
- **Multi-Platform**: Web + Mobile (APK available)
- **Production Ready**: Complete payment and auth system

---

## 🔧 Development Workflow

### Local Development
```bash
cd backend
npm install
npm run dev  # Start development server
```

### Database Operations
```bash
npx prisma migrate dev    # Apply migrations
npx prisma studio         # Database GUI
npx prisma generate       # Generate client
```

### Environment Setup
- Copy `.env.example` to `.env`
- Configure database and API keys
- Start PostgreSQL locally or use Supabase

---

This comprehensive backend architecture demonstrates enterprise-level development with modern technologies, real-time capabilities, and intelligent features that solve real-world EV charging challenges.
