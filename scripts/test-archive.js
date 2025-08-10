const BlogManager = require('../database/blogManager');
const { initDatabase } = require('../database/init');

async function testArchiving() {
    try {
        console.log('🧪 Testing blog post archiving functionality...\n');
        
        // Initialize database
        await initDatabase();
        
        const blogManager = new BlogManager();
        await blogManager.init();
        
        // Get current posts
        const currentPosts = await blogManager.getAllActivePosts();
        console.log(`📊 Current active posts in database: ${currentPosts.length}`);
        
        // Import posts (this will archive any missing ones)
        console.log('\n📥 Importing posts and checking for missing files...');
        await blogManager.importAllPosts();
        
        // Get posts after import
        const postsAfterImport = await blogManager.getAllActivePosts();
        console.log(`📊 Active posts after import: ${postsAfterImport.length}`);
        
        // Get archived posts
        const archivedPosts = await blogManager.getArchivedPosts();
        console.log(`📦 Archived posts: ${archivedPosts.length}`);
        
        if (archivedPosts.length > 0) {
            console.log('\n📋 Archived posts:');
            archivedPosts.forEach(post => {
                console.log(`  - ${post.title} (${post.category}) - Archived at: ${post.updated_at}`);
            });
        }
        
        await blogManager.close();
        console.log('\n✅ Archiving test completed!');
        
    } catch (error) {
        console.error('❌ Error during archiving test:', error);
    }
}

// Run test if this script is executed directly
if (require.main === module) {
    testArchiving();
}

module.exports = { testArchiving };
