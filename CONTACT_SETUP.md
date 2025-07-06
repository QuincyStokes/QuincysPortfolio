# Contact Form Setup Guide

## Overview
The contact form on this portfolio website allows visitors to send messages directly to your email. It uses Gmail's SMTP service to send emails.

## Setup Instructions

### 1. Create Environment File
Copy the `env.example` file to `.env`:
```bash
cp env.example .env
```

### 2. Configure Gmail
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

### 3. Update Environment Variables
Edit the `.env` file with your Gmail credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
PORT=3000
```

### 4. Test the Contact Form
1. Start the server: `npm start`
2. Visit `http://localhost:3000/contact`
3. Fill out and submit the form
4. Check your email for the test message

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Make sure you have a `.env` file
   - Verify EMAIL_USER and EMAIL_PASS are set correctly

2. **"Email authentication failed"**
   - Ensure 2-Factor Authentication is enabled
   - Use an App Password, not your regular password
   - Check that the App Password is 16 characters

3. **"Connection to email server failed"**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

### Security Notes:
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use App Passwords instead of your main password
- Consider using environment variables in production

## Production Deployment
For production deployment, set the environment variables on your hosting platform:
- Heroku: Use `heroku config:set`
- Vercel: Use the dashboard environment variables
- Railway: Use the dashboard environment variables 