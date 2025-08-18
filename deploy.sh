#!/bin/bash

# Deploy script for Beatriz Sousa Appointment System
echo "🚀 Starting deployment of Beatriz Sousa Appointment System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your database password and session secret before continuing."
    read -p "Press Enter after editing .env file..."
fi

# Generate random session secret if not set
if grep -q "your-very-secure-random-session-secret-here" .env; then
    echo "🔐 Generating random session secret..."
    SESSION_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-very-secure-random-session-secret-here/$SESSION_SECRET/g" .env
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Push database schema
echo "📊 Pushing database schema..."
docker-compose exec app npm run db:push

# Create default admin user
echo "👤 Creating default admin user..."
docker-compose exec app node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if admin exists
    const result = await pool.query('SELECT * FROM admin WHERE username = \$1', ['admin']);
    
    if (result.rows.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admin (username, password) VALUES (\$1, \$2)',
        ['admin', hashedPassword]
      );
      console.log('✅ Default admin created - username: admin, password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
"

echo "✅ Deployment complete!"
echo ""
echo "🌐 Application is running on: http://localhost:5000"
echo "🔑 Admin login: username=admin, password=admin123"
echo ""
echo "📋 To check logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"