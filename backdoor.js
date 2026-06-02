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
/*
function showNorthHand() {
    const hand = G.H.north;
    const el = $('hand-north');
    el.innerHTML = '';

    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = cardSVG(card.r, card.s, false);
        el.appendChild(div);
    });
}

function hideNorthHand() {
    const hand = G.H.north;
    const el = $('hand-north');
    el.innerHTML = '';

    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = cardSVG(card.r, card.s, true); // face‑down
        el.appendChild(div);
    });
}
*/

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
