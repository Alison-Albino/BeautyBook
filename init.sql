-- Initialize database with default admin user
-- This will run when the PostgreSQL container starts for the first time

-- The database and user are created automatically by the postgres image
-- We just need to ensure the admin user exists after schema is pushed

-- Note: The actual schema will be created by running 'npm run db:push'
-- This file is here to ensure the database is properly initialized