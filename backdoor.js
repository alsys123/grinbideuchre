/*
  Backdoor
  -- click top left corner to reveal North cards.
  */

let northClicks = 0;
let northReveal = false;

$('northBackdoor').onclick = function () {
    northClicks++;

    if (northClicks >= 5) {
        northClicks = 0;       // reset
        northReveal = !northReveal;

	if (northReveal) {
	    $('hand-north').classList.add('reveal');
	    showNorthHand();
	} else {
	    $('hand-north').classList.remove('reveal');
	    hideNorthHand();
	}
    }
    
};

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
