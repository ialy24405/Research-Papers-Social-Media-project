#!/bin/bash

# Fast Development Setup Script
echo "🚀 Starting Papers Project with Fast Compilation..."

# Kill any existing processes on port 3000
echo "🔄 Stopping any existing processes on port 3000..."
taskkill /f /im node.exe 2>nul || echo "No Node processes to kill"

# Start development server in background
echo "🛠️  Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 8

# Run warmup to pre-compile all routes
echo "🔥 Pre-compiling all routes (this will take ~6 seconds)..."
npm run warmup

echo "✅ Setup complete! All routes are now pre-compiled."
echo "🌐 Your app is ready at: http://localhost:3000"
echo "⚡ All pages should now load instantly!"
echo ""
echo "Press Ctrl+C to stop the development server."

# Wait for the development server
wait $DEV_PID
