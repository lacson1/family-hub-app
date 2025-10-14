# Docker Setup Guide for Family Hub App

This guide will help you run the Family Hub application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (comes with Docker Desktop)

## Architecture

The application consists of three Docker containers:

1. **PostgreSQL Database** (port 5432)
   - Stores all family hub data
   - Persistent storage using Docker volumes

2. **Backend API** (port 3001)
   - Node.js + Express + TypeScript
   - RESTful API endpoints
   - Connects to PostgreSQL database

3. **Frontend** (port 5173)
   - React + Vite + TypeScript
   - Modern UI with Tailwind CSS
   - Communicates with backend API

## Quick Start

### Step 1: Start All Services

From the root directory of the project, run:

```bash
docker-compose up -d
```

This will:
- Build all Docker images
- Start all containers in detached mode
- Initialize the database with required tables
- Start the backend API
- Start the frontend development server

### Step 2: Access the Application

- **Frontend**: Open [http://localhost:5173](http://localhost:5173) in your browser
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## Available Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (WARNING: Deletes all data)

```bash
docker-compose down -v
```

### Rebuild Containers

```bash
docker-compose up -d --build
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d familyhub
```

### Execute Backend Commands

```bash
# Access backend container
docker-compose exec backend sh

# Run migrations manually
docker-compose exec backend npm run migrate
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get a specific event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Family Members
- `GET /api/family-members` - Get all family members
- `POST /api/family-members` - Create a new family member
- `GET /api/family-members/:id` - Get a specific family member
- `PUT /api/family-members/:id` - Update a family member
- `DELETE /api/family-members/:id` - Delete a family member

### Shopping Items
- `GET /api/shopping-items` - Get all shopping items
- `POST /api/shopping-items` - Create a new shopping item
- `GET /api/shopping-items/:id` - Get a specific shopping item
- `PUT /api/shopping-items/:id` - Update a shopping item
- `DELETE /api/shopping-items/:id` - Delete a shopping item

## Database Schema

### Tasks Table
```sql
- id: UUID (Primary Key)
- title: VARCHAR(255)
- assigned_to: VARCHAR(255)
- due_date: DATE
- priority: VARCHAR(20) (low, medium, high)
- completed: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Events Table
```sql
- id: UUID (Primary Key)
- title: VARCHAR(255)
- date: DATE
- time: TIME
- type: VARCHAR(20) (family, personal, work)
- description: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Family Members Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255)
- role: VARCHAR(100)
- color: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Shopping Items Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255)
- quantity: VARCHAR(100)
- category: VARCHAR(50) (Groceries, Household, Personal, Other)
- notes: TEXT
- purchased: BOOLEAN
- added_by: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Find and stop the process using the port
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # Database
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Reset Everything

```bash
# Stop all containers and remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Development Workflow

### Backend Development

The backend uses hot-reload with nodemon. Any changes to files in `backend/src/` will automatically restart the server.

### Frontend Development

The frontend uses Vite's hot module replacement (HMR). Changes to files in `src/` will automatically update in the browser.

### Making Database Changes

1. Update the schema in `backend/src/database/init.ts`
2. Restart the backend container:
   ```bash
   docker-compose restart backend
   ```

## Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@db:5432/familyhub
NODE_ENV=development
```

### Frontend (`.env.development`)
```
VITE_API_URL=http://localhost:3001/api
```

## Production Deployment

For production, you should:

1. Update `docker-compose.yml` to use production builds
2. Set strong database passwords
3. Configure proper CORS settings
4. Use environment-specific `.env` files
5. Set up SSL/TLS certificates
6. Configure a reverse proxy (nginx)
7. Set up backup strategies for the database

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

