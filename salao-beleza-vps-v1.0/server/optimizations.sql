-- Performance optimizations for beauty salon database
-- Add indexes for frequently queried columns

-- Index for appointments by date (used in scheduling)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Index for appointments by created_at (used in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Index for appointments by status (used in filtering)
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Index for clients by phone (used for duplicate checking)
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- Index for services by is_active (most common query)
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Composite index for appointment queries with joins
CREATE INDEX IF NOT EXISTS idx_appointments_composite ON appointments(date, service_id, client_id);