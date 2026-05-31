# Vercel Deployment Guide (Example App)

This project includes a Vite demo app in `example/` and is ready to deploy on Vercel.

## Recommended Setup

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `example`.
3. Confirm build settings:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

`example/vercel.json` is already included and matches these settings.

## Preview and Production

- Every push to your connected branch generates a preview URL.
- Promote your desired deployment to Production from the Vercel dashboard.

## Add Demo Link to Public Docs

After first production deploy, add your demo URL in:
- GitHub README
- npm package README

Suggested format:

```md
Live Demo: https://your-project-name.vercel.app
```
