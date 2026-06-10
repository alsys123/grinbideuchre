
// *****  EXCHANGE *****

// *** Going alone - asking for 1 or 2 cards ***
// exchange the cards
function startExchange(n, player) {

//    cLog("start the exchange cards: ",n,". For player (winner):", player);
    
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
}

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
    });

    G.exchangeGive = hand.slice(0, n);  // worst N cards
    finalizeExchange();
}

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
    const player  = G.exchangePlayer || 'south';
    const partner = partnerOf(player);
    const n       = G.exchangeCount;

//    cLog("#2: winner:", player, " his partner:", partner, n);

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

    
    // save all the exchange data
    // note: may not need all the elements ...??? some may be duplicate with G.
    G.exchangeHistory.push({
	deal: G.dealNumber,
	bidder: player,
	partner: partner,
	count: n,
	give: G.exchangeGive.map(c => ({...c})),
	get: playerReceives.map(c => ({...c})),
	partnerGives: partnerReceives.map(c => ({...c})),
	southHandAfter: G.H.south.map(c => ({...c})),
	northHandAfter: G.H.north.map(c => ({...c}))
    });

    // --- CLEAR EXCHANGE STATE ---
    G.exchangeGive  = [];
    G.exchangeGet   = [];
    G.exchangeCount = 0;
    G.exchangePlayer = null;

    // --- IMPORTANT: exchange is done, so cardReq must be 0 ---
    G.hBid.cardReq = 0;

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


// **** End of Exchange
