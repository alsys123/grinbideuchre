/*
  Backdoor
  -- click top left corner to reveal North cards.
  */

let northClicks = 0;  // for all hands not just north
let northReveal = false;

$('northBackdoor').onclick = function () {
    northClicks++;

    if (northClicks >= 5) {
        northClicks = 0;       // reset
        northReveal = !northReveal;

//	if (northReveal) {
//	    $('hand-north').classList.add('reveal');
	toggleReveal('north', northReveal);
        toggleReveal('west',  northReveal);
        toggleReveal('east',  northReveal);
       
	//	    showNorthHand();
//	} else {
//	    $('hand-north').classList.remove('reveal');
//	    hideNorthHand();
//	}
    }
    
};

function toggleReveal(hand, show) {
    const el = $('hand-' + hand);

    if (show) {
        el.classList.add('reveal');
        showHandCards(hand);
    } else {
        el.classList.remove('reveal');
        hideHandCards(hand);
    }
}

function showHandCards(player) {
    const hand = G.H[player];
    const el = $('hand-' + player);
    el.innerHTML = '';

    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = cardSVG(card.r, card.s, false);
        el.appendChild(div);
    });
}

function hideHandCards(player) {
    const hand = G.H[player];
    const el = $('hand-' + player);
    el.innerHTML = '';

    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = cardSVG(card.r, card.s, true); // face-down
        el.appendChild(div);
    });
}

// *** deal backdoor  -- to deal number and entry display
let dealClicks = 0;  // for all hands not just north
let dealReveal = false;

$('DealBackdoor').onclick = function () {
    dealClicks++;

    if (dealClicks >= 5) {
        dealClicks = 0;       // reset
        dealReveal = !dealReveal;

	dei('deal-number').style.display = 'block';
	dei('replay-box').style.display = 'flex';
	
	
    } else {
	dei('deal-number').style.display = 'none';
	dei('replay-box').style.display = 'none';
	
    }
    
};

function replayDeal(inputStr) {
    if (!inputStr) { alert('Invalid deal number'); return; }

    inputStr = inputStr.trim().toUpperCase();

    // --- 1. Detect optional dealer override (N/S/E/W) ---
    let forcedDealer = null;
    const lastChar = inputStr.slice(-1);

    if ("NSEW".includes(lastChar)) {
        forcedDealer = lastChar;
        inputStr = inputStr.slice(0, -1).trim();   // remove suffix
    }

    // --- 2. Parse the deal number normally ---
    const n = parseDealNumber(inputStr);
    if (!n) { alert('Invalid deal number'); return; }

    requestedDeal = n;

    // --- 3. Apply forced dealer if present ---
    if (forcedDealer) {
        // G.dealer expects lowercase keys: 'north', 'south', etc.
        const map = { N: "north", S: "south", E: "east", W: "west" };
        G.dealer = map[forcedDealer];

	// leader = who starts bidding it to the left of dealer
	const di=PL.indexOf(G.dealer);
	G.leader=PL[(di+1)%4];  
	G.firstHand = false; // don't look for random dealer
    }

    // --- 4. Start the game with the new deal ---
    startNewGame();
}

function showDealNumber() {
    const el = document.getElementById('deal-number');
    const text =
	  'Deal # ' +
	  formatDealNumber(lastDealNumber) +
	  ` ${G.dealer}`;
	  ;
    
    if (el) el.textContent = text;
}



function copyDealNumber() {
    const txt = formatDealNumber(lastDealNumber);
    navigator.clipboard.writeText(txt).then(() => {
        const el = document.getElementById('deal-number');
        const old = el.textContent;
        el.textContent = "Copied!";
        setTimeout(() => el.textContent = old, 700);
    });
}
