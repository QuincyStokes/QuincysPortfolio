const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database initialization script
async function initDatabase() {
    const dbPath = path.join(__dirname, 'blog.db');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            
            console.log('Connected to database for initialization');
            
            // First, check if the table exists and if is_archived column exists
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='blog_posts'", (err, row) => {
                if (err) {
                    console.error('Error checking if table exists:', err);
                    reject(err);
                    return;
                }
                
                if (!row) {
                    // Table doesn't exist, create it with full schema
                    console.log('Creating blog_posts table with full schema...');
                    const schema = fs.readFileSync(schemaPath, 'utf8');
                    
                    db.exec(schema, (err) => {
                        if (err) {
                            console.error('Error executing schema:', err);
                            reject(err);
                            return;
                        }
                        
                        console.log('Schema executed successfully');
                        db.close((err) => {
                            if (err) {
                                console.error('Error closing database:', err);
                                reject(err);
                            } else {
                                console.log('Database initialization completed');
                                resolve();
                            }
                        });
                    });
                } else {
                    // Table exists, check if is_archived column exists
                    db.all("PRAGMA table_info(blog_posts)", (err, columns) => {
                        if (err) {
                            console.error('Error getting table columns:', err);
                            reject(err);
                            return;
                        }
                        
                        const hasArchivedColumn = columns.some(col => col.name === 'is_archived');
                        
                        if (!hasArchivedColumn) {
                            console.log('Adding is_archived column to existing database...');
                            db.run("ALTER TABLE blog_posts ADD COLUMN is_archived BOOLEAN DEFAULT 0", (err) => {
                                if (err) {
                                    console.error('Error adding is_archived column:', err);
                                    reject(err);
                                    return;
                                }
                                
                                console.log('is_archived column added successfully');
                                
                                // Now add the index
                                db.run("CREATE INDEX IF NOT EXISTS idx_blog_posts_archived ON blog_posts(is_archived)", (err) => {
                                    if (err) {
                                        console.error('Error creating archived index:', err);
                                        reject(err);
                                        return;
                                    }
                                    
                                    console.log('Archived index created successfully');
                                    db.close((err) => {
                                        if (err) {
                                            console.error('Error closing database:', err);
                                            reject(err);
                                        } else {
                                            console.log('Database initialization completed');
                                            resolve();
                                        }
                                    });
                                });
                            });
                        } else {
                            console.log('is_archived column already exists');
                            
                            // Ensure the index exists
                            db.run("CREATE INDEX IF NOT EXISTS idx_blog_posts_archived ON blog_posts(is_archived)", (err) => {
                                if (err) {
                                    console.error('Error creating archived index:', err);
                                    reject(err);
                                    return;
                                }
                                
                                console.log('Archived index ensured');
                                db.close((err) => {
                                    if (err) {
                                        console.error('Error closing database:', err);
                                        reject(err);
                                    } else {
                                        console.log('Database initialization completed');
                                        resolve();
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    });
}

// Run initialization if this script is executed directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database initialization completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initDatabase }; 