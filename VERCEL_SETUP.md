# Deploy HEDIS CareGap to Vercel

## Quick Setup (2 minutes)

### Option 1: Vercel CLI (Fastest)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from this directory:**
   ```bash
   vercel
   ```

3. **Follow the prompts** and get your live URL instantly

---

### Option 2: Vercel Dashboard (No CLI Needed)

1. **Go to:** https://vercel.com/import

2. **Connect your GitHub:**
   - Click "Import Project"
   - Select "wardwellgroup1-cmyk/Clinisyswwg"
   - Choose branch: `claude/hedis-caregap-mobile-TTqz2`

3. **Click "Deploy"** — that's it!

Vercel automatically generates your URL in ~30 seconds:
```
https://clinisyswwg.vercel.app/
```

---

## After Deployment

### Your Live URL
Vercel creates a unique domain automatically:
```
https://clinisyswwg.vercel.app/
```

Share this with providers immediately — it's live with HTTPS!

### Custom Domain (Optional)
In Vercel dashboard:
1. Go to "Domains"
2. Add your custom domain (e.g., `hedis.yourhealthorg.com`)
3. Update DNS records per Vercel's instructions
4. Auto HTTPS in 24 hours

---

## Why Vercel?

✅ **Zero Config** — Works immediately, no setup needed  
✅ **Instant HTTPS** — Always secure  
✅ **Global CDN** — Fast everywhere  
✅ **Auto Redeployment** — Push to GitHub = instant live updates  
✅ **Free Tier** — Full functionality at no cost  
✅ **Voice API Ready** — HTTPS required for mobile voice  

---

## Automatic Redeployment

Any push to `claude/hedis-caregap-mobile-TTqz2` auto-deploys:
```bash
git add .
git commit -m "Update app"
git push origin claude/hedis-caregap-mobile-TTqz2
```

Your live URL updates in seconds!

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 Error | Wait 30 seconds, Vercel is building |
| Build Failed | Make sure index.html is in root directory |
| Voice not working | Ensure you're using HTTPS (Vercel provides this) |

---

## Support
- Vercel Docs: https://vercel.com/docs
- GitHub Integration: https://vercel.com/docs/deployments/git
