# TechSolutions Pro - IT Onboarding Platform

A comprehensive IT services onboarding platform built with React and Supabase, featuring role-based access control for clients, technicians, and administrators.

## Features

### 🔐 Authentication & Authorization
- **Multi-role authentication** (Client, Technician, Administrator)
- **Secure login/registration** with email verification
- **Password reset functionality**
- **Role-based access control** with protected routes

### 👤 Client Features
- **Interactive onboarding flow** (6-step process)
- **Service selection** with pricing
- **Technical assessment** questionnaire
- **Project timeline planning**
- **Contract review and acceptance**
- **Personal dashboard** with service overview
- **Document upload and management**
- **Progress tracking**

### 🔧 Technician Features
- **Task management dashboard**
- **Client assignment tracking**
- **Project status updates**
- **Document access**
- **Technical notes and updates**

### 👨‍💼 Administrator Features
- **Client management** with full CRUD operations
- **Technician assignment** and task delegation
- **Document management** across all clients
- **Progress monitoring** and reporting
- **Client notes and communication tracking
- **Onboarding status management**

### 📁 Document Management
- **Secure file upload** to Supabase Storage
- **Document categorization** (contracts, assessments, etc.)
- **Role-based access control** for documents
- **Download and preview** functionality

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Animations**: Framer Motion
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
  - File Storage
- **Routing**: React Router DOM (Hash Router)

## Database Schema

### Tables
- `profiles_it_onboard` - User profiles with roles
- `client_details_it_onboard` - Client onboarding data
- `documents_it_onboard` - Document metadata
- `client_notes_it_onboard` - Admin/tech notes
- `tech_assignments_it_onboard` - Task assignments

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based policies for data access
- Secure file storage with access controls

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project
2. Run the migration script in `supabase/migrations/001_create_tables.sql`
3. Enable Row Level Security
4. Configure authentication settings
5. Set up storage bucket for documents

### 2. Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
npm run dev
```

## Default Users

The system creates default users for testing:
- **Admin**: admin@techsolutions.com / admin123
- **Tech**: tech@techsolutions.com / tech123

## User Roles & Permissions

### Client
- Complete onboarding process
- View personal dashboard
- Upload/manage own documents
- View own progress and status

### Technician
- View assigned tasks
- Update task status
- Access client information for assigned projects
- Upload documents for clients
- Add technical notes

### Administrator
- Full system access
- Manage all clients and technicians
- Assign tasks to technicians
- View all documents and data
- Update onboarding statuses
- Generate reports

## Key Components

- **OnboardingForm**: Multi-step client information collection
- **ServiceSelection**: IT service selection with pricing
- **TechnicalAssessment**: Infrastructure evaluation
- **ProjectTimeline**: Implementation planning
- **ContractReview**: Service agreement and pricing
- **AdminDashboard**: Administrative overview and management
- **TechDashboard**: Technician task management
- **DocumentUpload**: File management system

## Security Features

- JWT-based authentication
- Row Level Security (RLS) policies
- Role-based route protection
- Secure file upload with access controls
- Input validation and sanitization
- HTTPS enforcement (in production)

## API Integration

The platform uses Supabase for:
- **Authentication**: User login, registration, password reset
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: Secure file storage for documents
- **Edge Functions**: Server-side logic (if needed)

## Deployment

The application is ready for deployment on:
- Vercel
- Netlify
- Any static hosting service

Configure environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.