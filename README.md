# ExpenseFlow - Expense Approval System

A production-style Expense Approval System with React (frontend) and FastAPI (backend). Simulates an internal enterprise tool for employees, managers, and admins.

## Features

- **Roles**: Employee, Manager, Admin
- **JWT Authentication** with role-based access control
- **Expense Management**: Submit, approve, reject, mark paid
- **Approval Workflow**: PENDING → APPROVED → PAID or PENDING → REJECTED
- **Reports & Analytics**: Monthly summary, category breakdown
- **CSV Export**: Role-aware export
- **Receipt Upload**: Optional file attachments

## Quick Start

### Backend (Python FastAPI)

```bash
cd backend
pip install -r requirements.txt
python scripts/seed_data.py   # Seed demo users (password: demo)
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

### Demo Users

| Role | Email | Password |
|------|-------|----------|
| Employee | alice@company.com | demo |
| Manager | frank@company.com | demo |
| Admin | admin@company.com | demo |

## Project Structure

```
├── backend/          # FastAPI backend
│   ├── app/          # Routes, services, models
│   ├── scripts/      # Seed data
│   └── tests/        # Unit tests
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── pages/        # Page components
│   └── context/      # Auth context
└── README.md
```

## Frontend-Backend Integration

The frontend currently uses in-memory mock data. To connect to the backend:

1. Ensure backend is running at http://localhost:8000
2. Vite proxy forwards `/api` to the backend during development
3. Update `AuthContext` to call `POST /api/auth/login` and store JWT
4. Update data store to call API endpoints with `Authorization: Bearer <token>`
