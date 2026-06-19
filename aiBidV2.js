// ============================================================
//  AI BIDDING  — Bid Euchre (High/Low edition, 32-card deck)
//  Drop-in replacement for the aiBid() function.
//
//  Exports / uses the same globals as the rest of the game:
//    G, PL, SUITS, placeBid, bIdx, nextBid, finishBid, partnerOf
//
//  Card object shape assumed:  { r: 'J'|'Q'|'K'|'A',  s: '♠'|'♥'|'♦'|'♣' }
//  G.H[player]  — array of card objects
//  G.hBid       — null  or  { player, bid, trump, hl, alone, cardReq }
//  G.bids       — object keyed by player name
// ============================================================

// ── helpers ──────────────────────────────────────────────────

// Same-colour suit for bower logic
function bowerSuit(trump) {
    const pairs = { '♠': '♣', '♣': '♠', '♥': '♦', '♦': '♥' };
    return pairs[trump];
}

// Estimate tricks in a trump contract for a given hand
function evalTrump(hand, trump) {
    const left = bowerSuit(trump);
    let tricks = 0;

    // Count trump cards
    const trumpCards = hand.filter(c =>
        c.s === trump || (c.r === 'J' && c.s === left)
    );

    // Right bower (J of trump)
    const hasRight = hand.some(c => c.r === 'J' && c.s === trump);
    // Left bower  (J of same-colour suit)
    const hasLeft  = hand.some(c => c.r === 'J' && c.s === left);

    if (hasRight) tricks += 1;
    if (hasLeft)  tricks += 1;

    // Trump Aces, Kings, Queens (not bowers already counted)
    trumpCards.forEach(c => {
        if (c.r === 'J') return; // already handled
        if (c.r === 'A') tricks += 0.9;   // slight deduction: duplicate risk
        else if (c.r === 'K') tricks += 0.6;
        else if (c.r === 'Q') tricks += 0.35;
    });

    // Off-suit Aces are likely winners
    hand.forEach(c => {
        if (c.s === trump) return;
        if (c.r === 'J' && c.s === left) return; // left bower
        if (c.r === 'A') tricks += 0.75;
        else if (c.r === 'K' && trumpCards.length >= 3) tricks += 0.3; // K good if you can draw trump
    });

    return tricks;
}

function evalNTHigh(hand) {
    // Group cards by suit
    const bySuit = {};
    hand.forEach(c => {
        if (!bySuit[c.s]) bySuit[c.s] = [];
        bySuit[c.s].push(c.r);
    });

    let tricks = 0;

    SUITS.forEach(s => {
        const cards = bySuit[s] || [];
        if (cards.length === 0) return;

        // Count duplicates
        const countA = cards.filter(r => r === 'A').length;
        const countK = cards.filter(r => r === 'K').length;
        const countQ = cards.filter(r => r === 'Q').length;
        const countJ = cards.filter(r => r === 'J').length;

        // --- 1. Aces are guaranteed winners ---
        // 1 Ace = 1 trick, 2 Aces = 2 tricks
        let suitTricks = countA;

        // --- 2. Kings become winners if you hold both Aces ---
        if (countA === 2 && countK > 0) {
            suitTricks += countK;   // both Kings win
        }

        // --- 3. Queens become winners if Aces+Kings exhaust 3 rounds ---
        // Opponents have 4 cards of each suit total.
        // If you win 3 rounds, the 4th round is yours automatically.
        const roundsWon = suitTricks;

        if (roundsWon >= 3) {
            // All remaining cards in this suit are winners
            const totalCards = countA + countK + countQ + countJ;
            suitTricks = totalCards;
        } else {
            // Otherwise, Queens and Jacks are marginal
            if (countQ > 0) suitTricks += 0.2 * countQ;
            if (countJ > 0) suitTricks += 0.05 * countJ;
        }

        tricks += suitTricks;
    });

    return tricks;
}

/*
// Estimate tricks for NT High
function evalNTHigh(hand) {
    let tricks = 0;
    // In NT High: A > K > Q > J, no trump, first duplicate wins
    // Group by suit, look for winners
    const bySuit = {};
    hand.forEach(c => {
        if (!bySuit[c.s]) bySuit[c.s] = [];
        bySuit[c.s].push(c);
    });

    SUITS.forEach(s => {
        const cards = (bySuit[s] || []).map(c => c.r);
        const hasA = cards.includes('A');
        const hasK = cards.includes('K');
        const hasQ = cards.includes('Q');

        if (hasA) tricks += 0.9;       // Ace wins unless opponent has first copy
        if (hasK) tricks += hasA ? 0.5 : 0.3;  // K protected behind A
        if (hasQ) tricks += (hasA && hasK) ? 0.3 : 0.1;
    });

    return tricks;
}
*/
function evalNTLow(hand) {
    // Group cards by suit
    const bySuit = {};
    hand.forEach(c => {
        if (!bySuit[c.s]) bySuit[c.s] = [];
        bySuit[c.s].push(c.r);
    });

    let tricks = 0;

    SUITS.forEach(s => {
        const cards = bySuit[s] || [];
        if (cards.length === 0) return;

        // Count duplicates
        const countJ = cards.filter(r => r === 'J').length;
        const countQ = cards.filter(r => r === 'Q').length;
        const countK = cards.filter(r => r === 'K').length;
        const countA = cards.filter(r => r === 'A').length;

        // --- 1. Jacks are guaranteed winners ---
        // 1 Jack = 1 trick, 2 Jacks = 2 tricks
        let suitTricks = countJ;

        // --- 2. Queens become winners if you hold both Jacks ---
        if (countJ === 2 && countQ > 0) {
            suitTricks += countQ;   // both Queens win
        }

        // --- 3. If you win 3 rounds, you own the suit ---
        const roundsWon = suitTricks;

        if (roundsWon >= 3) {
            // All remaining cards in this suit are winners
            const totalCards = countJ + countQ + countK + countA;
            suitTricks = totalCards;
        } else {
            // Otherwise, K/A get marginal value
            if (countK > 0) suitTricks += 0.2 * countK;
            if (countA > 0) suitTricks += 0.05 * countA;
        }

        tricks += suitTricks;
    });

    return tricks;
}

/*
// Estimate tricks for NT Low  (J wins, then Q, K, A worst)
function evalNTLow(hand) {
    let tricks = 0;
    const bySuit = {};
    hand.forEach(c => {
        if (!bySuit[c.s]) bySuit[c.s] = [];
        bySuit[c.s].push(c);
    });

    SUITS.forEach(s => {
        const cards = (bySuit[s] || []).map(c => c.r);
        const hasJ = cards.includes('J');
        const hasQ = cards.includes('Q');
        const hasK = cards.includes('K');

        if (hasJ) tricks += 0.9;
        if (hasQ) tricks += hasJ ? 0.5 : 0.3;
        if (hasK) tricks += (hasJ && hasQ) ? 0.3 : 0.1;
        // Aces are liabilities in NT Low — subtract a little
        if (cards.includes('A') && !hasJ && !hasQ) tricks -= 0.2;
    });

    return Math.max(tricks, 0);
}
*/
// Return the best { suit, hl, score } across all contracts
function bestContract(hand) {
    let best = null;

    SUITS.forEach(s => {
        const score = evalTrump(hand, s);
        if (!best || score > best.score)
            best = { trump: s, hl: null, score };
    });

    const ntH = evalNTHigh(hand);
    if (ntH > best.score) best = { trump: 'NT', hl: 'high', score: ntH };

    const ntL = evalNTLow(hand);
    if (ntL > best.score) best = { trump: 'NT', hl: 'low', score: ntL };

    return best;   // { trump, hl, score }
}

// ── main AI bidding function ──────────────────────────────────
function aiBid(player) {

 //   cLog("aiBid start...:",player);
 
    const hand      = G.H[player];
    const partner   = partnerOf(player);
    const partnerBid = G.bids[partner];
    const minBid    = G.hBid ? G.hBid.bid + 1 : 1;

    const currentStrength = G.hBid
        ? bidStrength(G.hBid.bid, G.hBid.alone, G.hBid.cardReq)
        : -1;

    // Evaluate best contract
    const bc = bestContract(hand);
    const est = bc.score;

    // Conservative safe bid
    const safeBid = Math.max(1, Math.floor(est - 0.4));

    // Compute projected strengths
    function proj(amt, alone, cardReq) {
        return bidStrength(amt, alone, cardReq);
    }

    // Partner has high bid — only outbid if we are clearly stronger
    if (G.hBid && G.hBid.player === partner) {
        const myStrength = proj(safeBid, false, 0);

        if (myStrength <= currentStrength) {
            // Let partner keep the contract
	    speech(player, "Pass", 1800); 
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
    }

    // Consider Alone bids
    if (est >= 7.2) {
        const myStrength = proj(8, true, 0);
        if (myStrength > currentStrength) {
            placeBid(player, 8, bc.trump, bc.hl, true, 0);
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
    }

    if (est >= 6.5) {
        const myStrength = proj(8, true, 1);
        if (myStrength > currentStrength) {
            placeBid(player, 8, bc.trump, bc.hl, true, 1);
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
    }

    if (est >= 6.0) {
        const myStrength = proj(8, true, 2);
        if (myStrength > currentStrength) {
            placeBid(player, 8, bc.trump, bc.hl, true, 2);
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
    }

    // Standard bid
    if (safeBid >= minBid) {
        const bidAmt = Math.min(safeBid, 7);
        const myStrength = proj(bidAmt, false, 0);

        if (myStrength > currentStrength) {
            placeBid(player, bidAmt, bc.trump, bc.hl, false, 0);
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
    }

 //   cLog("aiBid pass:",player);
    
    // Pass
    speech(player, "Pass", 1800);     //was 1800
    bIdx++; setTimeout(nextBid, 300); //was 300
    
} //aiBid

/*
function aiBid(player) {
    const hand      = G.H[player];
    const partner   = partnerOf(player);
    const partnerBid = G.bids[partner];          // undefined if partner hasn't bid
    const minBid    = G.hBid ? G.hBid.bid + 1 : 1;
    const partnerHasHighBid = G.hBid && G.hBid.player === partner;

    // ── Evaluate best contract for this hand ──
    const bc = bestContract(hand);
    const estimatedTricks = Math.round(bc.score);  // round to nearest integer bid

    // ── Decide bid amount ──
    // We want to bid conservatively: floor the estimate slightly
    // to avoid overbidding.
    const safeBid = Math.max(1, Math.floor(bc.score - 0.4));

    // ── Partner already has the high bid ──
    // Only outbid partner if we can do substantially better
    // (i.e. we'd comfortably bid higher AND improve the contract).
    if (partnerHasHighBid) {
        // If our safe bid doesn't exceed partner's bid, let it ride — pass.
        if (safeBid <= G.hBid.bid) {
            bIdx++; setTimeout(nextBid, 300);
            return;
        }
        // If we can raise meaningfully, do so (we think we're the stronger hand)
    }

    // ── Check if going Alone (MoonShot or ask-card variants) ──
    // Only consider alone if estimate is very high
    if (bc.score >= 7.2) {
        // Full MoonShot: virtually certain of all 8 solo
        placeBid(player, 8, bc.trump, bc.hl, true, 0);
        bIdx++; setTimeout(nextBid, 300);
        return;
    }

    if (bc.score >= 6.5) {
        // Alone asking for 1 card from partner
        placeBid(player, 8, bc.trump, bc.hl, true, 1);
        bIdx++; setTimeout(nextBid, 300);
        return;
    }

    if (bc.score >= 6.0) {
        // Alone asking for 2 cards from partner
        placeBid(player, 8, bc.trump, bc.hl, true, 2);
        bIdx++; setTimeout(nextBid, 300);
        return;
    }

    // ── Standard numbered bid ──
    if (safeBid >= minBid) {
        // Cap at 7 (8 is alone territory)
        const bidAmt = Math.min(safeBid, 7);
        placeBid(player, bidAmt, bc.trump, bc.hl, false, 0);
        bIdx++;
	setTimeout(nextBid, 300);
        return;
    }

    // ── Pass ──
    speech(player, "Pass", 1800);
    
    bIdx++;
    setTimeout(nextBid, 300);
}
*/
