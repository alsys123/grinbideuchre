/* ═══════════════════════════════════════════════════════════════
 DEAL NUMBER SYSTEM — full 17-digit coverage, 3-5-9 format
 e.g. "047 - 82341 - 067459821"
30 quadrillion = 30,000,000,000,000,000  possibilities
 ═══════════════════════════════════════════════════════════════
*/

let lastDealNumber = 0n;  // BigInt

function randomDealNumber() {
    const hi  = BigInt(Math.floor(Math.random() * 1000));
    const mid = BigInt(Math.floor(Math.random() * 100000));
    const lo  = BigInt(Math.floor(Math.random() * 1000000000));
    return hi * 100000000000000n + mid * 1000000000n + lo + 1n;
}

function formatDealNumber(n) {
    const s = n.toString().padStart(17, '0');
    return s.slice(0,3) + ' - ' + s.slice(3,8) + ' - ' + s.slice(8,17);
    // e.g. "047 - 82341 - 067459821"
}

function parseDealNumber(str) {
    // accepts "047 - 82341 - 067459821" or "04782341067459821" or anything between
    const cleaned = str.replace(/[\s\-]/g, '');
    if (!/^\d{1,17}$/.test(cleaned)) return null;  // invalid
    return BigInt(cleaned);
}

function shuffleByDeal(deckArr, dealNumber) {
    // dealNumber = 0n or null means random
    if (!dealNumber || dealNumber === 0n) {
        dealNumber = randomDealNumber();
    }
    lastDealNumber = dealNumber;

    // Factoradic / Lehmer shuffle — every number maps to a unique deal
    let n = dealNumber;
    const a = [...deckArr];
    const len = a.length;  // 32

    for (let i = len - 1; i > 0; i--) {
        const j = Number(n % BigInt(i + 1));
        n = n / BigInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── CALL THIS after each deal to show the number in your UI ──
function showDealNumber() {
    const el = document.getElementById('deal-number');
    if (el) el.textContent = 'Deal # ' + formatDealNumber(lastDealNumber);
}

// ── CALL THIS when player submits a deal number to replay ────
function replayDeal(inputStr) {
    const n = parseDealNumber(inputStr);
    if (!n) { alert('Invalid deal number'); return; }
    requestedDeal = n;
    deal();  // your existing deal() function
}

// BEFORE:
const dk = shuffle(deck());

// AFTER:
const dk = shuffleByDeal(deck(), requestedDeal);
requestedDeal = null;  // reset to random after replay
showDealNumber();

let requestedDeal = null;  // null = random, BigInt = specific deal


<!-- shows current deal number -->
<div id="deal-number" style="font-size:11px; color:var(--gold); 
     letter-spacing:1px; cursor:pointer" 
     title="Click to replay this deal"
     onclick="promptReplay()">
</div>

<!-- replay input (show/hide as needed) -->
<div id="replay-box" style="display:none;">
    <input id="replay-input" type="text" placeholder="047 - 82341 - 067459821"
           style="font-family:Georgia,serif; font-size:13px; 
                  background:rgba(0,0,0,0.5); color:var(--cream);
                  border:1px solid var(--gold-dark); border-radius:6px;
                  padding:5px 10px; width:200px;">
    <button onclick="replayDeal(document.getElementById('replay-input').value)"
            class="abtn">Go</button>
</div>

function promptReplay() {
    const box = document.getElementById('replay-box');
    box.style.display = box.style.display === 'none' ? 'flex' : 'none';
}







