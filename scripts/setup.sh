#!/bin/bash

# Family Hub App - Setup Script
# This script sets up the development environment

echo "🏠 Family Hub App - Setup Script"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOL
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@db:5432/familyhub
NODE_ENV=development
EOL
    echo "✅ Created backend/.env"
else
    echo "✓ backend/.env already exists"
fi

# Create frontend .env.development file if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development file..."
    echo "VITE_API_URL=http://localhost:3001/api" > .env.development
    echo "✅ Created .env.development"
else
    echo "✓ .env.development already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001/api"
echo "  Health:   http://localhost:3001/api/health"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # View all logs"
echo "  docker-compose logs -f backend  # View backend logs"
echo "  docker-compose down             # Stop all services"
echo "  docker-compose restart          # Restart all services"
echo ""

