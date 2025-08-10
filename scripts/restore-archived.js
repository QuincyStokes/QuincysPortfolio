const fs = require('fs');
const path = require('path');
const BlogManager = require('../database/blogManager');
const { initDatabase } = require('../database/init');

async function restoreArchivedPost(slug) {
    try {
        console.log(`🔄 Attempting to restore archived post: ${slug}\n`);
        
        // Initialize database
        await initDatabase();
        
        const blogManager = new BlogManager();
        await blogManager.init();
        
        // Get archived posts
        const archivedPosts = await blogManager.getArchivedPosts();
        const targetPost = archivedPosts.find(post => post.slug === slug);
        
        if (!targetPost) {
            console.log(`❌ No archived post found with slug: ${slug}`);
            console.log('\n📋 Available archived posts:');
            archivedPosts.forEach(post => {
                console.log(`  - ${post.slug} (${post.title})`);
            });
            await blogManager.close();
            return;
        }
        
        console.log(`📄 Found archived post: ${targetPost.title}`);
        
        // Find the archive file
        const archiveDir = path.join(__dirname, '..', 'posts', 'archive');
        const archiveFiles = fs.readdirSync(archiveDir)
            .filter(file => file.endsWith('.md') && file.includes(slug));
        
        if (archiveFiles.length === 0) {
            console.log(`❌ No archive file found for slug: ${slug}`);
            await blogManager.close();
            return;
        }
        
        const archiveFile = archiveFiles[0];
        const archivePath = path.join(archiveDir, archiveFile);
        const postsDir = path.join(__dirname, '..', 'posts');
        
        // Read the archived content
        const archivedContent = fs.readFileSync(archivePath, 'utf8');
        
        // Extract the original content (remove the archivedAt field from frontmatter)
        const lines = archivedContent.split('\n');
        const frontmatterEnd = lines.findIndex(line => line.trim() === '---', 1);
        
        if (frontmatterEnd === -1) {
            console.log('❌ Invalid archive file format');
            await blogManager.close();
            return;
        }
        
        // Reconstruct the original frontmatter without archivedAt
        const originalFrontmatter = lines.slice(0, frontmatterEnd + 1)
            .filter(line => !line.includes('archivedAt:') && !line.includes('published: false'))
            .join('\n');
        
        // Get the content after frontmatter
        const content = lines.slice(frontmatterEnd + 1).join('\n');
        
        // Create the restored file content
        const restoredContent = originalFrontmatter + '\n' + content;
        
        // Generate filename (you might want to adjust this based on your naming convention)
        const restoredFileName = `${new Date().toISOString().split('T')[0]}-${slug}.md`;
        const restoredPath = path.join(postsDir, restoredFileName);
        
        // Write the restored file
        fs.writeFileSync(restoredPath, restoredContent);
        console.log(`📝 Restored post written to: ${restoredPath}`);
        
        // Import posts to update database
        console.log('\n📥 Importing posts to update database...');
        await blogManager.importAllPosts();
        
        // Verify restoration
        const restoredPost = await blogManager.getPostBySlug(slug);
        if (restoredPost) {
            console.log(`✅ Post "${restoredPost.title}" successfully restored and is now live!`);
        } else {
            console.log('❌ Post restoration failed - not found in database');
        }
        
        await blogManager.close();
        
    } catch (error) {
        console.error('❌ Error restoring archived post:', error);
    }
}

// Example usage
if (require.main === module) {
    const slug = process.argv[2];
    if (!slug) {
        console.log('Usage: node restore-archived.js <post-slug>');
        console.log('Example: node restore-archived.js welcome-to-my-blog');
        process.exit(1);
    }
    
    restoreArchivedPost(slug);
}

module.exports = { restoreArchivedPost };
