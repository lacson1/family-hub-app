# Progressive Web App (PWA) Setup Guide

## 🎯 What is a PWA?

A Progressive Web App is a website that works like a native app. It can be:
- **Installed** on devices (home screen on mobile, app drawer on desktop)
- **Used offline** (after initial load)
- **Launched** from home screen like a native app
- **Fast** with cached assets
- **Engaging** with push notifications

## ✅ What We've Implemented

### 1. App Manifest (`public/manifest.json`)

The manifest tells the browser how to install and display your app:

```json
{
  "name": "Family Hub - Stay Connected & Organized",
  "short_name": "Family Hub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

**Features**:
- Custom name and icon
- Standalone display (no browser UI)
- Theme color (status bar on mobile)
- Shortcuts (quick access to different tabs)

### 2. Service Worker (`public/sw.js`)

The service worker enables offline functionality:

**Caching Strategy**:
- **App Shell**: Cached on install (HTML, CSS, JS)
- **API Calls**: Network-first, fallback to cache
- **Images**: Cache on first load

**Features**:
- Offline support
- Push notifications (infrastructure ready)
- Background sync (can be added)
- Update management

### 3. App Icons

Two SVG icons that scale to any size:
- `icon-192.svg` - For mobile home screen
- `icon-512.svg` - For app drawer and splash screen

**Design**: House with heart (family + home concept)

### 4. Install Prompt Component

`PWAInstallPrompt.tsx` shows a friendly banner prompting users to install:

**Features**:
- Appears automatically on first visit
- Can be dismissed
- Remembers dismissal in localStorage
- Modern, branded design

### 5. Install Status Component

`PWAInstallStatus.tsx` shows a green badge when running as installed app.

---

## 📱 How to Test PWA Features

### Prerequisites

PWAs require one of:
- ✅ HTTPS connection
- ✅ Localhost (for development)

HTTP won't work (except on localhost).

### Testing Locally

#### Step 1: Build Production Version

```bash
npm run build
npm run preview
```

This creates an optimized production build and serves it.

#### Step 2: Open in Browser

Navigate to `http://localhost:4173` (or whatever port Vite shows)

#### Step 3: Check PWA Features

**In Chrome/Edge**:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" - should show your app details
4. Check "Service Workers" - should show registered worker
5. Look for install icon in address bar (⊕ or install button)

**In Firefox**:
1. Look for install icon in address bar
2. Or go to about:debugging → This Firefox → Service Workers

**In Safari**:
1. Click Share button
2. Look for "Add to Home Screen"

### Step 4: Install the App

**Desktop (Chrome/Edge)**:
1. Click install icon in address bar
2. Or: Menu → Install Family Hub
3. App opens in standalone window
4. App added to:
   - Start Menu (Windows)
   - Applications folder (Mac)
   - App drawer (Chrome OS)

**Mobile (iOS)**:
1. Tap Share button (square with arrow)
2. Scroll down, tap "Add to Home Screen"
3. Confirm
4. Icon appears on home screen

**Mobile (Android)**:
1. Tap menu (⋮)
2. Tap "Install app" or "Add to Home Screen"
3. Confirm
4. Icon appears in app drawer and home screen

### Step 5: Test Offline

1. Open installed app
2. Browse around (load all tabs)
3. Turn off WiFi / enable Airplane mode
4. Refresh the app
5. App should still load (cached version)
6. API calls will fail gracefully

### Step 6: Test App Shortcuts

**Desktop**:
- Right-click app icon → see shortcuts
- Or: Click and hold app icon

**Mobile**:
- Long-press app icon → see shortcuts

You should see:
- Tasks
- Shopping List
- Meal Planner
- Calendar

---

## 🔧 Converting SVG Icons to PNG

For best compatibility, convert SVG icons to PNG:

### Option 1: Automated Script

```bash
./scripts/generate-icons.sh
```

This will try to use:
1. ImageMagick (`convert`)
2. librsvg (`rsvg-convert`)
3. Inkscape

### Option 2: Manual Installation

**Mac**:
```bash
brew install imagemagick
./scripts/generate-icons.sh
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt install imagemagick
./scripts/generate-icons.sh
```

**Windows**:
1. Download ImageMagick from https://imagemagick.org/
2. Run:
```bash
magick convert public/icon-192.svg public/icon-192.png
magick convert public/icon-512.svg public/icon-512.png
```

### Option 3: Online Conversion

1. Go to https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
2. Upload `public/icon-192.svg`
3. Convert to PNG (192x192)
4. Save as `public/icon-192.png`
5. Repeat for `icon-512.svg` (512x512)

### Option 4: Update Manifest

After generating PNGs, update `public/manifest.json`:

```json
"icons": [
  {
    "src": "/icon-192.png",  // Changed from .svg
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512.png",  // Changed from .svg
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

---

## 🚀 Deploying PWA to Production

### Requirements

1. **HTTPS**: Mandatory for PWA features (except localhost)
2. **Service Worker Scope**: Must be served from root `/`
3. **Valid Manifest**: Must be accessible and valid JSON
4. **Icons**: Must be accessible and correct sizes

### Recommended Hosting Platforms

All provide automatic HTTPS:

#### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 3. Cloudflare Pages
1. Push to GitHub
2. Connect repo in Cloudflare dashboard
3. Auto-deploy on push

#### 4. Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### Deployment Checklist

- [ ] Build production version (`npm run build`)
- [ ] Test locally with `npm run preview`
- [ ] Convert icons to PNG (or ensure SVG support)
- [ ] Update manifest with production URLs
- [ ] Deploy to HTTPS hosting
- [ ] Test PWA features on production URL
- [ ] Test install on mobile device
- [ ] Test offline functionality
- [ ] Validate with Lighthouse (Chrome DevTools)

---

## 📊 Testing with Lighthouse

Lighthouse audits PWA quality.

### Run Lighthouse

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ PWA
4. Click "Analyze page load"

### PWA Criteria

You should score 100% on PWA if:
- ✅ Served over HTTPS
- ✅ Valid manifest
- ✅ Service worker registered
- ✅ Icons present (192px and 512px)
- ✅ Viewport meta tag
- ✅ Theme color meta tag

### Common Issues

**Issue**: "Page does not work offline"
- **Fix**: Ensure service worker is caching app shell
- **Test**: Load page, go offline, reload

**Issue**: "No matching service worker detected"
- **Fix**: Check service worker registration in `index.html`
- **Test**: Check "Application → Service Workers" in DevTools

**Issue**: "Manifest does not have icons"
- **Fix**: Add icons array to `manifest.json`
- **Test**: Check "Application → Manifest" in DevTools

**Issue**: "Not on home screen"
- **Fix**: Add `display: standalone` to manifest
- **Test**: Check manifest in DevTools

---

## 🔔 Push Notifications (Future Enhancement)

Infrastructure is ready, but needs backend integration.

### Current Status

✅ Service worker listens for push events
✅ Notification click handlers implemented
❌ Backend push notification server needed
❌ VAPID keys generation needed

### How to Implement

#### 1. Generate VAPID Keys

```bash
npm install web-push -g
web-push generate-vapid-keys
```

Save these securely (environment variables).

#### 2. Request Permission

Add to `App.tsx`:

```tsx
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Subscribe to push notifications
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
      });
      
      // Send subscription to backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    }
  }
};
```

#### 3. Backend Endpoint

Create `/api/notifications/subscribe` to:
1. Receive subscription object
2. Store in database
3. Use `web-push` library to send notifications

#### 4. Trigger Notifications

From backend (Node.js):

```js
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your@email.com',
  publicVapidKey,
  privateVapidKey
);

// When event happens (task due, meal time, etc)
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Task Due Soon',
  body: 'Prep: Dinner is due in 1 hour',
  icon: '/icon-192.png',
  url: '/?tab=tasks'
}));
```

---

## 🎨 Customizing Your PWA

### Change App Name

Edit `public/manifest.json`:

```json
{
  "name": "Your Family Hub",
  "short_name": "Family Hub"
}
```

### Change Theme Color

Edit `public/manifest.json` and `index.html`:

```json
{
  "theme_color": "#ff6b6b"  // Your brand color
}
```

```html
<meta name="theme-color" content="#ff6b6b">
```

### Change Icon

Replace `public/icon-192.svg` and `public/icon-512.svg` with your designs.

**Requirements**:
- 192x192 and 512x512 sizes
- PNG or SVG format
- Square aspect ratio
- Should look good on any background color

### Change Splash Screen (iOS)

Add to `index.html`:

```html
<link rel="apple-touch-startup-image" href="/splash-screen.png">
```

Create splash screen image (2048x2732 for iPad Pro).

### Add More Shortcuts

Edit `public/manifest.json`:

```json
{
  "shortcuts": [
    {
      "name": "Money Tracker",
      "short_name": "Money",
      "url": "/?tab=money",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    }
  ]
}
```

---

## 📱 Platform-Specific Notes

### iOS (Safari)

**Limitations**:
- No install prompt (must use Share → Add to Home Screen)
- Limited service worker support
- No push notifications (yet)
- No web share API

**Best Practices**:
- Test on actual iOS device
- Add apple-touch-icon
- Use apple-mobile-web-app-capable meta tags

### Android (Chrome)

**Full support** for:
- Install prompts
- Service workers
- Push notifications
- Background sync
- All PWA features

**Best Practices**:
- Use maskable icons (adaptive icons)
- Test on multiple Android versions
- Optimize for performance

### Desktop (Chrome/Edge)

**Full support** for:
- Window controls overlay
- Keyboard shortcuts
- File handling
- All PWA features

**Best Practices**:
- Design for larger screens
- Add keyboard shortcuts
- Consider multi-window support

---

## 🐛 Troubleshooting

### Service Worker Not Updating

**Symptom**: Old version still loads after update

**Solution**:
1. Update `CACHE_NAME` in `sw.js` (e.g., `v1` → `v2`)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Or: DevTools → Application → Service Workers → Unregister

### App Won't Install

**Checklist**:
- [ ] Served over HTTPS (or localhost)
- [ ] Valid `manifest.json` accessible at `/manifest.json`
- [ ] Service worker registered
- [ ] Icons present and accessible
- [ ] No console errors
- [ ] Meets PWA criteria (check Lighthouse)

### Offline Mode Not Working

**Checklist**:
- [ ] Service worker installed (`Application → Service Workers`)
- [ ] Caches populated (`Application → Cache Storage`)
- [ ] Correct URLs cached
- [ ] Network-first strategy for API calls
- [ ] Graceful fallbacks for failed requests

### Icons Not Showing

**Checklist**:
- [ ] Icons accessible at `/icon-192.png` and `/icon-512.png`
- [ ] Correct sizes (exactly 192x192 and 512x512)
- [ ] PNG format (best compatibility)
- [ ] Manifest references correct paths
- [ ] No CORS errors

---

## 📚 Resources

### Documentation
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google: PWA Training](https://web.dev/learn/pwa/)
- [Microsoft: PWA Builder](https://www.pwabuilder.com/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit PWA quality
- [PWA Builder](https://www.pwabuilder.com/) - Generate PWA files
- [Maskable.app](https://maskable.app/) - Test maskable icons

### Testing
- [Chrome PWA Testing](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
- [iOS PWA Testing](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

## ✅ Success Checklist

Your PWA is ready when:

- [ ] Lighthouse PWA score: 100%
- [ ] Installs on desktop (Chrome/Edge)
- [ ] Installs on mobile (iOS and Android)
- [ ] Custom icon shows on home screen
- [ ] Opens in standalone window
- [ ] Works offline (after initial load)
- [ ] App shortcuts work
- [ ] Theme color applies
- [ ] No console errors
- [ ] Fast loading (< 3s)
- [ ] Responsive on all devices

---

**Need help?** Check console errors first, then review this guide. Most PWA issues are due to HTTPS, manifest errors, or service worker registration problems.

Good luck with your PWA! 🚀

