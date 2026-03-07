# Supabase Keep-Alive Setup Guide

This GitHub Action automatically pings your Supabase database to prevent it from being paused due to inactivity (common on Free Tier plans).

## 🚀 Quick Setup

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **CYF Customs** (jushzjpeetegcjyikclb)
3. Navigate to **Settings** → **API**
4. Copy the `service_role` key (⚠️ **NOT** the `anon` key)
   - ⚠️ **Important**: This key has admin privileges - keep it secret!

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

#### Secret 1: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://jushzjpeetegcjyikclb.supabase.co
```

#### Secret 2: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [paste your service_role key here]
```

### Step 3: Test the Workflow

1. Go to **Actions** tab in your GitHub repo
2. Select **Keep Supabase Database Active** workflow
3. Click **Run workflow** → **Run workflow** (manual trigger)
4. Wait ~30 seconds and check if it runs successfully ✅

## ⚙️ Configuration

### Current Schedule
- **Frequency**: Monday and Thursday at 9:00 AM UTC
- **Cron**: `0 9 * * 1,4`

### Modify Schedule

Edit `.github/workflows/keep-supabase-active.yml` line 6:

```yaml
# Daily at 9 AM UTC
- cron: '0 9 * * *'

# Every 3 days at noon UTC
- cron: '0 12 */3 * *'

# Monday, Wednesday, Friday at 8 AM UTC
- cron: '0 8 * * 1,3,5'
```

Use [crontab.guru](https://crontab.guru) to generate custom schedules.

## 🔍 How It Works

1. GitHub Actions runs on schedule
2. Installs Supabase client
3. Executes a simple query: `SELECT id FROM calculator_rates LIMIT 1`
4. Logs success or failure
5. Database stays active! 🎉

## 📊 Monitoring

### Check Workflow Status
- Go to **Actions** tab in GitHub
- View recent runs and logs
- Green checkmark ✅ = Success
- Red X ❌ = Failed (check logs)

### Common Issues

**Issue**: "Missing Supabase credentials"
- **Fix**: Verify GitHub Secrets are named correctly (exact match)

**Issue**: "Database query failed"
- **Fix**: Check if `calculator_rates` table exists in Supabase

**Issue**: Workflow doesn't run
- **Fix**: Ensure workflow file is in `main` branch

## 💰 Cost

- **GitHub Actions**: FREE (2,000 minutes/month on free tier)
- **This workflow**: Uses ~1 minute per run = ~8 minutes/month
- **Total cost**: $0 💚

## 🎯 Why This Matters

Without this:
- Supabase pauses DB after ~7 days of inactivity
- First user experiences 10-20 second delay while DB "wakes up"
- Poor UX for calculator/configurator users

With this:
- Database always ready
- Instant response times
- Happy users! 😊

## 🔐 Security Notes

- ✅ Service role key is stored in GitHub Secrets (encrypted)
- ✅ Never commit service role key to code
- ✅ Logs don't expose sensitive data
- ⚠️ Service role key has admin access - only use in trusted workflows

## 📝 Alternative Solutions

If you upgrade to Supabase **Pro plan** ($25/month):
- No automatic pausing
- Better performance
- Can remove this workflow

---

**Need help?** Check GitHub Actions logs or Supabase dashboard for detailed error messages.
