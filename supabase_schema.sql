-- Stations Table
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  lat FLOAT8,
  lng FLOAT8,
  type TEXT CHECK (type IN ('AC', 'DC', 'Both')),
  power TEXT DEFAULT '15kW',
  status TEXT CHECK (status IN ('available', 'occupied', 'offline')) DEFAULT 'available',
  price_per_unit FLOAT8 NOT NULL,
  connector_types TEXT[],
  host_id UUID REFERENCES auth.users(id),
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  station_id UUID REFERENCES stations(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  total_amount FLOAT8,
  units_consumed FLOAT8 DEFAULT 0,
  payment_id TEXT,
  vehicle_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for Stations (Public read, Host write)
CREATE POLICY "Public stations are viewable by everyone" ON stations FOR SELECT USING (true);
CREATE POLICY "Hosts can insert their own stations" ON stations FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Policies for Bookings (Users can only see/edit their own bookings)
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
