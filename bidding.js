// BIDDING
let bOrder=[],bIdx=0,pAmt=null,pHL=null,pAlone=null,pCardReq=null;

// Entry Point: startBid --> from mainline
function startBid(){
    G.phase='bid';
    const si=PL.indexOf(G.leader);
    
    bOrder=PL.map((_,i)=>PL[(si+i)%4]);

    bIdx=0;
    nextBid();

}

function nextBid(){
    if(bIdx>=bOrder.length){
	if(!G.hBid){
	    msg('All passed — dealer must bid 1!',2200);
	    
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

// record the bid
function placeBid(player,amt,trump,hl,alone=false,cardReq=0){

    cLog("Place bid: ",player,amt,trump,hl,alone,cardReq);
    
    G.bids[player]={amt,trump,hl,alone,cardReq};

    if(!G.hBid||amt>G.hBid.bid)
	G.hBid={player,bid:amt,trump,hl,alone,cardReq};

}


// show the current bid modal box
function showBidMod(){
    const min = G.hBid?G.hBid.bid+1:1;
    
    $('modal-title').textContent='Your Bid';

    let bidText = "";
    if (min === 8) {
	bidText = "you can only go alone";
    } else {
	bidText = "you must bid at least " + min;
    }

    //    $('modal-sub').textContent='Min bid: '+min+(G.hBid?' (beat '+G.hBid.bid+')':'');

    if (G.hBid) {
	let desc = "";
	
	if (G.hBid.hl) {
	    desc = G.hBid.bid + " " + G.hBid.hl + " in " + G.hBid.trump;
	} else {
	    desc = G.hBid.bid + " " + G.hBid.trump;
	}
	
	
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
//    hideAllPickers();
    $('highlow-picker').style.display='none';
    $('alone-picker').style.display='none';
    $('card-req-picker').style.display='none';

    pAmt=null;
    pHL=null;
    pAlone=null;
    pCardReq=null;

    for(let b=1;b<=8;b++){
	const btn=document.createElement('button');
	btn.className='bbtn';

	if (b < 8) {
	    btn.textContent = b;
	} else {
	    // for buttons when 8 ticks is wanted
	    btn.textContent = "MoonShot";
	    btn.style.background = "gold"
	    btn.style.color      = "black";
	}
	
	if (b<min) btn.disabled=true;
	else btn.addEventListener('click',()=>pickAmt(b));

	bb.appendChild(btn);
    }

    // add buttons for pick 1 or 2 cards
    // pick 1 card .. artificial 9 tick call
    const btn1=document.createElement('button');
    btn1.className='bbtn';
    btn1.textContent = "Ask 1 Card";
    btn1.style.background = "blue"
    btn1.style.color      = "white";

    btn1.addEventListener('click',()=>pickAmt(9));
    bb.appendChild(btn1);
    // pick 2 card .. artificial 10 tick call
    const btn2=document.createElement('button');
    btn2.className='bbtn';
    btn2.textContent = "Ask 2 Cards";
    btn2.style.background = "blue"
    btn2.style.color      = "white";

    btn2.addEventListener('click',()=>pickAmt(10));
    bb.appendChild(btn2);
    
    
    const pb=document.createElement('button');pb.className='bbtn pbtn';
    pb.textContent='Pass';
    pb.addEventListener('click',()=>{$('bid-modal').classList.add('hidden');
				     bIdx++;
				     setTimeout(nextBid,300);});
    bb.appendChild(pb);
    $('bid-modal').classList.remove('hidden');
}//showBidMod

// this was picking high/low but we do not need this anymore
function pickAmt(amt){

    // 9 is artifical we want to pick 1 card
    // 10 is artifical we want to pick 2 card2
    if (amt >= 8) {
	pAmt = 8;
    } else {
	pAmt=amt;
    }
    
    hideAllPickers();   // ⭐ ALWAYS reset first
    pickAlone(amt);

    
} //pickAmt

// check if we are picking alone, if not go onto picking trump
function pickAlone(amt) {

    hideAllPickers();   // always reset

    const ap = $('alone-picker');
    ap.innerHTML = '';

    // ⭐ If NOT 8 → no alone options, skip picker entirely
    // ie. less than 8
    if (amt < 8) {
        pAlone   = false;  // not going alone
        pCardReq = 0;      // no cards requested
        pickTrump();       // go straight to trump picker
        return;
    }

    // we don't need the picker anymore
    // 9 is pick 1 card.  10 is pick 2 cards
    pAlone   = true;

//    if (amt === 9) {
//	pCardReq = 1;
//    } else if (amt === 10) {
//	pCardReq = 2;
//    } else {
//	pCardReq = 0;
//    }
    const reqMap = {9: 1,10: 2};
    pCardReq = reqMap[amt] || 0;
    
    pickTrump();
    
/*
    // ⭐ If 8 → show the 3 alone options
    $('modal-sub').textContent = 'Choose your bid option';
    ap.style.display = 'flex';

    const options = [
        { label: 'Ask 1 Card',  alone: true, cardReq: 1 },
        { label: 'Ask 2 Cards', alone: true, cardReq: 2 },
        { label: 'MoonShot!',   alone: true, cardReq: 0 }
    ];

    options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'abtn';
        b.textContent = opt.label;

        b.addEventListener('click', () => {
            pAlone   = opt.alone;
            pCardReq = opt.cardReq;
            pickTrump();
        });

        ap.appendChild(b);
	});
*/
    
}

function hideAllPickers() {
    $('bid-buttons').style.display = 'none';
    $('highlow-picker').style.display = 'none';
    $('alone-picker').style.display = 'none';
}

// from going alone. Pick 1 or 2 cards or Moonshot.
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

// pick the suite or NT hight or NT low
function pickTrump(){
    $('card-req-picker').style.display='none';
    $('alone-picker').style.display='none';
    $('modal-sub').textContent='Choose Trump Suit';
    const tp=$('trump-picker');
    tp.style.display='flex'; tp.innerHTML='';
    
    SUITS.forEach(s=>{
	pHL = null;
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

    });  // append the suit selection buttons

    // Add NT button - no trump LOW button option
//    pHL = 'low';
    const ntLow = document.createElement('button');
    ntLow.className = 'tbtn ntbtnLow';
    ntLow.textContent = 'NT low';
    ntLow.addEventListener('click', () => {
	const hl = 'low';   // <‑‑ capture value HERE
	$('bid-modal').classList.add('hidden');
	$('bid-buttons').style.display='grid';

//	cLog("placing low bid:",pHL);
	
	placeBid('south', pAmt, 'NT', hl, pAlone, pAlone ? pCardReq : 0);

	hud();

	bIdx++;
	setTimeout(nextBid, 300);

    }); // append NT LOW button

    tp.appendChild(ntLow);

    
    // Add NT button - no trump HIGH button option
  //  pHL = 'High';
    const ntHigh = document.createElement('button');
    ntHigh.className = 'tbtn ntbtnHigh';
    ntHigh.textContent = 'NT high';
    ntHigh.addEventListener('click', () => {
	const hl = 'high';  // <‑‑ capture value HERE
	$('bid-modal').classList.add('hidden');
	$('bid-buttons').style.display='grid';
	placeBid('south', pAmt, 'NT', hl, pAlone, pAlone ? pCardReq : 0);
	hud();

	bIdx++;
	setTimeout(nextBid, 300);

    }); // append NT LOW button

    tp.appendChild(ntHigh);

    
} //pickTrump

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

    //    h.hl = 'high'; // 8 is always high  ... alone can go high/low
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

    let highLowText = ""

    if (h.hl) {
	highLowText = h.hl;
    }

    // ???? here ... clean this up more ...
    
    let msg_text = PN[h.player] +
	' bids ' +
	h.bid + ' ' +
	highLowText +
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

function partnerOf(p) {
    const idx = PL.indexOf(p);
    return PL[(idx + 2) % 4];
}
