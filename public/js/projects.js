// Image carousel for project cards
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.project-card[data-images]').forEach(function(card) {
        const images = JSON.parse(card.getAttribute('data-images'));
        const alts = JSON.parse(card.getAttribute('data-alts') || '[]');
        const img = card.querySelector('.carousel-img');
        const dots = card.querySelectorAll('.dot');
        const leftBtn = card.querySelector('.carousel-btn.left');
        const rightBtn = card.querySelector('.carousel-btn.right');

        if (!img) return;

        // A single image needs no controls — hide them.
        if (images.length <= 1) {
            if (leftBtn) leftBtn.style.display = 'none';
            if (rightBtn) rightBtn.style.display = 'none';
            const dotsRow = card.querySelector('.carousel-dots');
            if (dotsRow) dotsRow.style.display = 'none';
            return;
        }

        let currentIndex = 0;

        function updateCarousel() {
            img.src = images[currentIndex];
            img.alt = alts[currentIndex] || '';
            dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
        }

        if (leftBtn) {
            leftBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateCarousel();
            });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % images.length;
                updateCarousel();
            });
        }
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', function() {
                currentIndex = idx;
                updateCarousel();
            });
        });

        updateCarousel();
    });
});
