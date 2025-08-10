const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Simple rate limiting for contact form
const contactAttempts = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3; // Max 3 attempts per IP per window

const app = express();
const PORT = process.env.PORT || 3000;

// Import database initialization
const { initDatabase } = require('./database/init');

// Auto-import blog posts on server start
async function initializeBlog() {
    try {
        // Initialize database first (adds is_archived column if needed)
        await initDatabase();
        
        const blogManager = new BlogManager();
        await blogManager.init();
        await blogManager.importAllPosts();
        await blogManager.close();
        console.log('Blog posts auto-imported successfully!');
    } catch (error) {
        console.error('Error auto-importing blog posts:', error);
    }
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    // Initialize blog after server starts
    initializeBlog();
});


// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import blog manager for auto-import
const BlogManager = require('./database/blogManager');

// Routes
app.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });
});

app.get('/projects', (req, res) => {
    res.render('projects', { currentPage: 'projects' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { currentPage: 'contact' });
});

// Blog routes
app.use('/blog', require('./routes/blog'));

// Contact form submission
app.post('/contact', async (req, res) => {
    // Rate limiting
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const clientAttempts = contactAttempts.get(clientIP) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = clientAttempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
        console.log(`Rate limit exceeded for IP: ${clientIP}`);
        return res.status(429).json({
            success: false,
            error: 'Too many attempts. Please wait a few minutes before trying again.'
        });
    }
    
    // Add current attempt
    recentAttempts.push(now);
    contactAttempts.set(clientIP, recentAttempts);
    
    // Validate request body
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        console.error('Missing required fields');
        return res.status(400).json({ 
            success: false, 
            error: 'Please fill in all fields' 
        });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('Invalid email format');
        return res.status(400).json({ 
            success: false, 
            error: 'Please enter a valid email address' 
        });
    }
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing email configuration');
        return res.status(500).json({ 
            success: false, 
            error: 'Email service not configured',
            details: 'EMAIL_USER or EMAIL_PASS not set in environment variables'
        });
    }
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        await transporter.verify();
        
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Contact from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact form submission sent successfully');
        
        res.json({ 
            success: true,
            message: 'Message sent successfully!'
        });
        
    } catch (error) {
        console.error('Error sending email:', error.message);
        
        let errorMessage = 'Failed to send message';
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed - check your app password';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Connection to email server failed';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            details: error.message 
        });
    }
});
