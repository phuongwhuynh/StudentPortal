# Student Portal Backend

## Local Development Setup

### Prerequisites

- Python 3.12 or newer (recommend [pyenv](https://github.com/pyenv/pyenv) or system Python)
- [Poetry](https://python-poetry.org/) for dependency management
- Docker (for PostgreSQL database)

### 1. Clone the repository

```bash
git clone https://github.com/Tea314/ASE-project.git
cd scams-backend
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

### 3. Install dependencies

```bash
poetry install
```

### 4. Start PostgreSQL with Docker

```bash

# Using Makefile
make docker-up
# Or directly
docker-compose -p sp_backend -f docker/docker-compose.yml up -d
```

### 5. Setup database (migration and seeding)

```bash

# Using Makefile
make setup
# Or directly
docker exec -i pgvector-db psql -U student_portal_user -d template1 -c "DROP DATABASE IF EXISTS student_portal;"
docker exec -i pgvector-db psql -U student_portal_user -d template1 -c "CREATE DATABASE student_portal;"
poetry run alembic upgrade head
poetry run python scripts/seed.py
```

### 6. Start the backend server

```bash

# Using Makefile
make run-backend
# Or directly
poetry run uvicorn sp_backend.main:app --reload
```

- The API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

### Common commands

- Stop database: `make docker-down` or `docker-compose -f ./docker/docker-compose.yml down`
- Reinstall dependencies: `poetry install`
- Add a package: `poetry add <package>`

### Troubleshooting

- Ensure PostgreSQL is running (`docker ps`)
- Check `.env` for correct DB credentials
- If migrations fail, check Alembic config and DB connection

---
