const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const matter = require('gray-matter');

class BlogManager {
    constructor() {
        this.dbPath = path.join(__dirname, 'blog.db');
        this.postsDir = path.join(__dirname, '..', 'posts');
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

    // Import all markdown files from posts directory
    async importAllPosts() {
        try {
            if (!fs.existsSync(this.postsDir)) {
                console.log('Posts directory does not exist, creating it...');
                fs.mkdirSync(this.postsDir, { recursive: true });
                return;
            }

            const files = fs.readdirSync(this.postsDir)
                .filter(file => file.endsWith('.md'))
                .sort((a, b) => {
                    // Sort by filename (which should include date)
                    return a.localeCompare(b);
                });

            console.log(`Found ${files.length} markdown files to import`);

            for (const file of files) {
                const filePath = path.join(this.postsDir, file);
                const postData = this.parseMarkdownFile(filePath);
                
                if (postData) {
                    await this.upsertPost(postData);
                }
            }

            console.log('All posts imported successfully!');
        } catch (error) {
            console.error('Error importing posts:', error);
        }
    }

    // Insert or update post in database
    async upsertPost(postData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO blog_posts 
                (title, slug, content, excerpt, category, published_at, is_published, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

    // Get all published posts (paginated)
    async getPosts(page = 1, limit = 5) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            const query = `
                SELECT id, title, slug, excerpt, category, published_at, 
                       LENGTH(content) as content_length
                FROM blog_posts 
                WHERE is_published = 1 
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

    // Get total count of published posts
    async getPostCount() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 1';
            
            this.db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    // Get single post by slug
    async getPostBySlug(slug) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, title, slug, content, excerpt, category, published_at
                FROM blog_posts 
                WHERE slug = ? AND is_published = 1
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

    // Get posts by category
    async getPostsByCategory(category, page = 1, limit = 5) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            const query = `
                SELECT id, title, slug, excerpt, category, published_at, 
                       LENGTH(content) as content_length
                FROM blog_posts 
                WHERE is_published = 1 AND category = ?
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
}

module.exports = BlogManager; 