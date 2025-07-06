// Contact Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!form || !submitBtn || !statusMessage) {
        console.error('Contact form elements not found');
        return;
    }
    
    // Show status message
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    // Hide status message
    function hideStatus() {
        statusMessage.style.display = 'none';
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide any previous status messages
        hideStatus();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        // Basic client-side validation
        if (!formData.name || !formData.email || !formData.message) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }
        
        // Update button state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                let errorMsg = data.error || 'Failed to send message';
                
                // Provide more specific error messages
                if (response.status === 429) {
                    errorMsg = 'Too many attempts. Please wait a few minutes before trying again.';
                } else if (data.details && data.details.includes('EMAIL_USER')) {
                    errorMsg = 'Email service not configured. Please contact me directly.';
                } else if (data.details && data.details.includes('EAUTH')) {
                    errorMsg = 'Email authentication failed. Please try again later.';
                } else if (data.details && data.details.includes('ECONNECTION')) {
                    errorMsg = 'Connection error. Please check your internet and try again.';
                }
                
                showStatus(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Network error:', error);
            showStatus('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}); 