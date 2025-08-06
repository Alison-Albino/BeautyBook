# Overview

This is a beauty salon appointment booking system called "Beatriz Sousa" built with a modern full-stack architecture. The application allows clients to book eyelash and eyebrow services online and provides an admin dashboard for managing appointments, services, and client information. The system features a simplified 3-step booking form (name and phone only), automatic WhatsApp integration for confirmations, and a comprehensive admin interface for business operations. All text is in Portuguese (Portugal).

## Recent Updates (2025-08-06)
- ✓ Integrated official logo throughout the application
- ✓ Fixed admin login authentication system with proper session management
- ✓ Added PostgreSQL database with complete schema
- ✓ Created comprehensive admin dashboard with service management
- ✓ Implemented color scheme improvements for better contrast
- ✓ Added default admin account (admin/admin123) with bcrypt encryption
- ✓ Working appointment booking system with WhatsApp integration
- ✓ TypeScript errors resolved and application ready for deployment
- ✓ Session management optimized with secure cookies and proper invalidation

# User Preferences

- Preferred communication style: Simple, everyday language.
- Language: Portuguese (Portugal)
- Booking form: Only name and phone number required
- WhatsApp integration: Auto-redirect after booking to +351 935397642
- Services: Eyelashes and eyebrows only
- Color scheme: Beige (#F3ECE3), Black (#000000), Brown (#9F766E), White (#FFFFFF), Rosy (#C8A49C)

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Vite**: Fast build tool and development server for optimal developer experience
- **Wouter**: Lightweight client-side routing for single-page application navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design and consistent styling
- **Shadcn/ui**: Pre-built component library based on Radix UI primitives for accessible UI components
- **TanStack Query**: Server state management for efficient data fetching, caching, and synchronization

## Backend Architecture
- **Node.js with Express**: RESTful API server using Express framework for HTTP request handling
- **TypeScript**: Type-safe backend development with shared types between client and server
- **Memory Storage**: In-memory data storage implementation with interface for future database migration
- **Middleware**: Custom logging middleware for API request monitoring and error handling

## Database Schema Design
- **Services Table**: Stores beauty services (eyelashes and eyebrows) with EUR pricing, duration, and availability status
- **Clients Table**: Customer information with phone validation for Portuguese market (no CPF required)
- **Appointments Table**: Booking records linking clients to services with scheduling details
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL with schema migrations

## State Management
- **React Hook Form**: Form state management with Zod validation schemas
- **TanStack Query**: Server state caching and synchronization for API data
- **Local Component State**: React hooks for UI state and component interactions

## UI/UX Design Patterns
- **Multi-step Booking Flow**: Progressive disclosure pattern for appointment booking process
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes
- **Toast Notifications**: User feedback system for actions and error handling
- **Modal Dialogs**: Overlay pattern for confirmations and detailed views
- **Loading States**: Skeleton components and loading indicators for better perceived performance

## Authentication & Authorization
- **Session-based**: Express session middleware with PostgreSQL session store
- **Role-based Access**: Client and admin views with different permission levels
- **Form Validation**: Client-side and server-side validation with Portuguese phone format support
- **WhatsApp Integration**: Automatic redirection after booking with pre-filled message including service details

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database service for production deployment
- **Drizzle ORM**: Database toolkit with PostgreSQL dialect and migration support
- **Connect PG Simple**: PostgreSQL session store for Express sessions

## UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible components (dialogs, dropdowns, forms)
- **Lucide React**: Feather-inspired icon library for consistent iconography
- **React Day Picker**: Calendar component for date selection in booking flow
- **Embla Carousel**: Touch-friendly carousel component for service showcase

## Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for runtime type checking
- **Hookform Resolvers**: Integration bridge between React Hook Form and Zod validation

## Development & Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS post-processor with Tailwind CSS and Autoprefixer plugins
- **TSX**: TypeScript execution environment for development server
- **Replit Plugins**: Development environment integration for Replit platform

## Utility Libraries
- **Class Variance Authority**: Utility for creating type-safe variant-based component APIs
- **CLSX**: Conditional className utility for dynamic styling
- **Date-fns**: Modern JavaScript date utility library for date formatting and manipulation
- **Nanoid**: URL-safe unique string ID generator for client-side operations