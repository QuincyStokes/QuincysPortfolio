#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const postsDir = path.join(__dirname, '..', 'posts');
const templatePath = path.join(__dirname, '..', 'templates', 'new-post.md');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function createPost() {
    try {
        console.log('🎯 Creating a new blog post...\n');
        
        // Get post details
        const title = await question('📝 Post title: ');
        const category = await question('🏷️  Category (Game-Dev/Thoughts/Life-Updates): ');
        const excerpt = await question('💭 Excerpt (brief description): ');
        
        // Validate category
        const validCategories = ['Game-Dev', 'Thoughts', 'Life-Updates'];
        if (!validCategories.includes(category)) {
            console.error('❌ Invalid category. Must be one of:', validCategories.join(', '));
            rl.close();
            return;
        }
        
        // Generate filename with date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        const filename = `${dateStr}-${slug}.md`;
        const filePath = path.join(postsDir, filename);
        
        // Read template
        const template = fs.readFileSync(templatePath, 'utf8');
        
        // Replace template placeholders
        const postContent = template
            .replace('Your Blog Post Title Here', title)
            .replace('"Game-Dev"', `"${category}"`)
            .replace('A brief description of what this post is about. Keep it under 150 characters for the card display.', excerpt)
            .replace('Your Blog Post Title', title)
            .replace('[Date]', now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }))
            .replace('[Category]', category);
        
        // Write the new post file
        fs.writeFileSync(filePath, postContent);
        
        console.log('\n✅ Blog post created successfully!');
        console.log(`📁 File: ${filename}`);
        console.log(`📍 Location: ${filePath}`);
        console.log('\n💡 Next steps:');
        console.log('   1. Edit the markdown file with your content');
        console.log('   2. Save the file');
        console.log('   3. Restart your server to auto-import the new post');
        console.log('   4. Visit /blog to see your new post!');
        
    } catch (error) {
        console.error('❌ Error creating post:', error.message);
    } finally {
        rl.close();
    }
}

// Check if posts directory exists
if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
    console.log('📁 Created posts directory');
}

// Check if template exists
if (!fs.existsSync(templatePath)) {
    console.error('❌ Template file not found. Please ensure templates/new-post.md exists.');
    process.exit(1);
}

// Start the process
createPost(); 