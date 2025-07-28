# 🎯 AWS Amplify - دليل النشر السريع

## 🚀 خطوات النشر على AWS Amplify

### 1. تحضير متغيرات البيئة
```bash
# Required Environment Variables for Production:

DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms

NEXTAUTH_SECRET=sabq-cms-2025-production-secret-key-very-secure-32chars

NEXTAUTH_URL=https://main.d3xample.amplifyapp.com
# ↑ سيتم تحديثه بعد النشر

# Optional (if used):
OPENAI_API_KEY=sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c
ELEVENLABS_API_KEY=sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c
```

### 2. AWS Amplify Console Steps

#### خطوة 1: إنشاء التطبيق
```
1. Login to AWS Console
2. Search: "Amplify" → AWS Amplify
3. Click: "Create new app"
4. Choose: "Host web app"
5. Select: "GitHub"
6. Authorize AWS Amplify with GitHub
```

#### خطوة 2: اختيار Repository
```
1. Select repository: sabq4org/sabq-ai-cms
2. Select branch: main
3. Click: "Next"
```

#### خطوة 3: Build Settings
```yaml
# AWS Amplify will auto-detect Next.js, but verify:
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

#### خطوة 4: Environment Variables
```
Add these environment variables:

Name: DATABASE_URL
Value: postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms

Name: NEXTAUTH_SECRET  
Value: sabq-cms-2025-production-secret-key-very-secure-32chars

Name: NEXTAUTH_URL
Value: https://YOUR-APP-URL (will be provided after deployment)

Name: OPENAI_API_KEY
Value: sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c

Name: ELEVENLABS_API_KEY  
Value: sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c
```

#### خطوة 5: Review and Deploy
```
1. Review all settings
2. Click: "Save and deploy"
3. Wait for build to complete (5-10 minutes)
4. Get your app URL: https://main.d1234567890.amplifyapp.com
```

### 3. Post-Deployment Steps

#### تحديث NEXTAUTH_URL:
```
1. Copy your Amplify app URL
2. AWS Amplify → Environment variables → Edit
3. Update NEXTAUTH_URL with your actual URL
4. Redeploy if necessary
```

#### اختبار الموقع:
```
1. Visit your live URL
2. Test login functionality
3. Test article creation/editing
4. Test database connectivity
5. Verify all features work
```

## 🔧 Troubleshooting

### مشاكل شائعة:

#### Build Failed:
```bash
# Check build logs in Amplify console
# Common issues:
- Missing environment variables
- Node.js version mismatch
- Package dependency issues
```

#### Database Connection Issues:
```bash
# Verify RDS Security Groups allow connections from:
- Amplify's IP ranges (or use 0.0.0.0/0 temporarily)
- Port 5432 is open
- DATABASE_URL is correctly formatted
```

#### Authentication Issues:
```bash
# Ensure:
- NEXTAUTH_SECRET is set
- NEXTAUTH_URL matches your domain exactly
- No trailing slashes in URLs
```

## 📊 Performance Optimization

### After Successful Deployment:

#### 1. Custom Domain (Optional):
```
1. AWS Amplify → Domain management
2. Add custom domain
3. Configure DNS
4. SSL certificate (automatic)
```

#### 2. Monitoring:
```
- CloudWatch logs
- Performance metrics
- Error tracking
```

#### 3. Caching:
```
- CDN (included with Amplify)
- API response caching
- Static asset optimization
```

## 🎯 Success Checklist

### ✅ Pre-deployment:
- [ ] GitHub repository updated
- [ ] Environment variables prepared
- [ ] AWS RDS accessible
- [ ] Local testing successful

### ✅ During deployment:
- [ ] Amplify app created
- [ ] GitHub connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment triggered

### ✅ Post-deployment:
- [ ] App URL obtained
- [ ] NEXTAUTH_URL updated
- [ ] Site functionality tested
- [ ] Database operations verified
- [ ] Performance checked

## 🚀 Your App is Live!

Once deployed successfully:
```
🌐 Live URL: https://main.d[random].amplifyapp.com
📊 Status: Production Ready
🔒 SSL: Enabled (automatic)
🌍 CDN: Global distribution
📈 Scaling: Automatic
```

---

**Next Step**: Tomorrow's S3 image setup! 📸
