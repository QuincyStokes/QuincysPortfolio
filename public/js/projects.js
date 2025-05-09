console.log('[Carousel Debug] Script loaded and running');
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.project-card').forEach(function(card, cardIdx) {
        const images = JSON.parse(card.getAttribute('data-images'));
        const alts = JSON.parse(card.getAttribute('data-alts'));
        let currentIndex = 0;
        const img = card.querySelector('.carousel-img');
        const dots = card.querySelectorAll('.dot');
        const leftBtn = card.querySelector('.carousel-btn.left');
        const rightBtn = card.querySelector('.carousel-btn.right');

        if (!img) console.warn(`[Carousel Debug] Card ${cardIdx}: .carousel-img not found.`);
        if (!leftBtn) console.warn(`[Carousel Debug] Card ${cardIdx}: .carousel-btn.left not found.`);
        if (!rightBtn) console.warn(`[Carousel Debug] Card ${cardIdx}: .carousel-btn.right not found.`);
        if (dots.length === 0) console.warn(`[Carousel Debug] Card ${cardIdx}: .dot elements not found.`);

        function updateCarousel() {
            if (!img) return;
            img.src = images[currentIndex];
            img.alt = alts[currentIndex];
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
            console.log(`[Carousel Debug] Card ${cardIdx}: Updated to image index ${currentIndex} (src: ${images[currentIndex]}, alt: ${alts[currentIndex]})`);
        }

        if (leftBtn) {
            leftBtn.addEventListener('click', function() {
                const prevIndex = currentIndex;
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                console.log(`[Carousel Debug] Card ${cardIdx}: Left button clicked. Index: ${prevIndex} -> ${currentIndex}`);
                updateCarousel();
            });
            console.log(`[Carousel Debug] Card ${cardIdx}: Left button event attached.`);
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', function() {
                const prevIndex = currentIndex;
                currentIndex = (currentIndex + 1) % images.length;
                console.log(`[Carousel Debug] Card ${cardIdx}: Right button clicked. Index: ${prevIndex} -> ${currentIndex}`);
                updateCarousel();
            });
            console.log(`[Carousel Debug] Card ${cardIdx}: Right button event attached.`);
        }
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', function() {
                const prevIndex = currentIndex;
                currentIndex = idx;
                console.log(`[Carousel Debug] Card ${cardIdx}: Dot ${idx} clicked. Index: ${prevIndex} -> ${currentIndex}`);
                updateCarousel();
            });
        });
        console.log(`[Carousel Debug] Card ${cardIdx}: Carousel initialized with ${images.length} images.`);
        updateCarousel();
    });
}); 