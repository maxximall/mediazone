## Decap CMS on Netlify: Setup Guide

### 1) Deploy to Netlify
- Push this repo to GitHub/GitLab/Bitbucket.
- Create a new site on Netlify from this repo (branch `main`).

### 2) Enable Identity and Git Gateway
- In your Netlify site dashboard: Identity → Enable Identity.
- Identity → Settings → Registration: set to "Invite only".
- Identity → Services → Enable Git Gateway.

### 3) Invite your client
- Identity → Invite users → enter your client’s email.
- They’ll accept the invite and connect their Git provider.

### 4) Access the CMS
- Visit `/admin/` on your deployed site, e.g. `https://your-site.netlify.app/admin/`.
- Log in via Netlify Identity.

### 5) Manage Shows
- Open collection "Shows" → "All Shows".
- Add, edit, or delete entries; upload images to `assets/`.
- Publishing will commit changes to `content/shows.json` on `main`.

### Notes
- Backend is configured in `admin/config.yml` with `git-gateway`.
- Media uploads are stored in `assets/` and referenced from JSON.
- The frontend fetches `content/shows.json` at runtime and renders the grid.

