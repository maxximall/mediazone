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

### 5) Manage Content

#### Shows
- Open collection "Shows" → "All Shows".
- Add, edit, or delete show entries with categories (Documentary, True Crime, Game Shows, Dating, Drama, Film).
- Publishing will commit changes to `content/shows.json` on `main`.

#### Team Members
- Open collection "Team Members" → "All Team Members".
- Add, edit, or delete team member profiles shown on the About Us page.
- Publishing will commit changes to `content/team-members.json` on `main`.

#### Production Partners
- Open collection "Production Partners" → "All Production Partners".
- Add or remove production partner logos shown on the Clients page.
- Publishing will commit changes to `content/production-partners.json` on `main`.

#### Carousel Slides
- Open collection "Carousel Slides" → "All Carousel Slides".
- Add or remove images for the homepage carousel slideshow.
- Publishing will commit changes to `content/carousel-slides.json` on `main`.

#### Case Studies
- Open collection "Case Studies" → "All Case Studies".
- Add, edit, or delete case studies shown on the homepage.
- **Two types of case studies:**
  - **Internal Page**: Content managed entirely through CMS. The full article (title, subtitle, body content) is stored in JSON and displayed on a dynamic page.
    - **Slug**: URL-friendly identifier (e.g., `patience-neurodivergent-actors`). Must be unique.
    - **Body Content**: Write the full article content. Supports basic markdown formatting:
      - `**bold text**` for bold
      - `*italic text*` for italic
      - Separate paragraphs with double line breaks
  - **External Link**: Links to an external website (e.g., a blog article). Fill in the "External URL" field with the full URL starting with `https://`.
- Use the "Order" field to control display order (lower numbers appear first).
- Publishing will commit changes to `content/case-studies.json` on `main`.
- Internal case studies are displayed at `case-study.html?slug=your-slug`.

### Notes
- Backend is configured in `admin/config.yml` with `git-gateway`.
- Media uploads are stored in `assets/` and referenced from JSON.
- The frontend fetches JSON files at runtime and renders content dynamically.

### If you get "API_ERROR: Validation Failed" when saving
- **Editorial workflow is disabled** so that Save/Publish commits directly to `main`. This avoids draft-branch/PR creation, which often causes this error with file collections.
- If you need draft workflow again: in `admin/config.yml` uncomment `publish_mode: editorial_workflow`, then in Netlify ensure **Identity → Services → Git Gateway** is enabled and the site’s connected repo has no branch protection that blocks the CMS.
- Optionally set `repo: owner/repo` under `backend:` in `config.yml` (your GitHub user or org and repo name) if the error continues.

