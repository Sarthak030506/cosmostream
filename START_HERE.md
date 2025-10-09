# 🚀 Start Here - CosmoStream Setup

## ✅ What You Have

- ✅ Node.js v22.16.0 installed
- ✅ Docker Desktop installed
- ✅ npm packages installed (860 packages)

## 🎯 Quick Start (3 Steps)

### Step 1: Start Docker Desktop

**Important**: Make sure Docker Desktop is running!

1. Open Docker Desktop application
2. Wait for "Docker is running" status
3. You should see the Docker icon in your system tray

### Step 2: Copy Environment Files

```bash
cd C:\Users\hp\Desktop\CosmoStream

# Copy environment files
copy apps\api\.env.example apps\api\.env.local
copy apps\web\.env.example apps\web\.env.local
copy apps\media-processor\.env.example apps\media-processor\.env.local
copy apps\realtime\.env.example apps\realtime\.env.local
```

### Step 3: Start Services

```bash
# Start database services
docker-compose up -d postgres redis

# Wait 10 seconds for databases to start
timeout /t 10

# Start the application
npm run dev
```

## 🌐 Access Your Application

After running `npm run dev`:

- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4001

## 🧪 Test Credentials

```
Email: viewer@cosmostream.com
Password: password123
```

## 📝 Common Commands

```bash
# Start everything
docker-compose up -d
npm run dev

# Stop Docker services
docker-compose down

# View logs
docker-compose logs -f

# Restart everything
docker-compose restart
npm run dev

# Clean and reinstall
npm run clean
npm install
```

## ⚠️ Troubleshooting

### Docker Desktop Not Running

**Error**: "unable to get image" or "connection refused"

**Solution**:
1. Open Docker Desktop
2. Wait for it to fully start (green icon)
3. Try again

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Kill process on specific port
npx kill-port 3000
npx kill-port 4000
```

### Database Connection Failed

**Solution**:
```bash
# Restart database
docker-compose restart postgres redis

# Check if running
docker ps
```

### npm install issues

**Solution**:
```bash
# Clear cache and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📦 What's Included

### Frontend (apps/web)
- Next.js 14 + React 18
- Tailwind CSS
- Apollo Client (GraphQL)
- Video.js player
- Three.js (3D visualizations)

### Backend (apps/api)
- GraphQL API (Apollo Server)
- PostgreSQL database
- Redis cache
- JWT authentication
- Stripe payments

### Services
- **PostgreSQL**: User data, videos, forums
- **Redis**: Caching, sessions, job queue
- **Elasticsearch**: Search (optional)

## 🎓 Next Steps

1. **Explore the Frontend**
   - Browse to http://localhost:3000
   - Check out the home page
   - Try the navigation

2. **Test the GraphQL API**
   - Open http://localhost:4000/graphql
   - Try example queries:

   ```graphql
   query {
     videos(limit: 5) {
       id
       title
       creator {
         name
       }
     }
   }
   ```

3. **Check the Database**
   ```bash
   # Connect to PostgreSQL
   docker exec -it cosmostream-postgres psql -U postgres -d cosmostream

   # List tables
   \dt

   # Query users
   SELECT id, email, name, role FROM users;

   # Exit
   \q
   ```

4. **View Documentation**
   - `README.md` - Project overview
   - `docs/GETTING_STARTED.md` - Detailed setup
   - `docs/ARCHITECTURE.md` - System architecture
   - `CONTRIBUTING.md` - How to contribute

## 🔧 Development Workflow

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Start development servers (hot reload)
npm run dev

# 3. Make changes to code
# Files auto-reload on save

# 4. Run tests
npm test

# 5. Check code quality
npm run lint

# 6. Format code
npm run format
```

## 📊 Project Structure

```
CosmoStream/
├── apps/
│   ├── web/              ← Frontend (Next.js)
│   ├── api/              ← GraphQL API
│   ├── media-processor/  ← Video processing
│   └── realtime/         ← WebSocket server
├── packages/
│   └── shared/           ← Shared TypeScript types
├── database/             ← SQL schemas
├── infrastructure/       ← AWS Terraform
└── docs/                 ← Documentation
```

## 💡 Tips

1. **Use Turbo for Speed**
   ```bash
   # Run specific app
   npm run dev --filter=web
   npm run dev --filter=api
   ```

2. **Use Makefile Commands**
   ```bash
   make dev          # Start everything
   make docker-up    # Start Docker
   make docker-logs  # View logs
   make db-shell     # Database shell
   ```

3. **Hot Reload**
   - Frontend and API auto-reload on file changes
   - No need to restart manually

4. **Debug Mode**
   ```bash
   # API with debug logs
   cd apps/api
   NODE_ENV=development npm run dev
   ```

## 🆘 Need Help?

1. Check `docs/` folder for detailed guides
2. Review error messages in terminal
3. Check Docker Desktop logs
4. Restart Docker and try again

## 🎉 You're Ready!

Once Docker Desktop is running, execute:

```bash
docker-compose up -d
npm run dev
```

Then open http://localhost:3000 and start exploring! 🚀
