const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/projects', (req, res) => {
    res.render('projects');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Contact form submission
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    // Create a transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Contact from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 