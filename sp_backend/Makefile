.PHONY: docker-up docker-down run-backend

docker-up:
	docker-compose -p sp_backend -f docker/docker-compose.yml up -d

docker-down:
	docker-compose -p sp_backend -f docker/docker-compose.yml down

run-backend:
	poetry run uvicorn sp_backend.main:app --reload

migrate:
	poetry run alembic upgrade head

reset-db:
	docker exec -i pgvector-db psql -U student_portal_user -d template1 -c "DROP DATABASE IF EXISTS student_portal;"
	docker exec -i pgvector-db psql -U student_portal_user -d template1 -c "CREATE DATABASE student_portal;"

seed:
	poetry run python scripts/seed.py

setup: reset-db migrate seed
