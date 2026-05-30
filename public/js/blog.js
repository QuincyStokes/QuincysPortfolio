// Blog JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog functionality
    initBlog();
});

function initBlog() {
    // Category filtering
    initCategoryFilter();

    // Load more functionality
    initLoadMore();
}

// Category Filtering
function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const blogGrid = document.getElementById('blogGrid');
    
    if (!categoryBtns.length || !blogGrid) return;
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            filterPostsByCategory(category);
        });
    });
}

function filterPostsByCategory(category) {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update post count
    updatePostCount(category);
}

function updatePostCount(category) {
    const visiblePosts = document.querySelectorAll('.blog-card[style*="block"], .blog-card:not([style*="none"])');
    const postCount = document.querySelector('.post-count p');
    
    if (postCount) {
        const totalPosts = document.querySelectorAll('.blog-card').length;
        const visibleCount = visiblePosts.length;
        
        if (category === 'all') {
            postCount.textContent = `Showing ${visibleCount} of ${totalPosts} posts`;
        } else {
            postCount.textContent = `Showing ${visibleCount} posts in ${category}`;
        }
    }
}

// Load More Functionality
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        loadMorePosts();
    });
}

async function loadMorePosts() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const blogGrid = document.getElementById('blogGrid');
    const currentPage = parseInt(loadMoreBtn.dataset.page) || 1;
    const nextPage = currentPage + 1;
    
    // Disable button and show loading state
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading…';
    
    try {
        // Get active category
        const activeCategory = document.querySelector('.category-btn.active');
        const category = activeCategory ? activeCategory.dataset.category : 'all';
        
        // Build API URL
        let apiUrl = `/blog/api/posts?page=${nextPage}&limit=5`;
        if (category !== 'all') {
            apiUrl += `&category=${encodeURIComponent(category)}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Add new posts to grid
        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                blogGrid.appendChild(createPostCard(post));
            });

            // Update load more button
            loadMoreBtn.dataset.page = nextPage;
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load more';
            
            // Hide load more button if no more posts
            if (!data.hasMore) {
                loadMoreBtn.style.display = 'none';
            }
            
            // Update post count
            updatePostCount(category);
            
        } else {
            // No more posts
            loadMoreBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading more posts:', error);
        
        // Reset button state
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load more';

        // Show error message
        showErrorMessage('Failed to load more posts. Please try again.');
    }
}

function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.dataset.category = post.category;
    
    const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="card-category">${post.category}</div>
        <h2 class="card-title">
            <a href="/blog/${post.slug}" class="card-title-link">${post.title}</a>
        </h2>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-meta">
            <span class="meta-date">${formattedDate}</span>
            <span class="meta-read-time">${post.readTime} min read</span>
        </div>
    `;

    return card;
}

// Smooth Animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe blog cards
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Error Handling
function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        </div>
    `;
    
    // Add styles
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = errorDiv.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
        errorDiv.remove();
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 0.5rem;
    }
    
    .error-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style); 