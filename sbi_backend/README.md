# SBI Backend API

## Overview

The **Small Business Investment (SBI) Backend** is a Django-based REST API platform designed to connect Small/Medium Enterprises (SMEs) in Lesotho and South Africa with investors, while providing comprehensive training, marketplace, and analytics capabilities.

The platform enables:
- **SME-Investor Matching**: Intelligent matching algorithm connecting SMEs with compatible investors
- **Training & Capacity Building**: Structured courses covering business planning, financial literacy, pitching, marketing, and legal compliance
- **Marketplace**: B2B marketplace for equipment, materials, services, and export opportunities
- **Payment Processing**: Secure payment integration for transactions
- **Analytics**: Comprehensive platform metrics and user activity tracking
- **Account Management**: Role-based user management (SME, Investor, Admin, Moderator)

---

## Technology Stack

### Core Framework
- **Django 4.2.7** - Web application framework
- **Django REST Framework 3.14.0** - RESTful API toolkit
- **Python 3.x** - Programming language

### Database & Storage
- **PostgreSQL** - Primary relational database (via dj-database-url)
- **Redis 5.0.1** - Caching and Celery message broker
- **AWS S3** (via django-storages) - Cloud file storage
- **SQLParse 0.5.5** - SQL parsing utility

### Authentication & Security
- **djangorestframework-simplejwt 5.3.0** - JWT token authentication
- **django-oauth-toolkit 2.3.0** - OAuth 2.0 framework
- **django-axes 6.2.0** - Brute force protection
- **bcrypt 4.1.1** - Password hashing
- **cryptography 41.0.7** - Encryption utilities

### Task Queue & Scheduling
- **Celery 5.3.4** - Distributed task queue
- **django-celery-beat 2.5.0** - Periodic task scheduler
- **django-celery-results 2.5.1** - Celery result backend
- **Kombu 5.6.2** - Messaging library
- **Vine 5.1.0** - Functional utilities

### API Documentation & Tools
- **drf-yasg 1.21.7** - Swagger/OpenAPI documentation
- **whitenoise 6.6.0** - Static file serving
- **gunicorn 21.2.0** - WSGI HTTP server

### Email & Notifications
- **django-sendgrid-v5 1.2.0** - SendGrid email integration
- **sentry-sdk 1.39.1** - Error tracking and monitoring

### Data Processing & Analytics
- **pandas 2.1.4** - Data manipulation
- **numpy 1.26.4** - Numerical computing
- **openpyxl 3.1.2** - Excel file handling

### Development & Testing
- **pytest 7.4.3** - Testing framework
- **pytest-django 4.7.0** - Django pytest plugin
- **pytest-cov 4.1.0** - Code coverage
- **factory-boy 3.3.0** - Test data generation
- **Faker 20.1.0** - Fake data generation
- **black 23.12.1** - Code formatter
- **flake8 6.1.0** - Linter
- **isort 5.13.2** - Import sorter
- **mypy-extensions 1.1.0** - Type checking

---

## Project Structure

```
sbi_backend_new/
├── sbi_backend/               # Django project configuration
│   ├── settings.py            # Django settings (database, apps, middleware)
│   ├── urls.py                # URL routing configuration
│   ├── wsgi.py                # WSGI application entry point
│   ├── asgi.py                # ASGI application entry point
│   ├── celery.py              # Celery configuration
│   ├── database_router.py     # Multi-database routing
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── verify_security.py     # Security verification utilities
│   └── __pycache__/           # Python cache
│
├── apps/                      # Django applications (modular feature sets)
│
│   ├── accounts/              # User authentication & account management
│   │   ├── models.py          # User model with role support
│   │   ├── views.py           # Auth endpoints (register, login, logout)
│   │   ├── views_security.py  # Security-related views
│   │   ├── serializers.py     # Request/response serializers
│   │   ├── urls.py            # Auth routes
│   │   ├── permissions.py     # Custom permission classes
│   │   ├── security.py        # Security utilities
│   │   ├── signals.py         # Django signals for user events
│   │   ├── admin.py           # Django admin configuration
│   │   └── migrations/        # Database migrations
│   │
│   ├── sme/                   # Small/Medium Enterprise management
│   │   ├── models.py          # SMEProfile model (business info, location)
│   │   ├── views.py           # SME profile endpoints
│   │   ├── serializers.py     # SME data serializers
│   │   ├── urls.py            # SME routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   ├── investor/              # Investor profile & portfolio management
│   │   ├── models.py          # InvestorProfile, Investment models
│   │   ├── views.py           # Investor endpoints
│   │   ├── serializers.py     # Investor data serializers
│   │   ├── urls.py            # Investor routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   ├── matching/              # SME-Investor matching engine
│   │   ├── models.py          # Match model
│   │   ├── algorithm.py       # Matching algorithm logic
│   │   ├── views.py           # Match endpoints
│   │   ├── services.py        # Business logic for matching
│   │   ├── serializers.py     # Match data serializers
│   │   ├── urls.py            # Matching routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   ├── training/              # Training courses & education
│   │   ├── models.py          # Course, Enrollment, Chapter models
│   │   ├── views.py           # Course endpoints
│   │   ├── services.py        # Course enrollment logic
│   │   ├── serializers.py     # Course data serializers
│   │   ├── urls.py            # Training routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   ├── marketplace/           # B2B marketplace for resources
│   │   ├── models.py          # MarketplaceResource, TradeRequest models
│   │   ├── views.py           # Marketplace endpoints
│   │   ├── serializers.py     # Resource data serializers
│   │   ├── urls.py            # Marketplace routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   ├── payments/              # Payment processing & billing
│   │   ├── models.py          # Payment, Transaction models
│   │   ├── views.py           # Payment endpoints
│   │   ├── serializers.py     # Payment data serializers
│   │   ├── urls.py            # Payment routes
│   │   ├── admin.py           # Django admin
│   │   └── migrations/        # Database migrations
│   │
│   └── analytics/             # Platform metrics & analytics
│       ├── models.py          # PlatformMetric, UserActivity models
│       ├── views.py           # Analytics endpoints
│       ├── metrics.py         # Metric calculation utilities
│       ├── serializers.py     # Analytics data serializers
│       ├── urls.py            # Analytics routes
│       ├── admin.py           # Django admin
│       └── migrations/        # Database migrations
│
├── manage.py                  # Django management CLI
├── requirements.txt           # Python package dependencies
├── render.yaml                # Render deployment configuration
├── .env                       # Environment variables (not committed)
├── .runtime.txt               # Python runtime version
├── test_imports.py            # Test script for imports
├── test_supabase_connection.py # Database connection test
│
└── logs/                      # Application logs
    └── security.log          # Security event logs

```

---

## Key Features & Modules

### 1. **Accounts Module** (`apps/accounts/`)
Handles user authentication, profile management, and role-based access control.

**Features:**
- User registration with role selection (SME, Investor, Admin, Moderator)
- JWT-based authentication
- OAuth 2.0 support
- Password hashing with bcrypt
- Multi-factor security options
- User profile management
- Role-based permissions

**Models:**
- `User` - Custom AbstractUser with UUID, role, phone, location

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - User profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

---

### 2. **SME Module** (`apps/sme/`)
Manages Small/Medium Enterprise profiles and business information.

**Features:**
- Comprehensive business profile creation
- Geographic targeting (Lesotho districts, South African provinces)
- Industry classification
- Business metrics (employee count, funding needs, revenue)
- Multi-currency support (Loti, Rand)

**Models:**
- `SMEProfile` - Core SME business profile
- Business details, location, financial information

**Key Endpoints:**
- `GET /api/sme/` - List all SMEs
- `POST /api/sme/` - Create SME profile
- `GET /api/sme/{id}/` - Retrieve SME details
- `PUT /api/sme/{id}/` - Update SME profile
- `DELETE /api/sme/{id}/` - Delete SME profile

---

### 3. **Investor Module** (`apps/investor/`)
Manages investor profiles, portfolio tracking, and investment history.

**Features:**
- Investor profile with investment preferences
- Portfolio value and investment tracking
- Impact metrics (jobs created, SMEs supported, CO2 reduced)
- Investor verification/approval workflow
- Investment history tracking

**Models:**
- `InvestorProfile` - Investor details, preferences, metrics
- `Investment` - Individual investment records

**Key Endpoints:**
- `GET /api/investor/` - List all investors
- `POST /api/investor/` - Create investor profile
- `GET /api/investor/{id}/` - Retrieve investor details
- `PUT /api/investor/{id}/` - Update investor profile
- `GET /api/investor/{id}/investments/` - Investor's investment history

---

### 4. **Matching Module** (`apps/matching/`)
Intelligent algorithm for matching SMEs with compatible investors.

**Features:**
- Similarity scoring algorithm
- Match reasoning with detailed breakdown
- Connection status tracking (pending, accepted, rejected, connected, completed)
- Messaging integration for matched pairs
- Match history and communication logs

**Models:**
- `Match` - Connection between SME and Investor with score

**Algorithms:**
- `algorithm.py` - Scoring and ranking logic based on:
  - Industry alignment
  - Location proximity
  - Funding requirements vs. investor budget
  - Investment preferences

**Key Endpoints:**
- `GET /api/matching/` - Get all matches for user
- `POST /api/matching/find/` - Trigger matching algorithm
- `POST /api/matching/{id}/accept/` - Accept a match
- `POST /api/matching/{id}/reject/` - Reject a match
- `GET /api/matching/{id}/messages/` - Match communication

---

### 5. **Training Module** (`apps/training/`)
Educational courses for SME capacity building.

**Features:**
- Course catalog with multiple categories:
  - Business Planning
  - Financial Literacy
  - Pitch Perfect
  - Marketing
  - Legal Compliance
- Course enrollment and progress tracking
- Beginner, Intermediate, Advanced levels
- Instructor management
- Certificate generation

**Models:**
- `Course` - Course metadata (title, description, instructor, duration)
- `Enrollment` - Student enrollment records
- `Chapter` - Course chapter/lesson structure

**Key Endpoints:**
- `GET /api/training/courses/` - List all courses
- `GET /api/training/courses/{id}/` - Course details
- `POST /api/training/enroll/{id}/` - Enroll in course
- `GET /api/training/enrollments/` - User's enrollments
- `POST /api/training/complete/` - Mark course complete

---

### 6. **Marketplace Module** (`apps/marketplace/`)
B2B marketplace for trading resources and services.

**Features:**
- Equipment, Materials, Services, Export Opportunities
- Resource listing with images
- Geographic filtering (country, city)
- Price and availability management
- Trade request system

**Models:**
- `MarketplaceResource` - Resource/product listing
- `TradeRequest` - Trade/purchase requests

**Key Endpoints:**
- `GET /api/marketplace/resources/` - List marketplace resources
- `POST /api/marketplace/resources/` - Create listing
- `GET /api/marketplace/resources/{id}/` - Resource details
- `POST /api/marketplace/trade-request/` - Create trade request
- `GET /api/marketplace/trade-requests/` - User's trade requests

---

### 7. **Payments Module** (`apps/payments/`)
Payment processing and transaction management.

**Features:**
- Stripe integration for payments
- Transaction tracking
- Invoice generation
- Payment status management
- Refund handling

**Models:**
- `Payment` - Payment records
- `Transaction` - Transaction history

**Key Endpoints:**
- `POST /api/payment/create-charge/` - Create payment
- `GET /api/payment/transactions/` - Transaction history
- `POST /api/payment/verify/` - Verify payment
- `POST /api/payment/refund/` - Request refund

---

### 8. **Analytics Module** (`apps/analytics/`)
Platform-wide metrics and reporting.

**Features:**
- Daily metrics collection and aggregation
- User activity tracking
- Platform-wide KPIs:
  - User count
  - SME count
  - Investor count
  - Match count
  - Investment total
  - Course enrollments
  - Platform revenue
- Weekly and monthly report generation
- Activity cleanup

**Models:**
- `PlatformMetric` - Daily aggregated metrics
- `UserActivity` - Per-user activity tracking

**Key Endpoints:**
- `GET /api/analytics/metrics/` - Get platform metrics
- `GET /api/analytics/metrics/{type}/` - Metrics by type
- `GET /api/analytics/activity/` - User activity logs
- `GET /api/analytics/reports/` - Generated reports

---

## Database Schema

### Core Tables
- **users** - User accounts (accounts.User)
- **sme_profiles** - SME business profiles (sme.SMEProfile)
- **investor_profiles** - Investor profiles (investor.InvestorProfile)
- **matches** - SME-Investor connections (matching.Match)
- **investments** - Individual investments (investor.Investment)

### Educational
- **courses** - Training courses (training.Course)
- **enrollments** - Student enrollments (training.Enrollment)
- **chapters** - Course chapters (training.Chapter)

### Marketplace
- **marketplace_resources** - Marketplace listings (marketplace.MarketplaceResource)
- **trade_requests** - Trade requests (marketplace.TradeRequest)

### Financial
- **payments** - Payment records (payments.Payment)
- **transactions** - Transaction logs (payments.Transaction)

### Analytics
- **platform_metrics** - Daily platform metrics (analytics.PlatformMetric)
- **user_activity** - User activity tracking (analytics.UserActivity)

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,sbi-app.onrender.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sbi_db

# Redis (Celery & Cache)
REDIS_URL=redis://localhost:6379/0

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=sbi-bucket

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key

# Stripe (Payments)
STRIPE_API_KEY=your-stripe-key
STRIPE_PUBLIC_KEY=your-stripe-public-key

# Security
JWT_SECRET=your-jwt-secret
```

### Settings Structure (`sbi_backend/settings.py`)

**Key configurations:**
- **Installed Apps**: All 8 feature apps registered
- **Middleware**: CORS, security headers, authentication
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis-based cache
- **Celery**: Async task queue with beat scheduler
- **JWT**: Token authentication with 1-hour access, 7-day refresh
- **CORS**: Frontend origin whitelisting
- **Static Files**: WhiteNoise for production serving
- **Sentry**: Error tracking integration

---

## API Architecture

### Authentication Flow
1. User registers with email, password, and role
2. System returns JWT access token and refresh token
3. Client includes access token in `Authorization: Bearer <token>` header
4. Tokens auto-refresh; refresh token valid for 7 days

### Request/Response Pattern
All API endpoints follow REST conventions:
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Full update
- `PATCH` - Partial update
- `DELETE` - Remove resources

**Response Format:**
```json
{
  "data": { /* resource data */ },
  "meta": { "page": 1, "count": 10 },
  "status": "success"
}
```

**Error Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Rate Limiting & Security
- Django-axes: Brute force protection (limit login attempts)
- CORS headers: API access control
- JWT token validation
- Permission classes: Role-based access control

---

## Async Tasks (Celery)

### Scheduled Tasks
- **update-daily-metrics** - Daily at 00:00 (Africa/Maseru)
- **generate-weekly-report** - Mondays at 09:00
- **generate-monthly-report** - 1st of month at 10:00
- **cleanup-old-activities** - Daily cleanup of old logs

### Task Examples
```python
# In apps/analytics/tasks.py
@shared_task
def update_daily_metrics():
    """Calculate and store daily platform metrics"""
    
@shared_task
def generate_weekly_report():
    """Generate weekly performance report"""
```

---

## Testing

### Test Framework
- **pytest** with Django plugin
- **Factory-boy** for test data generation
- **Coverage reporting** (pytest-cov)

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps

# Run specific test file
pytest tests/apps/accounts/test_auth.py

# Run specific test
pytest tests/apps/accounts/test_auth.py::test_user_registration
```

### Test Structure
```
tests/
├── apps/
│   ├── accounts/
│   │   ├── test_auth.py
│   │   ├── test_permissions.py
│   │   └── test_security.py
│   ├── sme/
│   │   └── test_sme_profile.py
│   ├── investor/
│   │   └── test_investor.py
│   ├── matching/
│   │   └── test_algorithm.py
│   ├── training/
│   │   └── test_courses.py
│   └── ...
└── conftest.py  # Shared fixtures
```

---

## Development Workflow

### Setup
```bash
# 1. Clone repository
git clone <repo>
cd sbi_backend_new

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Run development server
python manage.py runserver
```

### Running Services Locally

**Terminal 1: Django Server**
```bash
python manage.py runserver
```

**Terminal 2: Redis Server** (for caching/Celery)
```bash
redis-server
```

**Terminal 3: Celery Worker** (async tasks)
```bash
celery -A sbi_backend worker -l info
```

**Terminal 4: Celery Beat** (scheduled tasks)
```bash
celery -A sbi_backend beat -l info
```

### Code Quality

**Format code with Black:**
```bash
black apps/
```

**Sort imports:**
```bash
isort apps/
```

**Lint with flake8:**
```bash
flake8 apps/ --max-line-length=100
```

**Type checking:**
```bash
mypy apps/
```

---

## Deployment

### Render Deployment

The `render.yaml` file configures deployment on Render:

```yaml
services:
  - type: web
    name: sbi-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
    startCommand: gunicorn sbi_backend.wsgi:application
    envVars:
      - DEBUG: false
      - ALLOWED_HOSTS: sbi-app.onrender.com
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy (automatic on push, or manual trigger)

---

## API Documentation

### Swagger UI
Access interactive API documentation at:
- **Swagger**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

### Health Check
```bash
curl http://localhost:8000/api/health/
# Response: {"status": "ok"}
```

---

## Monitoring & Logging

### Sentry Integration
All errors automatically tracked and reported to Sentry for monitoring production issues.

### Security Logging
Security events logged to `logs/security.log`:
- Failed login attempts (via django-axes)
- Suspicious API patterns
- Permission violations

### Application Logs
- Standard Django logging configured in settings
- Log level: INFO in production, DEBUG in development
- Rotation: Daily with 7-day retention

---

## Performance Considerations

### Database Optimization
- Indexed fields: email, role, resource_type, country, created_at, match_score
- Unique constraints on critical fields
- Connection pooling enabled

### Caching Strategy
- Redis cache for:
  - User sessions
  - Frequently accessed profiles
  - Matching algorithm results
  - Analytics metrics
- Cache TTL: 1 hour (configurable)

### Async Processing
- Heavy computations via Celery:
  - Matching algorithm runs asynchronously
  - Report generation deferred
  - Email notifications sent via queue
  - Cleanup tasks scheduled

---

## Security Features

### Authentication
- JWT tokens with short expiry (1 hour)
- Refresh token rotation
- Password hashing with bcrypt
- OAuth 2.0 support

### Authorization
- Role-based access control (SME, Investor, Admin, Moderator)
- Custom permission classes per endpoint
- Object-level permissions

### Attack Prevention
- Django-axes: Brute force protection
- CORS headers: Prevent cross-origin attacks
- CSRF protection: On state-changing operations
- SQL injection: Django ORM parameterized queries
- XSS protection: Serializer input validation

### Data Protection
- HTTPS enforced in production
- Sensitive fields hashed/encrypted
- PII handled with care
- GDPR compliance ready

---

## Common Tasks

### Create New Feature App
```bash
python manage.py startapp myfeature
```

### Database Migrations
```bash
# Create migration for model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

### Admin Tasks
```bash
# Create admin user
python manage.py createsuperuser

# Shell access
python manage.py shell
```

### Static Files (Production)
```bash
# Collect static files for production
python manage.py collectstatic --noinput
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Check DATABASE_URL in .env
Verify PostgreSQL is running
Test connection: python test_supabase_connection.py
```

**2. Redis Connection Error**
```
Check REDIS_URL in .env
Verify Redis server is running (redis-server)
```

**3. Migrations Failed**
```bash
# Rollback to specific migration
python manage.py migrate appname 0001

# Re-run migrations
python manage.py migrate
```

**4. Celery Tasks Not Running**
```
Verify Redis is running
Check Celery worker: celery -A sbi_backend inspect active
Check Celery logs for errors
```

**5. JWT Token Expired**
```
Use refresh token to get new access token
POST /api/auth/token/refresh/
Include: {"refresh": "your-refresh-token"}
```

---

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following code style (Black, isort, flake8)
3. Add tests for new functionality
4. Ensure all tests pass: `pytest`
5. Submit pull request with description

---

## Future Enhancements

- [ ] GraphQL API alongside REST
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced matching ML model
- [ ] Mobile app backend optimization
- [ ] Multi-language support
- [ ] Blockchain integration for contracts
- [ ] Advanced analytics dashboard
- [ ] Video conferencing for investor-SME meetings
- [ ] Automated document processing
- [ ] AI-powered business advice chatbot

---

## Support & Contact

For issues, questions, or contributions:
- GitHub Issues: [Link to repo]
- Email: support@sbi-app.com
- Documentation: [Link to docs]

---

## License

This project is proprietary and confidential.

---

**Last Updated:** June 2026
**Version:** 1.0
**Status:** Active Development
