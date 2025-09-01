# 🚀 OpSecRun Deployment Guide

## Quick Start (Recommended: Render)

### Option 1: Render (Free Tier Available)
**Best for**: MVP, quick deployment, handles both frontend and backend

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

3. **Environment Variables**:
   - Backend will be available at: `https://your-app-name-api.onrender.com`
   - Frontend will be available at: `https://your-app-name-frontend.onrender.com`

---

## Option 2: Vercel (Great for React)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `VITE_API_URL`: Your API endpoint

---

## Option 3: Docker (Any Cloud Provider)

### Local Testing:
```bash
# Build and run
docker-compose up --build

# Your app will be available at http://localhost:5173
```

### Deploy to any cloud:
- **DigitalOcean App Platform**
- **Google Cloud Run**  
- **AWS ECS**
- **Azure Container Instances**

---

## Option 4: Netlify + Railway

### Frontend (Netlify):
1. Connect your GitHub repo to Netlify
2. Set build command: `cd apps/frontend && pnpm build`
3. Set publish directory: `apps/frontend/dist`

### Backend (Railway):
1. Connect your GitHub repo to Railway
2. Set start command: `cd packages/db && pnpm start`
3. Railway will auto-detect Node.js

---

## 🛠️ Pre-Deployment Checklist

### 1. Environment Setup
Create `.env` files:

**Frontend** (`apps/frontend/.env.production`):
```env
VITE_API_URL=https://your-api-domain.com/api
```

**Backend** (`packages/db/.env`):
```env
NODE_ENV=production
PORT=5173
```

### 2. Database Considerations

**For SQLite (Current)**:
- ✅ Simple deployment
- ⚠️  Single server only
- ⚠️  Data loss if server restarts (use persistent volumes)

**For Production (Recommended)**:
- Upgrade to PostgreSQL or MySQL
- Use managed database services:
  - **Render**: Built-in PostgreSQL
  - **Railway**: PostgreSQL add-on
  - **Supabase**: Full backend-as-a-service

### 3. Build Scripts
The following scripts are ready:

```bash
# Build frontend
cd apps/frontend && pnpm build

# Start backend
cd packages/db && pnpm start

# Full production build (Docker)
docker-compose up --build
```

---

## 🔧 Production Optimizations

### 1. Database Migration (Optional)
To upgrade from SQLite to PostgreSQL:

```bash
# Install PostgreSQL driver
cd packages/db
pnpm add pg @types/pg

# Update database.ts to use PostgreSQL
# (Code changes needed in src/database.ts)
```

### 2. Add Health Checks
Add to `packages/db/index.ts`:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### 3. Add Logging
```bash
cd packages/db
pnpm add winston
```

### 4. Security Headers
```typescript
// Add to packages/db/index.ts
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules apps/frontend/node_modules packages/db/node_modules
   pnpm install
   ```

2. **API Not Found**:
   - Check `VITE_API_URL` environment variable
   - Ensure API endpoints start with `/api`

3. **Database Issues**:
   - Check file permissions for SQLite
   - Use persistent volumes in Docker

4. **CORS Errors**:
   - Update CORS origin in `packages/db/index.ts`
   - Set proper frontend URL

---

## 📊 Monitoring

### Add Basic Analytics:
- **Frontend**: Vercel Analytics, Netlify Analytics
- **Backend**: Render metrics, Railway metrics
- **Database**: Monitor SQLite file size

### Performance:
- **Frontend**: Lighthouse scores
- **Backend**: Response time monitoring
- **Database**: Query performance

---

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Add your own domain
2. **SSL Certificate**: Automatically handled by most platforms
3. **Monitoring**: Set up uptime monitoring
4. **Backups**: Schedule database backups
5. **CI/CD**: Set up automatic deployments on git push

---

## 💡 Recommended First Deployment

**For MVP/Testing**: Use **Render** (Option 1)
- Free tier available
- Handles both frontend and backend
- Automatic deployments from GitHub
- Built-in SSL certificates
- Easy to upgrade later

**For Production**: Use **Vercel + Railway**
- Best React performance (Vercel)
- Dedicated backend hosting (Railway)
- Excellent developer experience
- Easy scaling

Choose the option that best fits your needs and budget! 🚀
