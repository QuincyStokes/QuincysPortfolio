# Automatic Deployment Setup

This guide will help you set up automatic deployments from GitHub to Render.

## Option 1: GitHub Actions (Recommended)

### Setup Steps:

1. **Get your Render API Token:**
   - Go to your Render dashboard
   - Click on your profile → Account Settings
   - Go to API Keys section
   - Create a new API key
   - Copy the token

2. **Get your Render Service ID:**
   - Go to your service in Render dashboard
   - The service ID is in the URL: `https://dashboard.render.com/web/services/[SERVICE_ID]`
   - Copy the SERVICE_ID

3. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Click Settings → Secrets and variables → Actions
   - Add these secrets:
     - `RENDER_TOKEN`: Your Render API token
     - `RENDER_SERVICE_ID`: Your Render service ID

4. **Push to main branch:**
   - Any push to the `main` branch will automatically trigger a deployment
   - Pull requests will also trigger the workflow (but won't deploy)

### How it works:
- When you push to `main`, GitHub Actions runs
- It installs dependencies and runs tests
- Then triggers a deployment on Render via their API
- Your website updates automatically!

## Option 2: Render Auto-Deploy (Simpler)

If you prefer a simpler setup:

1. **In your Render dashboard:**
   - Go to your service settings
   - Enable "Auto-Deploy"
   - Set the branch to `main`

2. **That's it!** Render will automatically deploy when you push to main.

## Manual Deployment

To manually trigger a deployment:

```bash
npm run deploy
```

Make sure you have the environment variables set:
- `RENDER_TOKEN`
- `RENDER_SERVICE_ID`

## Troubleshooting

- Check GitHub Actions tab for deployment logs
- Verify your secrets are correctly set in GitHub
- Ensure your Render service is active
- Check Render logs for any deployment issues 