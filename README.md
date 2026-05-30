# Quincy's Portfolio

Personal portfolio site for Quincy Stokes — game developer and software engineer.
Showcases games, tools, and a markdown-driven blog.

Live site: portfolio is deployed to Render (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Stack

- **Server:** Node.js + Express
- **Views:** EJS with `express-ejs-layouts`
- **Database:** SQLite (`sqlite3`) for blog storage
- **Blog content:** Markdown files in `posts/` parsed with `gray-matter` + `marked`
- **Contact form:** `nodemailer` over Gmail with per-IP rate limiting

## Getting started

```bash
npm install
cp env.example .env   # then fill in EMAIL_USER / EMAIL_PASS
npm run dev           # nodemon on http://localhost:3000
```

`npm start` runs the server without nodemon.

### Required environment variables

| Variable     | Purpose                                   |
| ------------ | ----------------------------------------- |
| `EMAIL_USER` | Gmail address that sends contact emails   |
| `EMAIL_PASS` | Gmail app password (not your real password) |
| `PORT`       | Server port (defaults to `3000`)          |

See [CONTACT_SETUP.md](CONTACT_SETUP.md) for the Gmail app-password walkthrough.

## Project layout

```
app.js              # Express entry point + contact form handler
routes/blog.js      # Blog listing, post-by-slug, and load-more API
views/              # EJS templates (layout, index, projects, contact, blog)
public/             # Static CSS / JS / images
posts/              # Markdown blog posts (auto-imported on server start)
posts/archive/      # Auto-generated archive of deleted posts
database/           # SQLite schema, init, and BlogManager
scripts/            # create-post, deploy, restore-archived, test-archive
templates/          # Markdown template for new posts
```

## Blog

Posts live in `posts/*.md` with YAML frontmatter and are auto-imported into
`database/blog.db` whenever the server starts. Deleting a post file archives it
automatically — see [BLOG_README.md](BLOG_README.md) and
[BLOG_ARCHIVING.md](BLOG_ARCHIVING.md) for the full workflow.

Quick post creation:

```bash
node scripts/create-post.js
```

## Deployment

Auto-deploys to Render on push to `main` via GitHub Actions, or manually with
`npm run deploy`. Details in [DEPLOYMENT.md](DEPLOYMENT.md).
