# 🔍 DigitalOcean App Platform Troubleshooting Guide

## 🚨 Current Issue: 503/504 Service Unavailable

### Problem Analysis
- **Error**: DigitalOcean App Platform failed to forward request
- **Status**: 503 Service Unavailable / 504 Gateway Timeout
- **Domain**: https://sabq.io
- **Impact**: No data loading from database

### 🔧 Step-by-Step Fix

#### 1. Check Environment Variables
Go to: **DigitalOcean App Platform → sabq.io app → Settings → Environment Variables**

**Required Variables:**
```
DATABASE_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=https://sabq.io
NODE_ENV=production
PORT=3000
```

#### 2. Update App Configuration
- **Source**: GitHub `production-branch`
- **Build Command**: Use `Dockerfile` (should be auto-detected)
- **Run Command**: `npm start` or auto

#### 3. Check Build Logs
1. Go to **Deployments** tab
2. Check latest deployment logs
3. Look for errors in:
   - Dependencies installation
   - Prisma generation
   - Database connection
   - App startup

#### 4. Common Fixes

**If build fails:**
- Ensure `production-branch` is selected
- Check if Dockerfile is working
- Verify package.json scripts

**If database connection fails:**
- Test DATABASE_URL format
- Check Supabase database status
- Verify firewall/network access

**If app starts but crashes:**
- Check environment variables
- Look for missing dependencies
- Check Prisma client generation

#### 5. Force Redeploy
1. **Settings → General**
2. **Trigger Deployment**
3. Wait 10-15 minutes for build completion

### 🧪 Testing After Fix

**Test endpoints:**
```bash
curl https://sabq.io/api/categories
curl https://sabq.io/api/test-db
```

**Expected responses:**
- `200 OK` with data
- No 503/504 errors

### 🆘 Emergency Fallback

If DigitalOcean continues to fail:
1. **Use AWS Amplify** (backup deployment)
2. **Update DNS** to point to Amplify
3. **Environment Variables** from `amplify-supabase-env.txt`

---

**Last Updated**: July 28, 2025
**Database**: Supabase PostgreSQL
**Branch**: production-branch
