# Backend Deployment Guide

## Deploy Backend to Render (Free)

1. **Push code to GitHub** (including the new render.yaml file)

2. **Go to [Render](https://render.com)**
   - Sign in with GitHub
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `dinitheth/certichainv01`
   - Render will auto-detect `render.yaml`

3. **Add Environment Variable**
   - In the Render dashboard, go to your service
   - Environment → Add Environment Variable:
     - Key: `DATABASE_URL`
     - Value: `postgresql://neondb_owner:npg_EXTwkH4fja2B@ep-royal-dust-ahp805yo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`

4. **Copy your backend URL** (e.g., `https://certichain-api.onrender.com`)

## Configure Netlify Frontend

1. **Go to your Netlify site dashboard**

2. **Site configuration → Environment variables**

3. **Add variable:**
   - Key: `VITE_API_URL`
   - Value: `https://certichain-api.onrender.com` (your Render backend URL)

4. **Redeploy site** (Deploys → Trigger deploy → Deploy site)

## Alternative: Deploy Backend to Railway (Also Free)

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add environment variable: `DATABASE_URL` (same value as above)
5. Railway will give you a URL like `https://certichain-api.up.railway.app`
6. Use this URL in Netlify's `VITE_API_URL` environment variable

## Testing Locally

Make sure your `.env.local` has:
```
VITE_API_URL=http://localhost:3001
```

This keeps localhost working for development!
