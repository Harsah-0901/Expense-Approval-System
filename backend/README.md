# ExpenseFlow API - Backend

Production-style Expense Approval System backend built with FastAPI, SQLAlchemy, and JWT authentication.

## Features

- **JWT Authentication** - Secure token-based auth with role-based access
- **Roles** - Employee, Manager, Admin
- **Expense Management** - Submit, approve, reject, mark as paid
- **Approval Workflow** - PENDING → APPROVED → PAID or PENDING → REJECTED
- **Reports & Analytics** - Monthly summary, category breakdown, team reports
- **CSV Export** - Role-aware export
- **File Upload** - Optional receipt upload (PDF, PNG, JPG)
- **Swagger/OpenAPI** - Auto-generated docs at `/docs`

## Setup

### Prerequisites

- Python 3.11+
- pip or uv

### Install

```bash
cd backend
pip install -r requirements.txt
```

### Run

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or
python -m uvicorn app.main:app --reload --port 8000
```

### Seed Data

```bash
python scripts/seed_data.py
```

This creates 8 demo users (employees, managers, admin) and sample expenses. **Default password for all: `demo`**

### Test

```bash
pytest tests/ -v
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (email, password) → JWT + user |
| GET | `/api/auth/me` | Get current user (requires JWT) |
| POST | `/api/expenses` | Submit expense (multipart) |
| POST | `/api/expenses/json` | Submit expense (JSON, no file) |
| GET | `/api/expenses` | List expenses (filtered, paginated) |
| GET | `/api/expenses/{id}` | Get expense by ID |
| GET | `/api/approvals/pending` | Pending approvals (manager) |
| POST | `/api/approvals/{id}/approve` | Approve expense |
| POST | `/api/approvals/{id}/reject` | Reject expense (comment required) |
| POST | `/api/approvals/{id}/mark-paid` | Mark as paid (admin) |
| GET | `/api/reports/monthly-summary` | Monthly summary |
| GET | `/api/reports/team-members` | Team members list |
| GET | `/api/users` | List users |
| GET | `/api/export/csv` | Export CSV |

## Demo Users

| Role | Email | Password |
|------|-------|----------|
| Employee | alice@company.com | demo |
| Employee | bob@company.com | demo |
| Manager | frank@company.com | demo |
| Admin | admin@company.com | demo |

## Configuration

Environment variables (optional):

- `SECRET_KEY` - JWT secret (default: change-in-production)
- `DATABASE_URL` - SQLite by default
- `CORS_ORIGINS` - Allowed origins (default includes localhost:5173)

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── database.py       # SQLAlchemy async
│   ├── dependencies.py   # Auth deps
│   ├── core/             # Security, exceptions
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── routers/          # API routes
│   └── services/         # Business logic
├── scripts/
│   └── seed_data.py
├── tests/
└── requirements.txt
```
