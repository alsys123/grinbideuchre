
// *****  EXCHANGE *****

// *** Going alone - asking for 1 or 2 cards ***
// exchange the cards
function startExchange(n, player) {

    cLog("start the exchange cards: ",n,". For player (winner):", player);
    
    // player defaults to 'south' for backward compatibility
    if (!player) player = 'south';
    
    G.phase = 'exchange';
    G.exchangePlayer = player;  // Track which player is exchanging
    G.exchangeCount = n;
    G.exchangeGive = []; // cards player gives
    G.exchangeGet = [];  // cards partner gives

    const partner = partnerOf(player);

    // winner of the bidding is player
    
    if (player === 'south') {
        // Human player - show UI
        speech('south', 'Select ' + n + ' card' + (n===1?'':'s') +
               ' to put down.', 3000);

        // highlight playable cards
        const hand = $('hand-south').children;
        for (let el of hand) {
            el.classList.add('exchange-select');
            el.addEventListener('click', () => pickExchangeCard(el));
        }
        return;
    } // south exchange
    
    if (player === 'north') {
//        cLog("#1: North needs ",n, "cards ",prettyHand(G.H["north"]));

        // North is bidder going alone.
        // South (human) picks N cards to GIVE to North.
        // North (AI) will give its worst N cards back to South in finalizeExchange.

        speech('south', 'Select ' + n + ' card' + (n===1?'':'s') +
               ' to give your partner.', 3000);

        // Highlight South's cards for selection
        const hand = $('hand-south').children;
        for (let el of hand) {
            el.classList.add('exchange-select');
            el.addEventListener('click', () => pickExchangeCard(el));
        }
        return;
    } // north exchange

    // Otherwise computer is giving to computer
    // either east --> west or west --> east
    setTimeout(() => aiGiveWorst(player, n), 800);
}//startExchange

// One card at a time we select the card to exchange.
// When all are selected then finalizeExchange.
// NOTE: always South clicking, but the DIRECTION depends on who the bidder is.
function pickExchangeCard(el) {
    if (G.exchangeGive.length >= G.exchangeCount) return;

    const uid = parseInt(el.dataset.cid);

    // South is always doing the clicking —
    // but when North is the bidder, South is the PARTNER giving cards
    const card = G.H.south.find(c => c.uid === uid);

    if (!card) return;

    el.classList.add('selected');
    G.exchangeGive.push(card);

    if (G.exchangeGive.length === G.exchangeCount) {
        finalizeExchange();
    }
}

/*
function aiGiveWorst(player, n) {

//    cLog("aiGiveWorst");
    
    // AI automatically selects N worst cards to give
    const hand = [...G.H[player]];

    const rankVal = { 'J':1, 'Q':2, 'K':3, 'A':4 };

    hand.sort((a,b) => {
        const aTrump = (a.s === G.trump);
        const bTrump = (b.s === G.trump);

        // Select worst cards (opposite of partner selection)
        // In HIGH mode: give weakest
        if (G.hl === 'high') {
            if (aTrump !== bTrump) return aTrump - bTrump;  // non-trump first
            return rankVal[a.r] - rankVal[b.r];              // weakest rank
        }

        // In LOW mode: give strongest
        if (G.hl === 'low') {
            if (aTrump !== bTrump) return bTrump - aTrump;  // trump first
            return rankVal[b.r] - rankVal[a.r];              // strongest rank
        }
	
    }); // hand sort

    G.exchangeGive = hand.slice(0, n);  // worst N cards
    finalizeExchange();
}
*/


// This is the AI selecting N best cards to give away to the bidder
function aiPartnerBestCards(partner, n) {
    const hand = [...G.H[partner]];

    const rankVal = { 'J':1, 'Q':2, 'K':3, 'A':4 };

    hand.sort((a,b) => {
        const aTrump = (a.s === G.trump);
        const bTrump = (b.s === G.trump);

        // HIGH mode → give strongest cards
        if (G.hl === 'high') {
            if (aTrump !== bTrump) return bTrump - aTrump;
            return rankVal[b.r] - rankVal[a.r];
        }

        // LOW mode → give weakest cards
        if (G.hl === 'low') {
            if (aTrump !== bTrump) return aTrump - bTrump;
            return rankVal[a.r] - rankVal[b.r];
        }
    });

    return hand.slice(0, n);
}

function finalizeExchange() {
    const player  = G.exchangePlayer || 'south';   // bidder
    const partner = partnerOf(player);             // partner of bidder
    const n       = G.exchangeCount;

    cLog("finalizeExchange: bidder=", player, " partner=", partner, " n=", n);

    let playerReceives = [];
    let partnerReceives = [];

    const southInvolved = (player === 'south' || partner === 'south');

    // ────────────────────────────────────────────────
    // CASE 1 — SOUTH is bidder (normal human exchange)
    // ────────────────────────────────────────────────
    if (player === 'south') {
        // South gives → partner receives
        partnerReceives = [...G.exchangeGive];

        // Partner gives best → South receives
        playerReceives = aiPartnerBestCards(partner, n);
    }

    // ────────────────────────────────────────────────
    // CASE 2 — NORTH is bidder going alone
    // SOUTH clicks cards to give to NORTH
    // ────────────────────────────────────────────────
    else if (player === 'north' && partner === 'south') {
        // South gives → North receives
        playerReceives = [...G.exchangeGive];

        // North gives worst → South receives
        partnerReceives = aiGiveWorstCards('north', n);
    }

    // ────────────────────────────────────────────────
    // CASE 3 — EAST or WEST is bidder
    // SOUTH is NOT involved at all
    // AI ↔ AI exchange
    // ────────────────────────────────────────────────
    else {
        // Bidder gives worst cards
        const bidderGives = aiGiveWorstCards(player, n);

        // Partner gives best cards
        const partnerGives = aiPartnerBestCards(partner, n);

        // Bidder receives partner's best
        playerReceives = partnerGives;

        // Partner receives bidder's worst
        partnerReceives = bidderGives;
    }

    cLog("#EXCHANGE: playerReceives=", playerReceives,
         " partnerReceives=", partnerReceives);

    // ────────────────────────────────────────────────
    // REMOVE CARDS
    // ────────────────────────────────────────────────

    // SOUTH gave cards only if SOUTH clicked
    if (southInvolved && G.exchangeGive.length > 0) {
        G.exchangeGive.forEach(c => {
            const idx = G.H['south'].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H['south'].splice(idx, 1);
        });
    }

    // Bidder gives cards (AI case)
    if (!southInvolved) {
        partnerReceives.forEach(c => {
            const idx = G.H[player].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H[player].splice(idx, 1);
        });
    }

    // Partner gives cards
    if (!(player === 'north' && partner === 'south')) {
        // Normal partner removal
        playerReceives.forEach(c => {
            const idx = G.H[partner].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H[partner].splice(idx, 1);
        });
    } else {
        // NORTH alone case: remove from NORTH
        partnerReceives.forEach(c => {
            const idx = G.H['north'].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H['north'].splice(idx, 1);
        });
    }

    // ────────────────────────────────────────────────
    // ADD RECEIVED CARDS
    // ────────────────────────────────────────────────

    G.H[player].push(...playerReceives);
    G.H[partner].push(...partnerReceives);

    // Sort both hands
    sortBase(G.H[player]);
    sortBase(G.H[partner]);

    // Save count
    G.lastExchangeCount = n;

    // Build exchange record
    exch = {
        deal: G.dealNumber,
        bidder: player,
        partner: partner,
        count: n,
        give: G.exchangeGive.map(c => ({...c})),
        get: playerReceives.map(c => ({...c})),
        partnerGives: partnerReceives.map(c => ({...c})),
        southHandAfter: G.H.south.map(c => ({...c})),
        northHandAfter: G.H.north.map(c => ({...c}))
    };

    cLog("#EXCHANGE RECORD:", exch);

    // Clear state
    G.exchangeGive  = [];
    G.exchangeGet   = [];
    G.exchangeCount = 0;
    G.exchangePlayer = null;

    // Reset cardReq
    G.hBid.cardReq = 0;

    // Continue bidding
    setTimeout(() => finishBid(), 300);

    // Update visuals
    if (southInvolved) {
        renderHands(true,  'south');
        renderHands(false, partner);
        speech('south', 'Exchange complete.', 2000);
    } else {
        // AI ↔ AI
        renderHands(false, player);
        renderHands(false, partner);
    }
} //finalizeExchange

/*
function finalizeExchange() {
    const player  = G.exchangePlayer || 'south';
    const partner = partnerOf(player);
    const n       = G.exchangeCount;

    cLog("finalizeExchange #2: winner:", player, " his partner:", partner, n);

    // ── Determine what each side gives ───────────────────────────
    //
    // G.exchangeGive always holds the cards that SOUTH clicked.
    //
    // Case A: player=south, partner=north (or east/west)
    //   South is the BIDDER giving cards.
    //   Partner (AI) gives best cards back.
    //   southGives = G.exchangeGive
    //   partnerGives = aiPartnerBestCards(partner, n)
    //
    // Case B: player=north, partner=south
    //   North is the BIDDER going alone.
    //   South (human) clicked cards to GIVE to North → G.exchangeGive
    //   North (AI) gives its worst cards back to South.
    //   southGives  = G.exchangeGive        (South gives these to North)
    //   northGives  = aiGiveWorstCards(north, n)  (North gives these to South)

    let playerReceives, partnerReceives;

    if (player === 'north' && partner === 'south') {
        // North alone: South gave cards → North receives them
        // North gives its worst cards → South receives them
        playerReceives  = [...G.exchangeGive];                // North gets South's picks
        partnerReceives = aiGiveWorstCards('north', n);       // South gets North's worst
    } else {
        // Normal case: South is bidder
        // South gave cards → partner receives them
        // Partner gives best → South receives them
        partnerReceives = [...G.exchangeGive];                // partner gets South's picks
        playerReceives  = aiPartnerBestCards(partner, n);     // South gets partner's best
    }

//    cLog("#7: North cards ", prettyHandPlain(G.H["north"]));
//    cLog("#8: South cards ", prettyHandPlain(G.H["south"]));
    cLog("#7: East cards: ", prettyHandPlain(G.H["east"]),
	);
    cLog("#8: West cards: ", prettyHandPlain(G.H["west"]),
	);

    cLog("#9: playerReceives: ",playerReceives, ", partnerReceives: ",partnerReceives);
    
    
    // --- REMOVE CARDS SOUTH IS GIVING ---
    G.exchangeGive.forEach(c => {
        const idx = G.H['south'].findIndex(x => x.uid === c.uid);
        if (idx >= 0) G.H['south'].splice(idx, 1);
    });

    // --- REMOVE CARDS PLAYER (bidder) IS GIVING (only in north-alone case) ---
    if (player === 'north' && partner === 'south') {
        partnerReceives.forEach(c => {
            const idx = G.H['north'].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H['north'].splice(idx, 1);
        });
    } else {
        // Normal: remove from partner
        playerReceives.forEach(c => {
            const idx = G.H[partner].findIndex(x => x.uid === c.uid);
            if (idx >= 0) G.H[partner].splice(idx, 1);
        });
    }

    // --- ADD RECEIVED CARDS ---
    if (player === 'north' && partner === 'south') {
        G.H['north'].push(...playerReceives);   // North gets South's picks
        G.H['south'].push(...partnerReceives);  // South gets North's worst
    } else {
        G.H[player].push(...playerReceives);    // South gets partner's best
        G.H[partner].push(...partnerReceives);  // Partner gets South's picks
    }

   
    // --- SORT BOTH HANDS ---
    sortBase(G.H[player]);
    sortBase(G.H[partner]);

    G.lastExchangeCount = n;  // save for scoring

    
    // 1. Build exchange object ONCE
    exch = {
	deal: G.dealNumber,
	bidder: player,
	partner: partner,
	count: n,
	give: G.exchangeGive.map(c => ({...c})),
	get: playerReceives.map(c => ({...c})),
	partnerGives: partnerReceives.map(c => ({...c})),
	southHandAfter: G.H.south.map(c => ({...c})),
	northHandAfter: G.H.north.map(c => ({...c}))
    };

    cLog("#11: exch record: ",exch);
    
    // 2. Save it permanently BEFORE clearing anything
 //   G.exchangeHistory.push(exch);
    
    // --- CLEAR EXCHANGE STATE ---
    G.exchangeGive  = [];
    G.exchangeGet   = [];
    G.exchangeCount = 0;
    G.exchangePlayer = null;

    // --- IMPORTANT: exchange is done, so cardReq must be 0 ---
    // ???? ... see if this will work so we do not corrupt cardreq
    // therefor no flag that exchange was done
    // BUT taking this out does not work... we need a different check!
    G.hBid.cardReq = 0;
//    G.exchangeDone = true;
    
    // --- Return to normal bidding flow ---
    setTimeout(() => finishBid(), 300);

    // --- Update visuals ---
    if (player === 'south') {
        renderHands(true,  'south');
        renderHands(false, partner);
        speech('south', 'Exchange complete.', 2000);
    } else if (player === 'north') {
        renderHands(false, 'north');
        renderHands(true,  'south');  // South still plays, show their new hand
        speech('south', 'Exchange complete.', 2000);
    } else {
        // AI-to-AI exchange
        renderHands(false, player);
        renderHands(false, partner);
    }
}
*/

/*
// ── Helper: AI gives its N worst cards (returns array, does NOT mutate) ──
// Separate from aiGiveWorst which writes to G.exchangeGive
function aiGiveWorstCards(player, n) {
    const hand = [...G.H[player]];
    const rankVal = { 'J':1, 'Q':2, 'K':3, 'A':4 };

    hand.sort((a, b) => {
        const aTrump = (a.s === G.trump);
        const bTrump = (b.s === G.trump);

        if (G.hl === 'high') {
            if (aTrump !== bTrump) return aTrump - bTrump;  // non-trump first
            return rankVal[a.r] - rankVal[b.r];              // weakest rank first
        }
        if (G.hl === 'low') {
            if (aTrump !== bTrump) return bTrump - aTrump;  // trump first
            return rankVal[b.r] - rankVal[a.r];              // strongest rank first
        }
    });

    return hand.slice(0, n);
}
*/

function suitKey(s) {
    return { '♠':'S', '♥':'H', '♦':'D', '♣':'C' }[s];
}

function aiGiveWorst(player, n) {
    G.exchangeGive = aiGiveWorstCards(player, n);
    finalizeExchange();
}

// also be away there is a copy with aiGiveWorstCards that leaves out the
// last two lines
function aiGiveWorstCards(player, n) {
    
    const hand = [...G.H[player]];
    let trump = G.trump;   // null for NT
    const mode  = G.hl;      // "high", "low", or null

    if (trump === "NT") trump = null;
    
    cLog("aiGiveWorstCards. hand:",hand,trump,mode);
    
    // Group cards by suit
    const suits = { S:[], H:[], D:[], C:[] };
    hand.forEach(c => suits[suitKey(c.s)].push(c));

//    hand.forEach(c => suits[c.s].push(c));

    // Sort each suit strongest → weakest depending on mode
    const rankHigh = ['A','K','Q','J'];   // strongest → weakest
    const rankLow  = ['J','Q','K','A'];   // strongest → weakest in LOW

    function strength(c) {
        const order = (mode === 'low') ? rankLow : rankHigh;
        return order.indexOf(c.r);
    }

    for (let s of ['S','H','D','C']) {
        suits[s].sort((a,b) => strength(a) - strength(b)); // strongest → weakest
    }

    // Build list of candidate cards to give away
    let candidates = [];

    if (trump) {

//	cLog("trump");
	
        // SUIT MODE — give away lowest OFF-SUIT cards
        for (let s of ['S','H','D','C']) {
            if (s === trump) continue; // skip trump suit

            const suitCards = suits[s];

            // Walk from weakest → strongest
            for (let i = suitCards.length - 1; i >= 0; i--) {
                const card = suitCards[i];

                // Check protection
                if (isProtected(card, suitCards, "high")) continue;

                candidates.push(card);
            }
        }
    } else {
        // NO TRUMP MODE
        const giveLow = (mode === 'high');
        const giveHigh = (mode === 'low');

        for (let s of ['S','H','D','C']) {
            const suitCards = suits[s];

            if (giveLow) {

//		cLog("giveLow");
		
                // give lowest cards first
                for (let i = suitCards.length - 1; i >= 0; i--) {
                    const card = suitCards[i];
                    if (isProtected(card, suitCards, "high")) continue;
                    candidates.push(card);
                }
            }

            if (giveHigh) {
		
//		cLog("giveHigh");
		
                // give highest cards first
                for (let i = 0; i < suitCards.length; i++) {
                    const card = suitCards[i];
                    if (isProtected(card, suitCards, "low")) continue;
                    candidates.push(card);
		    
                }
            }
        }
    }
    
    return candidates.slice(0, n);
    
    // Pick the first n candidates
//    G.exchangeGive = candidates.slice(0, n);

  //  finalizeExchange();
} //aiGiveWorstCards

// for aiGiveWorst routine
function isProtected(card, suitCards, mode) {
    // suitCards = all cards of this suit sorted strongest → weakest
    // mode = "high" or "low"

    const ranksHigh = ['A','K','Q','J'];   // strongest → weakest
    const ranksLow  = ['J','Q','K','A'];   // strongest → weakest in LOW mode

    const order = (mode === 'low') ? ranksLow : ranksHigh;

    // Count how many copies of each rank exist
    const counts = {};
    suitCards.forEach(c => counts[c.r] = (counts[c.r] || 0) + 1);

    // Walk from strongest downward until we reach this card
    for (let r of order) {
        if (r === card.r) break;

        // If ANY stronger rank does NOT have 2 copies → card is NOT protected
        if ((counts[r] || 0) < 2) return false;
    }

    return true; // protected
} //isProtected
