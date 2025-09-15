#!/bin/bash

# Start both frontend and backend
echo "Starting ScholarStream Unified Application..."

# Start backend in background
cd /app/src/server && node dist/server.js &
BACKEND_PID=$!

# Start frontend
cd /app && node server.js &
FRONTEND_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID