/* ==============================
   Responsive Screen Scaling
   Auto-scales all gauges to fit device screen size
   Perfect for tablets rotating between portrait/landscape
   ============================== */

// Define your target/reference screen size (e.g., iPad Air landscape)
const TARGET_WIDTH = 900;   // Adjust to your preferred default width
const TARGET_HEIGHT = 600;   // Adjust to your preferred default height

function scaleToScreenSize() {
    // Get actual viewport dimensions
    const actualWidth = window.innerWidth;
    const actualHeight = window.innerHeight;
    
    // Calculate scale factor (fit to smallest dimension)
    const scaleX = actualWidth / TARGET_WIDTH;
    const scaleY = actualHeight / TARGET_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1); // Never scale UP above 1x (avoid pixelation)
    
    // Apply scale to the body (scales everything including gauges)
    document.body.style.transform = `scale(${scale})`;
    document.body.style.transformOrigin = '0 0';  // Scale from top-left
    document.body.style.width = `${100 / scale}%`;
    document.body.style.height = `${100 / scale}%`;
    
   // console.log(`Screen: ${actualWidth}x${actualHeight} → Scale: ${scale.toFixed(2)}x`);
}

// Apply scaling on page load
window.addEventListener('load', scaleToScreenSize);

// Re-apply scaling when window is resized (portrait ↔ landscape rotation)
window.addEventListener('resize', scaleToScreenSize);

// Re-apply scaling on orientation change (important for mobile devices)
window.addEventListener('orientationchange', () => {
    setTimeout(scaleToScreenSize, 100); // Small delay to let browser update dimensions
});
