// Simplified header for clarity: improved Crossy Road clone script
document.addEventListener('touchstart', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { const now = new Date().getTime(); if (now - lastTouchEnd <= 300) e.preventDefault(); lastTouchEnd = now; }, false);
// (The user's full JS logic from before goes here unchanged, but using 120 FPS loop)
