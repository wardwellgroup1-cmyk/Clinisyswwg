# HEDIS CareGap Mobile App - Deployment Guide

## Quick Setup (5 minutes)

### 1. Enable GitHub Pages

1. Go to: https://github.com/wardwellgroup1-cmyk/Clinisyswwg/settings/pages
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will automatically trigger our deploy workflow

3. Wait 1-2 minutes for the first deployment to complete

### Your Default URL (Immediate Access)
```
https://wardwellgroup1-cmyk.github.io/Clinisyswwg/
```

Share this link with providers immediately - it's live with HTTPS right now!

---

## Custom Domain Setup (Optional, 10 minutes)

To use a custom domain like `hedis.yourhealthorg.com`:

### Step 1: Update CNAME File
1. Edit `/CNAME` in the repository
2. Replace `hedis-caregap.example.com` with your actual domain
3. Commit and push

### Step 2: Configure DNS
Point your domain's DNS records to GitHub Pages:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: hedis (or your subdomain)
Value: wardwellgroup1-cmyk.github.io
```

**Option B: A Records (for root domain)**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### Step 3: Verify in GitHub
1. Go back to Settings → Pages
2. Under "Custom domain", enter your domain
3. GitHub will verify DNS and automatically enable HTTPS (takes 24 hours max)

---

## Security & Privacy Notes

✅ **HIPAA Safe**: App runs 100% offline in the browser - no data transmission
✅ **HTTPS**: GitHub Pages provides automatic SSL/TLS encryption
✅ **No Backend**: All processing happens locally on the device
✅ **Voice API**: Works on mobile (HTTPS required - GitHub Pages provides this)

---

## Testing the App

**Desktop**: https://wardwellgroup1-cmyk.github.io/Clinisyswwg/

**Mobile**: 
- iOS: Add to Home Screen for app-like experience
- Android: Use Chrome's "Install app" option

**Voice Recognition**:
- Chrome, Edge, Safari (iOS 14.5+) supported
- Firefox: Partial support

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page shows 404 | Wait 2-3 minutes for deployment to complete |
| Voice not working | Ensure HTTPS is used, enable microphone permission |
| Custom domain not working | Check DNS propagation at https://dns.google.com |
| HTTPS not showing | DNS may take up to 24 hours to propagate |

---

## Updating the App

Simply push changes to the `claude/hedis-caregap-mobile-TTqz2` branch:

```bash
git add .
git commit -m "Your changes"
git push origin claude/hedis-caregap-mobile-TTqz2
```

GitHub Actions will automatically redeploy within seconds!

---

## Support

For questions or issues, contact: wardwellgroup1@gmail.com
