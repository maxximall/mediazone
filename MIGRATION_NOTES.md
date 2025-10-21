# Case Studies Migration Notes

## What Changed

The case studies system has been migrated from static HTML files to a CMS-managed dynamic system.

### Before
- Each internal case study required a separate HTML file (e.g., `patience-case-study.html`)
- Content was hardcoded in HTML
- Updating required editing HTML files directly

### After
- All case study content is managed through Netlify CMS
- Single dynamic template (`case-study.html`) renders all internal case studies
- Content is stored in `content/case-studies.json`
- Users can add/edit/delete case studies through the CMS interface

## Legacy Files

The following file can be safely deleted as it's no longer used:
- `patience-case-study.html` - This has been migrated to the CMS system

The content from this file has been preserved in `content/case-studies.json` under the slug `patience-neurodivergent-actors`.

### To access the migrated case study:
- Old URL: `/patience-case-study.html`
- New URL: `/case-study.html?slug=patience-neurodivergent-actors`

## How to Use

### Adding a New Internal Case Study via CMS:
1. Go to `/admin/` on your deployed site
2. Navigate to "Case Studies" → "All Case Studies"
3. Click "New Case Study"
4. Fill in the fields:
   - **Title**: Main title of the case study
   - **Slug**: URL-friendly identifier (e.g., `my-new-case-study`)
   - **Description**: Short excerpt shown on the homepage
   - **Cover Image**: Upload the cover image
   - **Type**: Select "Internal Page"
   - **Subtitle**: Optional subtitle shown below the title
   - **Body Content**: Full article content (supports basic markdown)
   - **Order**: Display order (lower numbers first)
5. Save and publish

The case study will be automatically displayed at `/case-study.html?slug=your-slug`

### Adding an External Case Study:
1. Follow steps 1-4 above
2. **Type**: Select "External Link"
3. **External URL**: Enter the full URL (starting with `https://`)
4. Skip the "Subtitle" and "Body Content" fields
5. Save and publish

The case study card will link to the external URL and open in a new tab.

## Technical Details

### Files Modified:
- `admin/config.yml` - Added case studies collection
- `content/case-studies.json` - New JSON data file
- `script.js` - Added case study rendering logic
- `index.html` - Updated to use dynamic loading
- `styles.css` - Removed hardcoded case study image styles
- `CMS_SETUP.md` - Updated documentation

### Files Created:
- `case-study.html` - Dynamic template for internal case studies
- `content/case-studies.json` - Case studies data

### How It Works:
1. Homepage loads case studies from `content/case-studies.json`
2. For internal case studies: Links to `case-study.html?slug=<slug>`
3. The dynamic page reads the slug parameter, fetches the JSON, and renders the matching case study
4. For external case studies: Links directly to the external URL

