const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const matter = require('gray-matter');

class BlogManager {
    constructor() {
        this.dbPath = path.join(__dirname, 'blog.db');
        this.postsDir = path.join(__dirname, '..', 'posts');
        this.archiveDir = path.join(this.postsDir, 'archive');
        this.db = null;
    }

    // Initialize database connection
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to blog database');
                    resolve();
                }
            });
        });
    }

    // Close database connection
    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Generate slug from title
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Parse markdown file with frontmatter
    parseMarkdownFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const { data, content: markdownContent } = matter(content);
            
            // Validate required fields
            if (!data.title || !data.category || !data.excerpt) {
                throw new Error(`Missing required fields in ${filePath}`);
            }

            // Validate category
            const validCategories = ['Game-Dev', 'Thoughts', 'Life-Updates'];
            if (!validCategories.includes(data.category)) {
                throw new Error(`Invalid category: ${data.category}. Must be one of: ${validCategories.join(', ')}`);
            }

            return {
                title: data.title,
                slug: this.generateSlug(data.title),
                content: markdownContent,
                excerpt: data.excerpt,
                category: data.category,
                published: data.published !== false,
                publishedAt: data.publishedAt || new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    // Archive a post by moving it to archive directory and marking as archived in DB
    async archivePost(postData) {
        try {
            // Create archive directory if it doesn't exist
            if (!fs.existsSync(this.archiveDir)) {
                fs.mkdirSync(this.archiveDir, { recursive: true });
            }

            // Create archived post content with frontmatter
            const archivedContent = `---
title: "${postData.title}"
category: "${postData.category}"
excerpt: "${postData.excerpt}"
published: false
publishedAt: "${postData.publishedAt}"
archivedAt: "${new Date().toISOString()}"
---

${postData.content}`;

            // Save to archive directory with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archiveFileName = `${timestamp}-${postData.slug}.md`;
            const archivePath = path.join(this.archiveDir, archiveFileName);
            
            fs.writeFileSync(archivePath, archivedContent);
            console.log(`Post "${postData.title}" archived to ${archivePath}`);

            // Mark as archived in database
            return new Promise((resolve, reject) => {
                const query = `
                    UPDATE blog_posts 
                    SET is_archived = 1, is_published = 0, updated_at = ?
                    WHERE slug = ?
                `;

                this.db.run(query, [new Date().toISOString(), postData.slug], function(err) {
                    if (err) {
                        console.error('Error archiving post in database:', err);
                        reject(err);
                    } else {
                        console.log(`Post "${postData.title}" marked as archived in database`);
                        resolve(this.changes);
                    }
                });
            });
        } catch (error) {
            console.error('Error archiving post:', error);
            throw error;
        }
    }

    // Get all posts from database that are not archived
    async getAllActivePosts() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, title, slug, content, excerpt, category, published_at, is_published
                FROM blog_posts 
                WHERE is_archived = 0
            `;

            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Import all markdown files from posts directory and archive missing posts
    async importAllPosts() {
        try {
            if (!fs.existsSync(this.postsDir)) {
                console.log('Posts directory does not exist, creating it...');
                fs.mkdirSync(this.postsDir, { recursive: true });
                return;
            }

            // Get all markdown files from posts directory (excluding archive)
            const files = fs.readdirSync(this.postsDir)
                .filter(file => file.endsWith('.md') && !file.startsWith('.'))
                .sort((a, b) => {
                    // Sort by filename (which should include date)
                    return a.localeCompare(b);
                });

            console.log(`Found ${files.length} markdown files to import`);

            // Get all active posts from database
            const dbPosts = await this.getAllActivePosts();
            console.log(`Found ${dbPosts.length} active posts in database`);

            // Create a set of slugs from current files
            const currentSlugs = new Set();
            for (const file of files) {
                const filePath = path.join(this.postsDir, file);
                const postData = this.parseMarkdownFile(filePath);
                if (postData) {
                    currentSlugs.add(postData.slug);
                    await this.upsertPost(postData);
                }
            }

            // Find posts that exist in database but not in files (missing posts)
            const missingPosts = dbPosts.filter(dbPost => !currentSlugs.has(dbPost.slug));
            
            if (missingPosts.length > 0) {
                console.log(`Found ${missingPosts.length} posts that are no longer in the posts directory. Archiving them...`);
                
                for (const missingPost of missingPosts) {
                    await this.archivePost(missingPost);
                }
                
                console.log(`Successfully archived ${missingPosts.length} posts`);
            } else {
                console.log('No missing posts found - all database posts have corresponding files');
            }

            console.log('All posts imported and archived successfully!');
        } catch (error) {
            console.error('Error importing posts:', error);
        }
    }

    // Insert or update post in database
    async upsertPost(postData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO blog_posts 
                (title, slug, content, excerpt, category, published_at, is_published, is_archived, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
            `;

            const params = [
                postData.title,
                postData.slug,
                postData.content,
                postData.excerpt,
                postData.category,
                postData.publishedAt,
                postData.published ? 1 : 0,
                new Date().toISOString()
            ];

            this.db.run(query, params, function(err) {
                if (err) {
                    console.error('Error upserting post:', err);
                    reject(err);
                } else {
                    console.log(`Post "${postData.title}" ${this.changes > 0 ? 'inserted' : 'updated'}`);
                    resolve(this.lastID);
                }
            });
        });
    }

    // Get all published posts (paginated) - excluding archived posts
    async getPosts(page = 1, limit = 5) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            const query = `
                SELECT id, title, slug, excerpt, category, published_at, 
                       LENGTH(content) as content_length
                FROM blog_posts 
                WHERE is_published = 1 AND is_archived = 0
                ORDER BY published_at DESC 
                LIMIT ? OFFSET ?
            `;

            this.db.all(query, [limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Calculate read time (rough estimate: 200 words per minute)
                    const posts = rows.map(row => ({
                        ...row,
                        readTime: Math.ceil((row.content_length / 5) / 200) // 5 chars per word, 200 words per minute
                    }));
                    resolve(posts);
                }
            });
        });
    }

    // Get total count of published posts - excluding archived posts
    async getPostCount() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 1 AND is_archived = 0';
            
            this.db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    // Get single post by slug - excluding archived posts
    async getPostBySlug(slug) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, title, slug, content, excerpt, category, published_at
                FROM blog_posts 
                WHERE slug = ? AND is_published = 1 AND is_archived = 0
            `;

            this.db.get(query, [slug], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    // Convert markdown to HTML
                    row.htmlContent = marked(row.content);
                    row.readTime = Math.ceil((row.content.length / 5) / 200);
                    resolve(row);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Get posts by category - excluding archived posts
    async getPostsByCategory(category, page = 1, limit = 5) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            const query = `
                SELECT id, title, slug, excerpt, category, published_at, 
                       LENGTH(content) as content_length
                FROM blog_posts 
                WHERE is_published = 1 AND is_archived = 0 AND category = ?
                ORDER BY published_at DESC 
                LIMIT ? OFFSET ?
            `;

            this.db.all(query, [category, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const posts = rows.map(row => ({
                        ...row,
                        readTime: Math.ceil((row.content_length / 5) / 200)
                    }));
                    resolve(posts);
                }
            });
        });
    }

    // Get archived posts (for admin purposes)
    async getArchivedPosts() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, title, slug, excerpt, category, published_at, updated_at
                FROM blog_posts 
                WHERE is_archived = 1
                ORDER BY updated_at DESC
            `;

            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = BlogManager; 