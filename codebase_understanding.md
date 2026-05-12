# EV Charge OS - Codebase Understanding Document

This document provides a comprehensive overview of the frontend, backend, and database architecture for the EV Charge OS platform. It details the technologies used, the reasoning behind their selection, the APIs available, and a high-level explanation of how the code operates in each section.

---

## 1. Frontend

### Technologies Used
- **React.js**: A JavaScript library for building user interfaces. It is used because its component-based architecture makes the UI highly modular, reusable, and easy to manage.
- **Vite**: A modern build tool that provides a faster and leaner development experience. Used for its lightning-fast Hot Module Replacement (HMR) and optimized build times compared to Webpack.
- **Tailwind CSS**: A utility-first CSS framework. Used for rapidly styling components directly within JSX without writing custom CSS files, ensuring a consistent and responsive design system.
- **React Router DOM**: The standard routing library for React. Used to enable seamless client-side navigation between different views (e.g., Home, TripPlanner, Dashboard) without full page reloads, providing a Single Page Application (SPA) experience.
- **Supabase JS**: The official SDK for interacting with Supabase. Used for seamless integration with Supabase Authentication, providing secure login/signup flows.
- **Maps Integrations (@react-google-maps/api, leaflet, react-leaflet, mapbox-gl)**: Libraries to render interactive maps. Used to display real-time charging station locations, route planning, and navigation for users.
- **Framer Motion**: An animation library for React. Used to add engaging, complex UI animations and transitions easily, improving the overall user experience.
- **Axios**: A promise-based HTTP client. Used to make asynchronous API requests to the Node.js backend.

### How the Code Works
- **Entry Point**: The application initializes in `frontend/src/main.jsx`, where the React app is mounted to the DOM and wrapped with essential context providers.
- **Routing Strategy**: `frontend/src/App.jsx` handles all routing logic. It maps URLs to specific page components. Routes are categorized into layouts (e.g., `MainLayout` which includes the Navbar) and standalone pages (like `Login`). It also implements `ProtectedRoute` and `AdminRoute` components to restrict access based on authentication state.
- **Component Architecture**: The `src/pages` directory holds top-level views (e.g., `Home`, `TripPlanner`, `HostDashboard`). Reusable UI elements like buttons, navbars, and map views are stored in `src/components`.
- **Data Fetching**: Components utilize Axios or the native `fetch` API inside `useEffect` hooks or custom hooks to call backend APIs.
- **State & Authentication**: Global state (like the current user's session) is managed via React Context and the Supabase SDK. Protected routes check for a valid session token before rendering the underlying component, redirecting unauthorized users to the login page.

---

## 2. Backend

### Technologies Used
- **Node.js & Express.js**: A JavaScript runtime and minimal web framework. Used for building a robust and scalable RESTful API. Express makes it easy to set up routing, middleware, and HTTP request handling.
- **Prisma**: A next-generation ORM (Object-Relational Mapper). Used because it provides a highly intuitive, type-safe database client and auto-generated migrations, making complex PostgreSQL database operations reliable and easy to write.
- **BullMQ & Redis (ioredis)**: Message queue and in-memory data structure store. Used for handling background jobs and queues. This is crucial for asynchronous tasks like managing real-time station waitlists and processing heavy background tasks without blocking the main API thread.

- **Anthropic / Google Generative AI**: LLM SDKs. Used to power intelligent features like the conversational AI agent and predictive trip planning insights (`services/aiService.js`).
- **Razorpay**: A payment gateway SDK. Used to process financial transactions for EV charging sessions securely.
- **PDFKit**: A PDF generation library. Used for generating downloadable GST-compliant invoices programmatically.

### APIs / Routes
The API is structured modularly in `backend/routes/`:
- **`/api/stations`**: Manages CRUD operations for charging stations. Includes a `/discovery` endpoint to find nearby stations using geospatial coordinate queries.
- **`/api/bookings`**: Handles creating, updating, and fetching charging slot reservations.
- **`/api/vehicles`**: Manages user EV profiles (to match vehicle connectors and capacities with station capabilities).
- **`/api/trips`**: Interacts with the trip planner service to calculate optimal routes including charging stops.
- **`/api/payments`**: Connects with Razorpay to initiate, verify, and complete payments.
- **`/api/analytics`**: Provides aggregated data for host and administrator dashboards (e.g., revenue, utilization rates).
- **`/api/queue`**: Manages the waitlist for busy charging stations using Redis/BullMQ.
- **`/api/invoices`**: Generates and serves PDF invoices for completed charging sessions.
- **`/api/chargenest`**: Handles specific operations related to the "ChargeNest" host features.
- **`/api/agent/orchestrate`**: An AI endpoint that orchestrates natural language queries for the smart assistant.

### How the Code Works
- **Entry Point**: `backend/index.js` acts as the server's entry point. It initializes the Express application, configures global middleware (CORS, JSON parsing), sets up all route handlers, and starts listening on the defined port.
- **Routing & Controllers**: HTTP requests are routed from `index.js` to specific route files. These route handlers extract parameters from the request body/query, validate them, and execute business logic.
- **Services**: Complex business logic is abstracted away from routes into `backend/services/`. For example, `aiService.js` handles all LLM API calls, and `paymentService.js` encapsulates Razorpay transaction flows.
- **Database Access**: Database operations are handled exclusively via the `PrismaClient` (instantiated in `lib/prisma.js`). The routes import this client to execute queries like `prisma.station.findMany()`.

---

## 3. Database

### Technologies Used
- **PostgreSQL (Hosted on Supabase)**: An advanced, enterprise-class open-source relational database. Used as the primary data store for its rock-solid reliability, relational integrity, and robust support for advanced data types (like geospatial coordinates).
- **Supabase Auth**: A complete user authentication system provided by Supabase. Used to securely manage user identities, sessions, and passwords without building a custom auth backend.
- **Row Level Security (RLS)**: A PostgreSQL feature. Used to enforce strict security policies directly at the database layer, ensuring data privacy regardless of API vulnerabilities.

### Schema Overview
- **Users (`auth.users`)**: Managed automatically by Supabase. Stores authentication details (email, encrypted passwords, tokens).
- **Stations (`public.stations`)**: Stores physical charging station details, including geospatial coordinates (lat/lng), power output, pricing, connector types, and a foreign key linking to the `host_id`.
- **Bookings (`public.bookings`)**: Tracks reservations. Links a user, a station, start/end times, real-time status (pending/active/completed), and payment references.
- **VehicleProfile (`public.vehicle_profiles`)**: Stores user vehicle details (battery capacity, max voltage) to ensure compatibility with stations.
- **RickshawDriver / IncomeLog**: Specialized tables designed for fleet management and commercial tracking.
- **BatteryHealth**: Tracks the degradation and charge cycles of EVs over time.

### How the Code Works
- **Schema Definition**: The database structure is defined through two synchronized methods:
  1. `supabase_schema.sql`: Contains the raw SQL to initialize the database, set up tables, create foreign key constraints, and establish Row Level Security (RLS) policies.
  2. `backend/prisma/schema.prisma`: The Prisma representation of the PostgreSQL schema. This file defines the models used by the Node.js backend.
- **Security Enforcement**: The RLS policies defined in SQL act as a fail-safe. For example, `CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);` ensures that even if the backend inadvertently queries all bookings, the database will only return the rows belonging to the currently authenticated user.
- **ORM Sync**: Running `npx prisma generate` in the backend reads the `schema.prisma` file and generates a tailored TypeScript/JavaScript client, providing autocomplete and type-safe methods for interacting with the database.
