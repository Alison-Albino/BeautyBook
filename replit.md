# Project Overview

## Full-Stack JavaScript Application
This is a modern full-stack web application built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript + PostgreSQL + Drizzle ORM
- **Architecture**: Client/server separation with secure API endpoints

## Current Status
- Migrating from Replit Agent to Replit environment
- All dependencies are already installed
- Project follows modern web application patterns and security best practices

## Project Architecture
- `client/` - React frontend with shadcn/ui components
- `server/` - Express backend with API routes and database integration
- `shared/` - Shared TypeScript schemas and types
- Database using PostgreSQL with Drizzle ORM

## User Preferences
(None specified yet)

## Recent Changes
- 2025-08-19: Successfully completed migration from Replit Agent to Replit environment
- **MAJOR UPDATE**: Migrated from PostgreSQL to SQLite for simplified deployment
- Eliminated .env file dependency completely
- Created SQLite schema with auto-incremental IDs
- Applied SQLite migrations and initialized database
- Created admin user: username 'admin', password 'admin123'
- Added 6 example services to database
- Application running successfully on port 5000 with SQLite
- Created complete SQLite deployment package (salao-beleza-sqlite.tar.gz)
- Prepared production-ready scripts for VPS deployment

## Database Configuration
- **Type**: SQLite (local file-based)
- **Development DB**: ./dev-database.db
- **Production DB**: ./database.db
- **Migration System**: Drizzle ORM with SQLite adapter

## Admin Credentials
- **Username**: admin
- **Password**: admin123

## Migration Progress
✓ Migration completed successfully - SQLite implementation ready for production