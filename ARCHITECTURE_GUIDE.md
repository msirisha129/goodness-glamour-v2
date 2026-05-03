# GoodnessGlamour Architecture Guide

## Overview
GoodnessGlamour is a full-stack web application for salon booking and management, built with a modern tech stack including React, Node.js, Express, PostgreSQL, and various integrations for voice, SMS, and email services.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite for build tooling, Tailwind CSS for styling, Radix UI components
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Drizzle ORM for type-safe database operations
- **Deployment**: Render (web service)
- **Integrations**: 
  - Voice: Twilio/Vonage for voice calls and AI assistants
  - SMS: MSG91 or Twilio for SMS notifications
  - Email: Nodemailer with SMTP support
  - AI: OpenAI API for chatbot functionality
  - Authentication: Google OAuth (optional)

## Architecture Components

### 1. Frontend (Client)
- **Location**: `/client/`
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query (TanStack) for server state, React Hook Form for forms
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite
- **Key Features**:
  - Salon booking interface
  - Customer dashboard
  - QR code generation for voice triggers
  - Real-time notifications

### 2. Backend (Server)
- **Location**: `/server/`
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Authentication**: JWT-based (optional Google OAuth)
- **Services**:
  - `auth-service.ts`: User authentication
  - `dashboard-service.ts`: Admin dashboard data
  - `email-service.ts`: Email sending
  - `db.ts`: Database connection and queries
- **API Endpoints**: RESTful API for CRUD operations

### 3. Database Schema
- **Location**: `/shared/schema.ts`
- **Tables**:
  - `users`: Customer and admin accounts
  - `bookings`: Appointment bookings
  - `services`: Salon services offered
  - `notifications`: SMS/Email notification logs
  - `contact_messages`: Customer inquiries
- **Migrations**: Handled by Drizzle ORM

### 4. Voice & SMS Integration
- **Voice Agents**: Python scripts for Twilio/Vonage integration
- **SMS Services**: MSG91 API for notifications
- **AI Chatbot**: Gemini/OpenAI integration for conversational AI

## Data Flow

### Booking Process:
1. Customer scans QR code → Triggers voice call
2. AI voice assistant collects booking details
3. Data stored in PostgreSQL via Express API
4. Confirmation SMS/Email sent
5. Admin notified via dashboard

### Notification System:
- SMS: Sent via MSG91 API
- Email: Sent via Nodemailer
- Logs stored in database for tracking

## Deployment
- **Platform**: Render
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20
- **Environment Variables**:
  - `DATABASE_URL`: Neon PostgreSQL connection string
  - `OPENAI_API_KEY`: For AI features
  - `EMAIL_USER/EMAIL_PASSWORD`: For email service
  - `SMS API keys`: For MSG91/Twilio

## Common Demo Questions & Answers

### Q: What database are you using?
A: PostgreSQL hosted on Neon. We use Drizzle ORM for type-safe queries and schema management.

### Q: How does the voice booking work?
A: Customers scan a QR code that triggers a voice call via Twilio/Vonage. Our AI assistant (built with Python) handles the conversation and books appointments through the Express API.

### Q: What about notifications?
A: We support both SMS (via MSG91) and email (via Nodemailer). All notifications are logged in the database.

### Q: Is the app scalable?
A: Yes, using serverless PostgreSQL, stateless Express API, and cloud deployment on Render.

### Q: Security measures?
A: Environment variables for secrets, input validation with Zod, HTTPS enforced, optional OAuth authentication.

## Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npm run db:migrate`
5. Start development: `npm run dev`

## File Structure
```
/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/schemas
├── data/            # Excel exports
├── requirements*.txt # Python dependencies
└── render.yaml      # Deployment config
```</content>
<parameter name="filePath">C:\Users\msiri\IdeaProjects\GoodnessGlamour\ARCHITECTURE_GUIDE.md
