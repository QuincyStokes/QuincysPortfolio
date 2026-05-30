const express = require('express');
const router = express.Router();
const BlogManager = require('../database/blogManager');

const blogManager = new BlogManager();

// Initialize blog manager on route load
router.use(async (req, res, next) => {
    try {
        await blogManager.init();
        next();
    } catch (error) {
        console.error('Error initializing blog manager:', error);
        next(error);
    }
});

// Blog listing page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        
        const [posts, totalPosts] = await Promise.all([
            blogManager.getPosts(page, limit),
            blogManager.getPostCount()
        ]);

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        res.render('blog', {
            posts,
            currentPage: 'blog',
            page: page,
            totalPages,
            hasMore,
            totalPosts,
            minimal: true
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
        res.status(500).render('error', {
            message: 'Error loading blog posts',
            error: process.env.NODE_ENV === 'development' ? error : {},
            minimal: true
        });
    }
});

// Individual blog post page
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await blogManager.getPostBySlug(slug);
        
        if (!post) {
            return res.status(404).render('error', {
                message: 'Blog post not found',
                error: {},
                minimal: true
            });
        }

        res.render('blog-post', { post, currentPage: 'blog', minimal: true });
    } catch (error) {
        console.error('Error loading blog post:', error);
        res.status(500).render('error', {
            message: 'Error loading blog post',
            error: process.env.NODE_ENV === 'development' ? error : {},
            minimal: true
        });
    }
});

// API endpoint for loading more posts (AJAX)
router.get('/api/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const category = req.query.category;
        
        let posts, totalPosts;
        
        if (category) {
            [posts, totalPosts] = await Promise.all([
                blogManager.getPostsByCategory(category, page, limit),
                blogManager.getPostCount()
            ]);
        } else {
            [posts, totalPosts] = await Promise.all([
                blogManager.getPosts(page, limit),
                blogManager.getPostCount()
            ]);
        }

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        res.json({
            posts,
            currentPage: page,
            totalPages,
            hasMore,
            totalPosts
        });
    } catch (error) {
        console.error('Error loading posts via API:', error);
        res.status(500).json({ 
            error: 'Error loading posts',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Note: Express routers don't have a 'close' event
// The blog manager will be closed when the process ends
// For production, you might want to add proper cleanup in your main app

module.exports = router; 