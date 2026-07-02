// Simple animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add click animation to game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Only animate if not clicking a disabled button
            if (e.target.tagName === 'A' || (e.target.tagName === 'BUTTON' && !e.target.disabled)) {
                card.style.animation = 'none';
                setTimeout(() => {
                    card.style.animation = 'slideIn 0.4s ease';
                }, 10);
            }
        });
    });

    // Prevent double tap zoom on game cards
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Log game visits
    const links = document.querySelectorAll('.btn-primary');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const gameName = e.target.closest('.game-card').querySelector('h2').textContent;
            console.log(`Launching: ${gameName}`);
            // Could add analytics here
        });
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Could add a menu or navigation here
    }
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Game collection is now visible');
    }
});

// Mobile detection for analytics
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Initialize
window.addEventListener('load', () => {
    console.log('Jax Queen Games Collection Loaded');
    if (isMobileDevice()) {
        console.log('Mobile device detected');
    }
});
