# APCAS School Clinic Management System

A digital clinic management system for the APCAS school clinic — student health records, consultations, and basic reporting. Built as a capstone project inspired by [HospitalRun](https://hospitalrun.io/).

## Features

- **Student records** — Add, search, and manage student health info (allergies, conditions, emergency contacts)
- **Consultations** — Log visits with chief complaint, vital signs, assessment, treatment, medication
- **Dashboard** — Today's visits, weekly stats, top complaints
- **Nurse login** — Simple authentication for clinic staff

## Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** SQLite locally (better-sqlite3); PostgreSQL on Render for production (data persists)

## Setup

### Prerequisites

- Node.js 18+ 
- npm (comes with Node.js)

### 1. Backend

```bash
cd backend
npm install
npm start
```

The API runs at **http://localhost:3001**. The database (`clinic.db`) is created automatically on first run.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

### 3. Login

Default nurse account:
- **Username:** `nurse`
- **Password:** `clinic123`

Change these in production.

## Deploying to Render (so data persists)

On Render, the filesystem is ephemeral, so SQLite data is lost on restart. Use PostgreSQL:

1. In the [Render Dashboard](https://dashboard.render.com), click **New → PostgreSQL**.
2. Create a **Free** database (same region as your web service).
3. After it’s created, open the database → **Connect** → copy the **Internal Database URL**.
4. Open your **Web Service** (the backend) → **Environment**.
5. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** paste the Internal Database URL.
6. Save. Render will redeploy; the backend will use PostgreSQL and data will persist across restarts.

## Project Structure

```
├── backend/
│   ├── db/           # Database schema & setup
│   ├── middleware/   # Auth middleware
│   ├── routes/       # API routes
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── ...
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/students | List students (search, pagination) |
| GET | /api/students/:id | Get student |
| POST | /api/students | Create student |
| PUT | /api/students/:id | Update student |
| GET | /api/consultations | List consultations (filter by date) |
| POST | /api/consultations | Create consultation |
| GET | /api/dashboard/stats | Dashboard statistics |

All routes except `/api/auth/login` require `Authorization: Bearer <token>`.

## License

MIT
