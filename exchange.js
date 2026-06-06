
// *****  EXCHANGE *****

// *** Going alone - asking for 1 or 2 cards ***
// exchange the cards
function startExchange(n) {
    G.phase = 'exchange';
    G.exchangeCount = n;
    G.exchangeGive = []; // cards South gives
    G.exchangeGet = [];  // cards partner gives

    speech('south', 'Select ' + n + ' card' + (n===1?'':'s') +
	   ' to give your partner.', 3000);

    // highlight playable cards
    const hand = $('hand-south').children;
    for (let el of hand) {
        el.classList.add('exchange-select');
        el.addEventListener('click', () => pickExchangeCard(el));
    }
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
    const partner = partnerOf('south');
    const n = G.exchangeCount;

    // Partner gives best N cards
    const best = partnerBestCards(partner, n);
    G.exchangeGet = best;

    // --- REMOVE CARDS SOUTH IS GIVING ---
    G.exchangeGive.forEach(c => {
        const idx = G.H.south.findIndex(x => x.uid === c.uid);
        if (idx >= 0) G.H.south.splice(idx, 1);
    });

    // --- REMOVE CARDS PARTNER IS GIVING ---
    best.forEach(c => {
        const idx = G.H[partner].findIndex(x => x.uid === c.uid);
        if (idx >= 0) G.H[partner].splice(idx, 1);
    });

    // --- ADD EXCHANGED CARDS ---
    G.H.south.push(...best);
    G.H[partner].push(...G.exchangeGive);

    // --- SORT BOTH HANDS ---
    sortBase(G.H.south);
    sortBase(G.H[partner]);

    G.lastExchangeCount = n;  // save this for scoring

    // --- CLEAR EXCHANGE STATE ---
    G.exchangeGive = [];
    G.exchangeGet = [];
    G.exchangeCount = 0;

    // --- IMPORTANT: exchange is done, so cardReq must be 0 ---
    G.hBid.cardReq = 0;

    // --- Return to normal bidding flow ---
    // This will show the final bid message, set leader, and start the trick
    setTimeout(() => finishBid(), 300);

    // --- Update visuals ---
    renderHands(true, 'south');
    renderHands(false, partner);

    speech('south', 'Exchange complete.', 2000);
}


// **** End of Exchange
