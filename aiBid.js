/*
  AI Bidding

*/

function aiBid(player){

    const hand = G.H[player];
    let str = 0;
    const sc = {};
    SUITS.forEach(s => sc[s] = 0);

    // Count suits + strength
    hand.forEach(c => {
        sc[c.s]++;
        if (c.r === 'A') str += 2;
        else if (c.r === 'K') str += 1.5;
        else if (c.r === 'J') str += 1.5;
        else if (c.r === 'Q') str += 0.5;
    });

    // Best suit
    let bs = Object.entries(sc).sort((a,b)=>b[1]-a[1])[0][0];
    str += sc[bs] * 0.5; // best suit bonus

    // Right bower bonus
    if (hand.find(c => c.r === 'J' && c.s === bs)) str += 1;

    const min = G.hBid ? G.hBid.bid + 1 : 3;
    let bid = 0;

    // For No Trump
    let ntStrength = 0;
    hand.forEach(c => {
	if (c.r === 'A') ntStrength += 2;
	else if (c.r === 'K') ntStrength += 1.5;
	else if (c.r === 'Q') ntStrength += 1;
	else if (c.r === 'J') ntStrength += 0.5;
    });
    
    // If balanced hand, consider NT
    const isBalanced = Math.max(...Object.values(sc)) <= 3;
    
    if (isBalanced && ntStrength >= 8) {
	bs = "NT";
	str = ntStrength;   // ⭐ important
    }
    
    // --- FIXED BID LOGIC ---

    // *** raising 16 to 20 or 22 lowers the possibility of AI going alone ***
    
    if (str >= 22) bid = 8;                     // strong enough to go alone

    else if (str >= 12) bid = Math.min(7, 0 | (str / 2));
    else if (str >= 11) bid = Math.min(6, 0 | (str / 2));
    else if (str >= 8)  bid = Math.min(5, 0 | (str / 2.2));
    else if (str >= 6)  bid = 3;

    // --- FIXED ALONE LOGIC ---
    let alone = false;
    let cardReq = 0;

    if (bid === 8) {
        alone = true;
        cardReq = 0;
    } else {
	alone = false;
	cardReq = 0;
    }

    let hl = null;

    // NT always implies high
    /*
    if (bs === 'NT') {
	hl = 'high';
    } else {
	hl = null;
    }
    */
    
    // --- PLACE BID ---
    if (bid >= min) {

        placeBid(player, bid, bs, hl, alone, cardReq);

	const suitSymbol = bs; // already a symbol like ♥ ♦ ♣ ♠ or NT
	
        let text =
              bid +
	      " in " + suitSymbol +
            (alone ? " alone" : "");

	if (bs === "NT") {
            text =
              bid +
	      " NT" +
            (alone ? " alone" : "");
	    
	}

        speech(player, text, 1800);

        hud();
        bIdx++;
        setTimeout(nextBid, 1500);

    } else {

        speech(player, "Pass", 1800);
        bIdx++;
        setTimeout(nextBid, 1300);
    }
} //aiBid
