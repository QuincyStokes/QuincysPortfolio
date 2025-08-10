# Blog Post Archiving System

## Overview

The blog system now includes an automatic archiving feature that prevents deleted posts from remaining visible on the website. When posts are removed from the `/posts` folder and the website is redeployed, they are automatically archived and hidden from public view.

## How It Works

### Automatic Archiving Process

1. **Database Schema**: Added an `is_archived` column to the `blog_posts` table
2. **Import Process**: When `importAllPosts()` runs, it compares database posts with actual files
3. **Missing Posts Detection**: Posts that exist in the database but not in the `/posts` folder are identified
4. **Archiving**: Missing posts are:
   - Marked as `is_archived = 1` and `is_published = 0` in the database
   - Saved to `/posts/archive/` directory with timestamp and original content
   - Excluded from all public queries

### Archive Storage

- **Location**: `/posts/archive/`
- **Filename Format**: `{timestamp}-{slug}.md`
- **Content**: Original markdown with additional frontmatter including `archivedAt` timestamp

### Database Changes

```sql
-- New column added to blog_posts table
ALTER TABLE blog_posts ADD COLUMN is_archived BOOLEAN DEFAULT 0;

-- New index for performance
CREATE INDEX idx_blog_posts_archived ON blog_posts(is_archived);
```

## Usage

### Automatic Operation

The archiving happens automatically when:
- The server starts up
- The blog posts are imported
- The website is redeployed

### Manual Testing

You can test the archiving functionality:

```bash
node scripts/test-archive.js
```

### Viewing Archived Posts

Archived posts can be retrieved programmatically:

```javascript
const blogManager = new BlogManager();
await blogManager.init();
const archivedPosts = await blogManager.getArchivedPosts();
```

## Benefits

1. **Clean Website**: Deleted posts no longer appear on the live site
2. **Data Preservation**: Archived posts are saved with full content and metadata
3. **Automatic Operation**: No manual intervention required
4. **Reversible**: Archived posts can be restored by moving them back to `/posts/`
5. **Audit Trail**: Archive files include timestamps for tracking

## File Structure

```
posts/
├── 2025-08-09-initial-commit.md
├── your-active-post.md
└── archive/
    ├── 2025-08-09-12-34-56-test-post.md
    └── 2025-08-09-13-45-67-another-test.md
```

## Migration

Existing databases are automatically migrated when the server starts:
- The `is_archived` column is added if it doesn't exist
- All existing posts are marked as `is_archived = 0` (not archived)
- No data loss occurs during migration

## Troubleshooting

### Posts Still Showing After Deletion

1. Ensure the server has been restarted/redeployed
2. Check that the post file was actually removed from `/posts/`
3. Verify the database migration completed successfully
4. Check server logs for any import errors

### Archive Directory Not Created

The archive directory is created automatically when needed. If it's missing:
1. Restart the server
2. Check file permissions
3. Manually create `/posts/archive/` if needed

### Restoring Archived Posts

To restore an archived post:
1. Move the file from `/posts/archive/` back to `/posts/`
2. Restart the server or trigger a reimport
3. The post will be automatically unarchived and republished
