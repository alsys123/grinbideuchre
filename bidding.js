// BIDDING
let bOrder=[],bIdx=0,pAmt=null,pHL=null,pAlone=null,pCardReq=null;

function startBid(){
    G.phase='bid';const si=PL.indexOf(G.leader);
    bOrder=PL.map((_,i)=>PL[(si+i)%4]);bIdx=0;nextBid();
}

function nextBid(){
    if(bIdx>=bOrder.length){
	if(!G.hBid){
	    msg('All passed — dealer must bid 3!',2200);
	    
	    setTimeout(()=>{
		placeBid(G.dealer,3,G.H[G.dealer][0].s,'high',false,0);
		finishBid();
	    }, 2300);

	    return;
	} finishBid();
	return;
    }
    
    const p=bOrder[bIdx]; setAct(p);
    if(p==='south')
	showBidMod();
    else setTimeout(()=>aiBid(p),1000);

}

function placeBid(player,amt,trump,hl,alone=false,cardReq=0){
    G.bids[player]={amt,trump,hl,alone,cardReq};

    if(!G.hBid||amt>G.hBid.bid)
	G.hBid={player,bid:amt,trump,hl,alone,cardReq};

}

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

    const hl = 'high';
    
    // --- PLACE BID ---
    if (bid >= min) {

        placeBid(player, bid, bs, hl, alone, cardReq);

	const suitSymbol = bs; // already a symbol like ♥ ♦ ♣ ♠
	
        const text =
              bid + " " + hl +
	      " in " + suitSymbol +
            (alone ? " alone" : "");

        speech(player, text, 1800);

        hud();
        bIdx++;
        setTimeout(nextBid, 1500);

    } else {

        speech(player, "Pass", 1800);
        bIdx++;
        setTimeout(nextBid, 1300);
    }
}

// show the current bid modal box
function showBidMod(){
    const min = G.hBid?G.hBid.bid+1:3;
    
    $('modal-title').textContent='Your Bid';

    let bidText = "";
    if (min === 8) {
	bidText = "you can only go alone";
    } else {
	bidText = "you must bid at least " + min;
    }

	  //    $('modal-sub').textContent='Min bid: '+min+(G.hBid?' (beat '+G.hBid.bid+')':'');
    if (G.hBid) {
	let desc = G.hBid.bid + " " + G.hBid.hl + " in " + G.hBid.trump;
	
	if (G.hBid.alone) {
            desc += " alone";
            if (G.hBid.cardReq > 0) {
		desc += " (ask " + G.hBid.cardReq + ")";
            }
	}

	// show who made the bid
	if (G.hBid.player) {
	    desc += " by " + G.hBid.player.toUpperCase();
	}
	
	$('modal-sub').textContent =
            "Current bid: " + desc + " — " + bidText; //bid at least " + min;
    } else {
	$('modal-sub').textContent = "No bids yet — minimum bid is " + min;
    }
    
    
    const bb=$('bid-buttons'); bb.innerHTML='';
    bb.style.display='grid';
    $('trump-picker').style.display='none';
    $('highlow-picker').style.display='none';
    $('alone-picker').style.display='none';
    $('card-req-picker').style.display='none';
    pAmt=null;
    pHL=null;
    pAlone=null;
    pCardReq=null;

    for(let b=3;b<=8;b++){
	const btn=document.createElement('button');
	btn.className='bbtn';
	btn.textContent=b;

	if(b<min)btn.disabled=true;
	else btn.addEventListener('click',()=>pickAmt(b));

	bb.appendChild(btn);
    }
    
    const pb=document.createElement('button');pb.className='bbtn pbtn';
    pb.textContent='Pass';
    pb.addEventListener('click',()=>{$('bid-modal').classList.add('hidden');
				     bIdx++;
				     setTimeout(nextBid,300);});
    bb.appendChild(pb);
    $('bid-modal').classList.remove('hidden');
}//showBidMod

function pickAmt(amt){
    
    pAmt=amt;

    // ⭐ ALWAYS hide bid-buttons first
//    $('bid-buttons').style.display = 'none';
    hideAllPickers();   // ⭐ ALWAYS reset first
    
    if (amt === 8) {
	pHL = 'high';   // always high for 8‑bid
	pickAlone(amt);    // now choose 1‑card, 2‑card, or MoonShot
	return;
    }

//    cLog("pickAmt",amt);
    
    $('bid-buttons').style.display='none';

    $('modal-sub').textContent='High or Low?';

    const hl=$('highlow-picker');
    hl.style.display='flex';
    hl.innerHTML='';

    ['high','low'].forEach(v=>{
	const b=document.createElement('button');

	b.className='hlbtn';
	
	b.textContent=v[0].toUpperCase()+v.slice(1);

	b.addEventListener('click',()=>
	    {pHL=v;
	     pickAlone(amt);
	    });
	hl.appendChild(b);
    });
    
} //pickAmt

function pickAlone(amt) {

//    $('highlow-picker').style.display = 'none';

    hideAllPickers();   // ⭐ ALWAYS reset first
    
    // This text is now specific to the 8‑bid scenario
    $('modal-sub').textContent = 'Choose your bid option';

    const ap = $('alone-picker');
    ap.style.display = 'flex';
    ap.innerHTML = '';
    
    let options = [];
    // Options based on what was bid
    
    if (amt === 8) {
	options = [
            { label: 'Not Alone',   alone: false,  cardReq: 0 },
            { label: 'Ask 1 Card',  alone: true,   cardReq: 1 },
            { label: 'Ask 2 Cards', alone: true,   cardReq: 2 },
            { label: 'MoonShot!',   alone: true,   cardReq: 0 }
	];
    } else {
	options = [
	    { label: 'Not Alone',   alone: false,  cardReq: 0 },
            { label: 'Ask 1 Card',  alone: true,   cardReq: 1 },
            { label: 'Ask 2 Cards', alone: true,   cardReq: 2 }
	]
    }
    
/*    
    options = [
            { label: 'Not Alone',   alone: false,  cardReq: 0 },
            { label: 'Ask 1 Card',  alone: true,   cardReq: 1 },
            { label: 'Ask 2 Cards', alone: true,   cardReq: 2 },
            { label: 'MoonShot!',   alone: true,   cardReq: 0 }
	];
*/
    
    options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'abtn';
        b.textContent = opt.label;

        b.addEventListener('click', () => {
            pAlone   = opt.alone;      // always true for 8‑bid
            pCardReq = opt.cardReq;    // 0, 1, or 2
            pickTrump();
        });

        ap.appendChild(b);
    });
} //pickAlone

function hideAllPickers() {
    $('bid-buttons').style.display = 'none';
    $('highlow-picker').style.display = 'none';
    $('alone-picker').style.display = 'none';
}

function pickCardReq(){
        hideAllPickers();   // ⭐ ALWAYS reset first
//    $('alone-picker').style.display='none';
    $('modal-sub').textContent='Ask partner for cards?';
    
    const cp=$('card-req-picker');
    cp.style.display='flex';
    cp.innerHTML='';
    
    ['0','1','2'].forEach(v=>{
	const b=document.createElement('button');
	b.className='cbtn';
	b.textContent=v;
	b.addEventListener('click',()=>{
	    pCardReq=parseInt(v);
	    pickTrump();
	});
	cp.appendChild(b);
    });
    
}

function pickTrump(){
    $('card-req-picker').style.display='none';
    $('alone-picker').style.display='none';
    $('modal-sub').textContent='Choose Trump Suit';
    const tp=$('trump-picker');
    tp.style.display='flex'; tp.innerHTML='';
    
    SUITS.forEach(s=>{
	const b=document.createElement('button');
	b.className='tbtn '+(RED.has(s)?'red-s':'blk-s');
	b.textContent=s;
	b.addEventListener('click',()=>{
	    $('bid-modal').classList.add('hidden');
	    $('bid-buttons').style.display='grid';
	    placeBid('south',pAmt,s,pHL,pAlone,pAlone?pCardReq:0);
	    hud();
	    bIdx++;setTimeout(nextBid,300);
	});
	tp.appendChild(b);

    });
    // no trump button option
    // Add NT button
const nt = document.createElement('button');
nt.className = 'tbtn ntbtn';
nt.textContent = 'NT';
nt.addEventListener('click', () => {
    $('bid-modal').classList.add('hidden');
    $('bid-buttons').style.display='grid';
    placeBid('south', pAmt, 'NT', pHL, pAlone, pAlone ? pCardReq : 0);
    hud();
    bIdx++;
    setTimeout(nextBid, 300);
});
tp.appendChild(nt);

}

function finishBid() {
    if (!G.hBid) return;
    const h = G.hBid;

        // Always set trump + HL immediately
    G.trump = h.trump;
    G.hl = h.hl;
    
    // If South bid 8 and requested 1 or 2 cards → do exchange FIRST
    if (h.bid === 8 && h.player === 'south' && h.cardReq > 0) {
        // Do NOT overwrite cardReq here
        setTimeout(() => startExchange(h.cardReq), 300);
        return; // stop normal flow until exchange is done
    }

    // Enforce rule: bid 8 = alone (MoonShot or no request)
    if (h.bid === 8) {
        h.alone = true;

        // If MoonShot (cardReq = 0), keep it
        // If exchange already happened, cardReq was consumed
        // If no exchange, cardReq should be 0
        if (!h.cardReq) h.cardReq = 0;

        h.hl = 'high'; // 8 is always high
    } else {
        // All other bids cannot go alone
        h.alone = false;
        h.cardReq = 0;
    }

    // Apply final bid settings
    G.trump = h.trump;
    G.hl = h.hl;
    G.alone = h.alone;
    G.cardReq = h.cardReq;

    //    let msg_text = PN[h.player] + ' bids ' + h.bid + ' ' + h.hl + ' — Trump: ' + h.trump;
    let msg_text = PN[h.player] +
	' bids ' +
	h.bid + ' ' +
	h.hl +
	(h.trump === "NT" ? " — No Trump" : " — Trump: " +
	 h.trump);
    
    if (h.alone)
        msg_text += ' (ALONE' +
            (h.cardReq ? ' - ask ' + h.cardReq + ' card' + (h.cardReq === 1 ? '' : 's') : '') +
            ' - need 8 tricks)';

    hud();
    msg(msg_text, 2600);

    G.leader = h.player;
    G.cur = h.player;
    G.phase = 'play';

    renderHands(true, 'south');

    setTimeout(startTrick, 2700);
}


// *** Going alone - asking for 1 or 2 cards ***

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

        if (aTrump !== bTrump) return bTrump - aTrump;
        return rankVal[b.r] - rankVal[a.r];
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

function partnerOf(p) {
    const idx = PL.indexOf(p);
    return PL[(idx + 2) % 4];
}
