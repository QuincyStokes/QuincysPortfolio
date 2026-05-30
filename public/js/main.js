// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

// Check for saved theme preference and apply immediately
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) updateThemeIcon(savedTheme);
} else {
    // Default to light theme if no preference is saved
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) updateThemeIcon('light');
}

// Theme toggle click handler
if (themeToggle && themeIcon) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// Update theme icon
function updateThemeIcon(theme) {
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Parallax Scrolling Effect
const parallaxBg = document.querySelector('.parallax-bg');
if (parallaxBg) {
    // Ensure background covers full document height
    function updateParallaxHeight() {
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        parallaxBg.style.height = `${documentHeight}px`;
    }
    
    // Update height on load and resize
    updateParallaxHeight();
    window.addEventListener('resize', updateParallaxHeight);
    
    // Parallax scroll effect with smooth movement
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5; // Slower, smoother parallax effect
        parallaxBg.style.transform = `translateY(${rate}px)`;
    });
} 