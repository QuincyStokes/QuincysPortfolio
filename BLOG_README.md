# Blog System - Quincy's Portfolio

## 🎯 Overview

Your portfolio website now includes a fully functional blog system with:
- **Markdown support** for easy content creation
- **Auto-import** of posts from the `posts/` directory
- **Category filtering** (Game-Dev, Thoughts, Life-Updates)
- **Load more functionality** for pagination
- **Responsive design** matching your existing aesthetic
- **SQLite database** for post storage and management

## 🚀 Quick Start

### 1. View Your Blog
- Visit `/blog` to see all posts
- Click on any post to read the full content
- Use category filters to browse specific topics

### 2. Create New Posts

#### Option A: Use the Quick Script (Recommended)
```bash
node scripts/create-post.js
```
This will prompt you for:
- Post title
- Category
- Excerpt
- Automatically generates the file with proper naming

#### Option B: Manual Creation
1. Copy `templates/new-post.md`
2. Rename to `YYYY-MM-DD-your-title.md`
3. Edit the frontmatter and content
4. Save in the `posts/` directory

### 3. Auto-Import
- Posts are automatically imported when you restart the server
- No manual database management needed
- Just save your markdown file and restart!

## 📝 Post Format

### Frontmatter (Required)
```yaml
---
title: "Your Post Title"
category: "Game-Dev"  # Must be: Game-Dev, Thoughts, or Life-Updates
excerpt: "Brief description under 150 characters"
published: true
---
```

### Content
- Use standard markdown syntax
- Supports headers, lists, code blocks, links, etc.
- Images can be referenced from your `public/images/` directory

## 🗂️ File Structure

```
QuincysPortfolio/
├── database/
│   ├── blog.db          # SQLite database (auto-created)
│   ├── schema.sql       # Database schema
│   ├── init.js          # Database initialization
│   └── blogManager.js   # Blog management logic
├── posts/               # Your markdown blog posts
│   ├── 2024-01-15-welcome-to-my-blog.md
│   └── 2024-01-16-game-dev-workflow.md
├── templates/
│   └── new-post.md     # Post template
├── routes/
│   └── blog.js         # Blog routes
├── views/
│   ├── blog.ejs        # Blog listing page
│   └── blog-post.ejs   # Individual post view
├── public/
│   ├── css/
│   │   └── blog.css    # Blog styles
│   └── js/
│       └── blog.js     # Blog functionality
└── scripts/
    └── create-post.js  # Quick post creation script
```

## 🎨 Features

### Category System
- **Game-Dev**: Blue theme, for development insights
- **Thoughts**: Red theme, for industry thoughts
- **Life-Updates**: Teal theme, for personal updates

### Responsive Design
- Mobile-friendly card layout
- Smooth animations and transitions
- Matches your existing portfolio aesthetic

### Performance
- Pagination (5 posts per page)
- Load more functionality
- Optimized database queries
- Read time estimates

## 🔧 Customization

### Adding New Categories
1. Update `database/schema.sql` (add new category to CHECK constraint)
2. Update `database/blogManager.js` (add to validCategories array)
3. Update `public/css/blog.css` (add category-specific styles)
4. Update `views/blog.ejs` (add category button)
5. Update `scripts/create-post.js` (add to valid categories)

### Styling
- Edit `public/css/blog.css` to match your preferences
- Colors use CSS variables from your main theme
- Responsive breakpoints at 768px

### Functionality
- Edit `public/js/blog.js` for JavaScript behavior
- Edit `routes/blog.js` for backend logic
- Edit `database/blogManager.js` for database operations

## 📊 Database

### Schema
- **blog_posts**: Main table with all post data
- **Indexes**: Optimized for fast queries by date, category, and slug
- **Auto-timestamps**: Published and updated dates

### Management
- Database file: `database/blog.db`
- Auto-created on first run
- No manual setup required
- SQLite for simplicity and portability

## 🚀 Deployment

### Local Development
```bash
npm start
# or
node app.js
```

### Production
- Database file will be created automatically
- Posts auto-import on server start
- No additional configuration needed

## 💡 Tips for Daily Blogging

### 1. Use the Quick Script
```bash
node scripts/create-post.js
# Answer the prompts
# Edit the generated file
# Restart server to see your post
```

### 2. Consistent Naming
- Use date prefixes: `YYYY-MM-DD-title.md`
- Keep titles descriptive but concise
- Use kebab-case for filenames

### 3. Content Ideas
- **Game-Dev**: Tutorials, post-mortems, technical challenges
- **Thoughts**: Industry insights, tool reviews, career advice
- **Life-Updates**: Project milestones, learning progress, personal growth

### 4. Regular Schedule
- Aim for daily posts (as planned!)
- Use the auto-import to stay organized
- Keep a content calendar if helpful

## 🐛 Troubleshooting

### Posts Not Showing
- Check that markdown files are in the `posts/` directory
- Ensure frontmatter is properly formatted
- Restart the server to trigger auto-import
- Check browser console for JavaScript errors

### Database Issues
- Delete `database/blog.db` and restart (will recreate)
- Check file permissions in the database directory
- Ensure SQLite3 is properly installed

### Styling Issues
- Check that `blog.css` is loaded in `layout.ejs`
- Verify CSS variables are defined in your main theme
- Check browser developer tools for CSS errors

## 🎉 What's Next?

Your blog system is ready to use! Consider these future enhancements:

1. **Comments system** for reader engagement
2. **Search functionality** for finding specific posts
3. **RSS feed** for subscribers
4. **Social sharing** buttons
5. **Analytics** to track readership
6. **Admin interface** for easier post management

---

**Happy blogging!** 🚀

Your daily posts will help build your personal brand and share your knowledge with the game development community. 