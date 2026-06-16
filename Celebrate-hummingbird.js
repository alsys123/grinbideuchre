
// ============================================================
// celebrateMatchWin_canvasHummingbirds_v1
//
// Hummingbirds flutter around the screen and periodically
// fly in to feed at a drawn feeder, hover briefly, then
// dart back out.  Follows the same gCelebrationRunning /
// gCelebrationTimer pattern as the butterfly animations.
// ============================================================

function celebrateMatchWin_canvasHummingbirds_v1() {

    log("celebrateMatchWin_canvasHummingbirds_v1", "player");

    const canvas = document.getElementById("starburst-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position    = "fixed";
    canvas.style.left        = "0";
    canvas.style.top         = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex      = "999999";
    canvas.style.display     = "block";

    gCelebrationRunning = true;
    gCelebrationTimer = setTimeout(() => gCelebrationRunning = false, CelebrationLength);

    // ----------------------------------------------------------
    // FEEDER  (drawn once per frame at a fixed screen position)
    // ----------------------------------------------------------
    const feeder = {
        x: canvas.width  * 0.5,
        y: canvas.height * 0.62,   // lower-centre of screen
        swing: 0,                   // gentle sway angle
        swingSpeed: 0.008
    };

    function drawFeeder(fx, fy) {
        ctx.save();
        ctx.translate(fx, fy);

        // --- Hanging wire ---
        ctx.strokeStyle = "#5D4037";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(0, -60);
        ctx.stroke();

        // --- Red cap / roof ---
        ctx.fillStyle = "#C62828";
        ctx.beginPath();
        ctx.moveTo(-52, -60);
        ctx.lineTo( 52, -60);
        ctx.lineTo( 42, -40);
        ctx.lineTo(-42, -40);
        ctx.closePath();
        ctx.fill();

        // Roof ridge highlight
        ctx.fillStyle = "#EF5350";
        ctx.beginPath();
        ctx.moveTo(-52, -60);
        ctx.lineTo( 52, -60);
        ctx.lineTo( 52, -54);
        ctx.lineTo(-52, -54);
        ctx.closePath();
        ctx.fill();

        // --- Clear reservoir body ---
        ctx.fillStyle = "rgba(180, 230, 255, 0.82)";
        ctx.strokeStyle = "#90CAF9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-40, -40, 80, 70, 10);
        ctx.fill();
        ctx.stroke();

        // Nectar level (red liquid inside)
        ctx.fillStyle = "rgba(229, 57, 53, 0.55)";
        ctx.beginPath();
        ctx.roundRect(-38, 2, 76, 26, [0, 0, 8, 8]);
        ctx.fill();

        // --- Base / flower ports ---
        ctx.fillStyle = "#C62828";
        ctx.beginPath();
        ctx.roundRect(-44, 30, 88, 14, 6);
        ctx.fill();

        // Three feeding ports
        const portXs = [-22, 0, 22];
        for (const px of portXs) {
            // port tube
            ctx.fillStyle = "#B71C1C";
            ctx.beginPath();
            ctx.arc(px, 48, 5, 0, Math.PI * 2);
            ctx.fill();
            // port opening (yellow)
            ctx.fillStyle = "#FFD600";
            ctx.beginPath();
            ctx.arc(px, 48, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Perch ring ---
        ctx.strokeStyle = "#C62828";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 48, 38, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // ----------------------------------------------------------
    // LOAD HUMMINGBIRD PNG IMAGES
    // (expects images/hummingbirds/h1.png … h8.png)
    // Falls back to a canvas-drawn bird if images don't load.
    // ----------------------------------------------------------
    const speciesImages = [];
    const imagePaths = [
        "images/hummingbirds/h1.png",
        "images/hummingbirds/h2.png",
        "images/hummingbirds/h3.png",
        "images/hummingbirds/h4.png",
        "images/hummingbirds/h5.png",
        "images/hummingbirds/h6.png",
        "images/hummingbirds/h7.png",
        "images/hummingbirds/h8.png"
    ];

    for (const p of imagePaths) {
        const img = new Image();
        img.src = p;
        speciesImages.push(img);
    }

    // ----------------------------------------------------------
    // CANVAS-DRAWN FALLBACK HUMMINGBIRD
    // size ~1 → draws a bird roughly 60 px wide
    // ----------------------------------------------------------
    const hummingbirdColors = [
        { body: "#1B5E20", throat: "#F44336" },   // ruby-throat
        { body: "#1A237E", throat: "#E91E63" },   // blue
        { body: "#4A148C", throat: "#76FF03" },   // purple-green
        { body: "#004D40", throat: "#FF6F00" },   // teal-orange
        { body: "#263238", throat: "#FFEB3B" },   // dark-yellow
    ];

    function drawHummingbirdCanvas(ctx, size, facing, colorSet) {
        // facing = 1 (right) or -1 (left)
        ctx.save();
        ctx.scale(facing, 1);

        const s = size;

        // Body
        ctx.fillStyle = colorSet.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 18, s * 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Throat patch
        ctx.fillStyle = colorSet.throat;
        ctx.beginPath();
        ctx.ellipse(s * 8, s * 3, s * 8, s * 6, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = colorSet.body;
        ctx.beginPath();
        ctx.arc(s * 18, -s * 2, s * 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = "#212121";
        ctx.beginPath();
        ctx.arc(s * 22, -s * 4, s * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(s * 23, -s * 4.5, s * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Bill
        ctx.strokeStyle = "#212121";
        ctx.lineWidth = s * 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s * 26, -s * 2);
        ctx.lineTo(s * 46, -s * 2);
        ctx.stroke();

        // Tail
        ctx.fillStyle = colorSet.body;
        ctx.beginPath();
        ctx.moveTo(-s * 16, 0);
        ctx.lineTo(-s * 30, -s * 6);
        ctx.lineTo(-s * 28, s * 2);
        ctx.lineTo(-s * 30, s * 8);
        ctx.lineTo(-s * 16, s * 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // ----------------------------------------------------------
    // WING FLICKER  (drawn as a blurred oval — hummingbird wings
    // move ~50 Hz, so we just draw a semi-transparent arc)
    // ----------------------------------------------------------
    function drawWings(ctx, size, wingPhase) {
        // Two quick arcs above and below body
        const opacity = 0.25 + Math.abs(Math.sin(wingPhase)) * 0.25;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "rgba(200, 230, 200, 0.6)";

        // Upper wing blur
        ctx.beginPath();
        ctx.ellipse(0, -size * 14, size * 22, size * 7, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Lower wing blur
        ctx.beginPath();
        ctx.ellipse(0, size * 14, size * 22, size * 6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ----------------------------------------------------------
    // HUMMINGBIRD FACTORY
    // ----------------------------------------------------------
    const BIRD_COUNT = 14;
    const birds = [];

    // Port positions relative to feeder centre
    const portOffsets = [
        { dx: -22, dy: 48 },
        {  dx: 0,  dy: 48 },
        {  dx: 22, dy: 48 }
    ];

    function randomEdgeStart() {
        // Start from a random screen edge
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) return { x: Math.random() * canvas.width, y: -60 };
        if (edge === 1) return { x: canvas.width + 60, y: Math.random() * canvas.height };
        if (edge === 2) return { x: Math.random() * canvas.width, y: canvas.height + 60 };
        return { x: -60, y: Math.random() * canvas.height };
    }

    function makeBird() {
        const start = randomEdgeStart();
        const colorSet = hummingbirdColors[Math.floor(Math.random() * hummingbirdColors.length)];
        const imgIdx   = Math.floor(Math.random() * speciesImages.length);

        return {
            x: start.x,
            y: start.y,

            // Velocity while roaming
            vx: (Math.random() - 0.5) * 2.5,
            vy: (Math.random() - 0.5) * 2.5,

            size:  0.7 + Math.random() * 0.6,  // scale multiplier
            depth: 0.5 + Math.random() * 0.5,  // parallax-like

            facing: Math.random() < 0.5 ? 1 : -1,

            // Wing animation
            wingPhase: Math.random() * Math.PI * 2,
            wingSpeed: 0.55 + Math.random() * 0.3,   // fast!

            // Body bob
            bobPhase: Math.random() * Math.PI * 2,

            // State machine
            // 'roam' → drifts freely
            // 'approach' → flying toward feeder port
            // 'feed' → hovering at port
            // 'depart' → flying away from feeder
            state: 'roam',
            stateTimer: 60 + Math.random() * 120,    // frames until next state check

            // Assigned feeder port (set when approaching)
            portIdx: 0,
            targetX: 0,
            targetY: 0,

            colorSet,
            imgIdx,

            // S-curve roaming
            sPhase: Math.random() * Math.PI * 2,
            sSpeed: 0.02 + Math.random() * 0.02,

            dead: false
        };
    }

    for (let i = 0; i < BIRD_COUNT; i++) {
        const b = makeBird();
        // Scatter initial positions across the screen rather than all on edges
        b.x = Math.random() * canvas.width;
        b.y = Math.random() * canvas.height;
        birds.push(b);
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------
    function updateBird(b) {
        b.wingPhase += b.wingSpeed;
        b.bobPhase  += 0.05;
        b.sPhase    += b.sSpeed;

        b.stateTimer--;

        if (b.state === 'roam') {
            // S-curve drifting
            b.x += b.vx * b.depth + Math.sin(b.sPhase) * 1.0 * b.depth;
            b.y += b.vy * b.depth + Math.cos(b.sPhase * 0.7) * 0.5 * b.depth;

            b.facing = b.vx >= 0 ? 1 : -1;

            // Time to visit the feeder?
            if (b.stateTimer <= 0) {
                b.portIdx  = Math.floor(Math.random() * portOffsets.length);
                const port = portOffsets[b.portIdx];
                b.targetX  = feeder.x + port.dx;
                b.targetY  = feeder.y + port.dy;
                b.state    = 'approach';
                b.stateTimer = 0;
            }

            // Wrap / bounce near edges
            if (b.x < -100 || b.x > canvas.width + 100 ||
                b.y < -100 || b.y > canvas.height + 100) {
                // Steer back toward centre
                b.vx += (canvas.width  / 2 - b.x) * 0.001;
                b.vy += (canvas.height / 2 - b.y) * 0.001;
                // Clamp speed
                const spd = Math.hypot(b.vx, b.vy);
                if (spd > 3) { b.vx = b.vx / spd * 3; b.vy = b.vy / spd * 3; }
            }

        } else if (b.state === 'approach') {
            // Fly toward target port
            const dx = b.targetX - b.x;
            const dy = b.targetY - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 6) {
                b.x = b.targetX;
                b.y = b.targetY;
                b.state      = 'feed';
                b.stateTimer = 80 + Math.random() * 120;   // hover 1-3 s
            } else {
                const spd = Math.min(4, dist * 0.06 + 1.5);
                b.vx = (dx / dist) * spd;
                b.vy = (dy / dist) * spd;
                b.x += b.vx;
                b.y += b.vy;
                b.facing = b.vx >= 0 ? 1 : -1;
            }

        } else if (b.state === 'feed') {
            // Hover at port — tiny random wobble
            b.x += (Math.random() - 0.5) * 0.8;
            b.y += Math.sin(b.bobPhase) * 0.4;

            if (b.stateTimer <= 0) {
                // Depart
                const angle = Math.random() * Math.PI * 2;
                b.vx = Math.cos(angle) * (1.5 + Math.random() * 1.5);
                b.vy = Math.sin(angle) * (1.5 + Math.random() * 1.5);
                b.state      = 'depart';
                b.stateTimer = 40 + Math.random() * 60;
            }

        } else if (b.state === 'depart') {
            b.x += b.vx * b.depth + Math.sin(b.sPhase) * 0.8;
            b.y += b.vy * b.depth;
            b.facing = b.vx >= 0 ? 1 : -1;

            if (b.stateTimer <= 0) {
                b.state      = 'roam';
                b.stateTimer = 90 + Math.random() * 180;
                // Slightly randomise velocity for roam
                b.vx = (Math.random() - 0.5) * 2.5;
                b.vy = (Math.random() - 0.5) * 2.5;
            }
        }
    }

    // ----------------------------------------------------------
    // DRAW ONE BIRD
    // ----------------------------------------------------------
    function drawBird(b) {
        const s = b.size * b.depth;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Wing blur
        drawWings(ctx, s, b.wingPhase);

        // Try PNG image first
        const img = speciesImages[b.imgIdx];
        if (img && img.complete && img.naturalWidth > 0) {
            const dim = s * 60;
            // Flip horizontally if facing left
            if (b.facing < 0) {
                ctx.scale(-1, 1);
            }
            ctx.drawImage(img, -dim / 2, -dim / 2, dim, dim);
        } else {
            // Canvas-drawn fallback
            drawHummingbirdCanvas(ctx, s, b.facing, b.colorSet);
        }

        ctx.restore();
    }

    // ----------------------------------------------------------
    // MAIN LOOP
    // ----------------------------------------------------------
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update feeder sway
        feeder.swing += feeder.swingSpeed;

        // Draw feeder (with gentle pendulum sway)
        ctx.save();
        ctx.translate(feeder.x, feeder.y - 60);          // pivot at top
        ctx.rotate(Math.sin(feeder.swing) * 0.03);
        drawFeeder(0, 60);                                 // offset back down
        ctx.restore();

        // Update & draw birds
        for (const b of birds) {
            if (b.dead) continue;
            updateBird(b);
            drawBird(b);
        }

        if (!gCelebrationRunning) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = "none";
            return;
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

} // celebrateMatchWin_canvasHummingbirds_v1
