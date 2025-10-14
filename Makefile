.PHONY: help setup start stop restart logs clean rebuild

help:
	@echo "Family Hub App - Make Commands"
	@echo "=============================="
	@echo "make setup     - Initial setup (create env files and start)"
	@echo "make start     - Start all containers"
	@echo "make stop      - Stop all containers"
	@echo "make restart   - Restart all containers"
	@echo "make logs      - View all logs"
	@echo "make clean     - Stop and remove all containers and volumes"
	@echo "make rebuild   - Rebuild and restart all containers"
	@echo ""
	@echo "Service-specific logs:"
	@echo "make logs-backend   - View backend logs"
	@echo "make logs-frontend  - View frontend logs"
	@echo "make logs-db        - View database logs"

setup:
	@echo "Setting up Family Hub App..."
	@mkdir -p backend
	@echo "PORT=3001\nDATABASE_URL=postgresql://postgres:postgres@db:5432/familyhub\nNODE_ENV=development" > backend/.env
	@echo "VITE_API_URL=http://localhost:3001/api" > .env.development
	@docker-compose up -d
	@echo "Setup complete! Access the app at http://localhost:5173"

start:
	@docker-compose up -d
	@echo "Containers started. Access the app at http://localhost:5173"

stop:
	@docker-compose down

restart:
	@docker-compose restart

logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

logs-db:
	@docker-compose logs -f db

clean:
	@echo "WARNING: This will remove all data!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "All containers and volumes removed."; \
	fi

rebuild:
	@docker-compose up -d --build
	@echo "Containers rebuilt and restarted."

