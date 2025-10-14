#!/bin/bash

# Family Hub App - Cleanup Script
# This script stops and removes all Docker containers and volumes

echo "🧹 Family Hub App - Cleanup Script"
echo "==================================="
echo ""
echo "⚠️  WARNING: This will remove all data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🛑 Stopping containers..."
docker-compose down

echo ""
read -p "Do you want to remove database volumes? This will delete all data. (yes/no): " remove_volumes

if [ "$remove_volumes" = "yes" ]; then
    echo "🗑️  Removing volumes..."
    docker-compose down -v
    echo "✅ Volumes removed"
else
    echo "✅ Volumes preserved"
fi

echo ""
echo "✨ Cleanup complete!"

