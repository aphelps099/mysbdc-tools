# TFG One-Pager: Setup & Troubleshooting Instructions

## What is the One-Pager?

When someone submits the TFG application form, the system:
1. Saves the full application as a JSON file to disk (`TFG_DATA_DIR/{uuid}.json`)
2. Generates a one-pager URL: `APP_URL/api/tfg/applications/{uuid}`
3. Includes a "View One-Pager" button in the admin notification email

The one-pager is a dark-themed, Pentagram-minimal HTML page rendered server-side at `/api/tfg/applications/[id]/route.ts`. It displays the full application summary — company info, vision, traction, team, readiness score, etc.

---

## Required Environment Variables

These MUST be set in Railway for the one-pager to work:

```
APP_URL=https://your-app.up.railway.app        # Your Railway deployment URL (no trailing slash)
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app  # Same value — used for font URLs in the one-pager
TFG_DATA_DIR=/data/tfg-applications             # Where JSON files are stored
```

---

## Required: Railway Persistent Volume

**This is the #1 reason the one-pager doesn't work.** Without a persistent volume, JSON files are saved to ephemeral storage and disappear on every deploy/restart.

### How to set up the volume in Railway:
1. Go to your Railway project → click on your service
2. Click **Settings** tab
3. Scroll to **Volumes** section
4. Click **Add Volume**
5. Set **Mount Path** to: `/data`
6. Click **Save**
7. Redeploy the service

This mounts persistent storage at `/data`. The app saves files to `/data/tfg-applications/` (configured by `TFG_DATA_DIR`).

---

## How the One-Pager Link Appears in the Admin Email

The admin notification email (`src/lib/emails/tfg-admin-notification.ts`) includes a green CTA button:

```html
<a href="{onePagerUrl}"
   target="_blank"
   rel="noopener noreferrer"
   style="display:inline-block;
          padding:14px 28px;
          background:#4eff00;
          color:#0a0a0a;
          font-family:'GT America Extended', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size:11px;
          font-weight:600;
          letter-spacing:0.06em;
          text-transform:uppercase;
          text-decoration:none;">
  View One-Pager
</a>
```

The button only renders if `onePagerUrl` is truthy — which requires `APP_URL` to be set in environment variables.

---

## How the One-Pager URL is Generated (in submit route)

In `src/app/api/tfg/submit/route.ts`, after saving the application:

```typescript
const applicationId = crypto.randomUUID();
const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
let onePagerUrl = '';

await saveApplication(applicationId, tfgData, null, pitchDeckFileName, clientId);

if (appUrl) {
  onePagerUrl = `${appUrl}/api/tfg/applications/${applicationId}`;
}
```

If `APP_URL` is empty, `onePagerUrl` stays empty and the button won't appear in the email.

---

## The One-Pager Route

**File:** `src/app/api/tfg/applications/[id]/route.ts`

This is a Next.js API route that:
1. Receives the UUID from the URL
2. Loads the JSON file from `TFG_DATA_DIR/{id}.json`
3. Renders a full HTML page with inline styles

### Design specs:
- **Background:** `#0a0a0a` (near-black)
- **Text:** `#e2e6eb` (light gray)
- **Accent:** `#4eff00` (TFG green — used for links, score highlights, section borders)
- **Font:** GT America Extended (loaded via `@font-face` from `NEXT_PUBLIC_APP_URL/fonts/`)
- **Layout:** Single column, 680px max-width, generous padding
- **Sections:** Company & Contact, Industry, Vision & Product, Market & Validation, Traction & Revenue, Financing & Runway, Team, Support & Referral
- **Score display:** Color-coded readiness score (green ≥6, amber ≥3, gray <3)
- **Long text:** Displayed in bordered prose blocks with green left border accent
- **Key-value data:** Displayed in bordered tables with alternating row backgrounds

---

## Storage Module

**File:** `src/lib/tfg-storage.ts`

```typescript
interface StoredApplication {
  id: string;
  data: Record<string, unknown>;
  pitchDeckUrl: string | null;
  pitchDeckFileName: string | null;
  clientId: string | null;
  submittedAt: string;
}
```

- `saveApplication()` — writes `{id}.json` to `TFG_DATA_DIR`
- `loadApplication()` — reads and parses the JSON file; returns null if not found
- UUID format is validated before file read (security measure)

---

## Troubleshooting Checklist

| Symptom | Cause | Fix |
|---------|-------|-----|
| No "View One-Pager" button in admin email | `APP_URL` not set | Add `APP_URL=https://your-app.up.railway.app` to Railway variables |
| Button appears but link shows "Application not found" | No persistent volume in Railway | Add a volume mounted at `/data` (see instructions above) |
| Button appears but link shows "Application not found" | App was redeployed and data was on ephemeral storage | Add persistent volume, then re-submit a test application |
| One-pager loads but fonts are wrong | `NEXT_PUBLIC_APP_URL` not set or wrong | Set it to match `APP_URL` |
| One-pager loads but fonts are wrong | Font files missing from `public/fonts/` | Ensure `GT-America-Extended-Regular.otf` and `GT-America-Extended-Medium.otf` are in `public/fonts/` |

---

## File Map

```
src/
├── app/api/tfg/
│   ├── submit/route.ts              # Saves application + generates one-pager URL
│   └── applications/[id]/route.ts   # Renders the one-pager HTML page
├── lib/
│   ├── tfg-storage.ts               # JSON file save/load
│   └── emails/
│       └── tfg-admin-notification.ts # Admin email with "View One-Pager" button
public/
└── fonts/
    ├── GT-America-Extended-Regular.otf  # Used by one-pager @font-face
    └── GT-America-Extended-Medium.otf   # Used by one-pager @font-face
```
