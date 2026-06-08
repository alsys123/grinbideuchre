
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
               ' to give your partner.', 3000);

        // highlight playable cards
        const hand = $('hand-south').children;
        for (let el of hand) {
            el.classList.add('exchange-select');
            el.addEventListener('click', () => pickExchangeCard(el));
        }
	return;
    } // 
    
    if (player === 'north') {
    }

    //else {
    // otherwise computer is giving to computer
    // either east --> west or west --> east
        // AI player - auto-select cards
        setTimeout(() => aiExchange(player, n), 800);
//    }

}

function pickExchangeCard(el) {
    if (G.exchangeGive.length >= G.exchangeCount) return;

    const uid = parseInt(el.dataset.cid);
    const card = G.H.south.find(c => c.uid === uid);

    if (!card) return;

    el.classList.add('selected');
    G.exchangeGive.push(card);

    if (G.exchangeGive.length === G.exchangeCount) {
        finalizeExchange();
    }
}

function aiExchange(player, n) {

    cLog("aiExchange");
    
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
            return rankVal[a.r] - rankVal[b.r];  // weakest rank
        }

        // In LOW mode: give strongest
        if (G.hl === 'low') {
            if (aTrump !== bTrump) return bTrump - aTrump;  // trump first
            return rankVal[b.r] - rankVal[a.r];  // strongest rank
        }
    });

    G.exchangeGive = hand.slice(0, n);  // worst N cards
    finalizeExchange();
}

function partnerBestCards(partner, n) {
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
    const player = G.exchangePlayer || 'south';
    const partner = partnerOf(player);
    const n = G.exchangeCount;

    // Partner gives best N cards
    const best = partnerBestCards(partner, n);
    G.exchangeGet = best;

    // --- REMOVE CARDS PLAYER IS GIVING ---
    G.exchangeGive.forEach(c => {
        const idx = G.H[player].findIndex(x => x.uid === c.uid);
        if (idx >= 0) G.H[player].splice(idx, 1);
    });

    // --- REMOVE CARDS PARTNER IS GIVING ---
    best.forEach(c => {
        const idx = G.H[partner].findIndex(x => x.uid === c.uid);
        if (idx >= 0) G.H[partner].splice(idx, 1);
    });

    // --- ADD EXCHANGED CARDS ---
    G.H[player].push(...best);
    G.H[partner].push(...G.exchangeGive);

    // --- SORT BOTH HANDS ---
    sortBase(G.H[player]);
    sortBase(G.H[partner]);

    G.lastExchangeCount = n;  // save this for scoring

    // --- CLEAR EXCHANGE STATE ---
    G.exchangeGive = [];
    G.exchangeGet = [];
    G.exchangeCount = 0;
    G.exchangePlayer = null;

    // --- IMPORTANT: exchange is done, so cardReq must be 0 ---
    G.hBid.cardReq = 0;

    // --- Return to normal bidding flow ---
    // This will show the final bid message, set leader, and start the trick
    setTimeout(() => finishBid(), 300);

    // --- Update visuals ---
    if (player === 'south') {
        renderHands(true, 'south');
        renderHands(false, partner);
        speech('south', 'Exchange complete.', 2000);
    } else {
        // AI exchange - just re-render silently
        renderHands(false, player);
        renderHands(false, partner);
    }
}


// **** End of Exchange
