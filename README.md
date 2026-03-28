# Airline Reservation Simulation System

A modern, full-stack airline reservation system featuring a dynamic frontend built with Next.js and a robust backend built with NestJS and Supabase (PostgreSQL).

## Project Structure

The repository is divided into two primary directories:
- `frontend/`: The Next.js 15 application (App Router).
- `backend/`: The NestJS application providing the RESTful API and database management.

---

## 🖥 Backend Setup

### Prerequisites
- Node.js (v18+)
- Postgres database (Recommended: Supabase)

### 1. Install Libraries
Navigate to the backend directory and install the necessary dependencies:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables (API Keys)
Create an environment file named **`.env`** directly inside the `backend` folder (`backend/.env`). 

Add the following keys to your `.env` file and replace the placeholder values with your actual API keys and database credentials:

```ini
# Backend Environment Variables
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
JWT_SECRET="your-secure-jwt-secret"
FRONTEND_URL="http://localhost:3000"
PORT=4000
AVIATIONSTACK_API_KEY="your-aviation-stack-api-key"
```

### 3. Database Migration
Run Prisma to map out the database schema onto your PostgreSQL instance:
```bash
npx prisma db push
```
*(Optional) If you have a seed script set up, you can run `npm run seed` to populate dummy data.*

### 4. Run the Backend
Start the NestJS development server:
```bash
npm run start:dev
```
The backend will now be running at `http://localhost:4000`.

---

## 🎨 Frontend Setup

### Prerequisites
- Node.js (v18+)

### 1. Install Libraries
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables (API Keys)
Create an environment file named **`.env.local`** directly inside the `frontend` folder (`frontend/.env.local`).

Add the following keys to your `.env.local` file:

```ini
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Run the Frontend
Start the Next.js development server:
```bash
npm run dev
```
The frontend will now be running at `http://localhost:3000`. Open this URL in your browser to interact with the system.
