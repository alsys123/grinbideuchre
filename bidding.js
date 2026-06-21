// BIDDING
let bOrder=[],bIdx=0,pAmt=null,pHL=null,pAlone=null,pCardReq=null;

// Entry Point: startBid --> from mainline
function startBid(){
    G.phase='bid';
    const si=PL.indexOf(G.leader);
    
    bOrder=PL.map((_,i)=>PL[(si+i)%4]);

    bIdx=0;
    nextBid();

    //   cLog("at end of startbid: dealer:", G.dealer, " - leader: ", G.leader);


}

// Entry Point: possible coming from aiBid or internally here
function nextBid(){

    // has everyone bid yet?
    if(bIdx>=bOrder.length) {

	if(!G.hBid) {
	    msg('All passed — dealer must bid 1!',2200);
	    
	    setTimeout(()=>{
		placeBid(G.dealer,3,G.H[G.dealer][0].s,'high',false,0);
		finishBid();
	    }, 2300);
	    
	    return;
	    
	} // make sure someone bid

	finishBid();
	return;
	
    } // all have bid?
    
    const p=bOrder[bIdx];

    setWhoIsActive(p);
    
    if(p==='south') {
	showBidMod();
    } else {
	setTimeout(()=>aiBid(p),1000);
    }

} // nextBid
/*
// record the bid
function placeBid(player,amt,trump,hl,alone=false,cardReq=0){

    //    cLog("Place bid: ",player,amt,trump,hl,alone,cardReq);
    
    G.bids[player]={amt,trump,hl,alone,cardReq};

    // ???? .... We also need to check for alone levels: pick 2, pick 1, pick 0
    if(!G.hBid || amt>G.hBid.bid)
	G.hBid={player,bid:amt,trump,hl,alone,cardReq};

    showTheBid(player,amt,trump,hl,alone,cardReq);
*/

function placeBid(player, amt, trump, hl, alone=false, cardReq=0) {

    G.bids[player] = { amt, trump, hl, alone, cardReq };

    const newStrength = bidStrength(amt, alone, cardReq);
    const oldStrength = G.hBid
        ? bidStrength(G.hBid.bid, G.hBid.alone, G.hBid.cardReq)
        : -1;

    if (!G.hBid || newStrength > oldStrength) {
	G.lastExchangeCount = cardReq; // this is new ... we need a permanent count
        G.hBid = { player, bid: amt, trump, hl, alone, cardReq };
    }

    showTheBid(player, amt, trump, hl, alone, cardReq);

} //placeBid

// for placeBid order only
function bidStrength(amt, alone, cardReq) {
    if (!alone) return amt;  // normal bids 1–7

    // alone bids override normal bids
    if (cardReq === 2) return 8;
    if (cardReq === 1) return 9;
    return 10; // cardReq 0 → highest (Moonshot)
}


function showTheBid(player, amt, trump, hl, alone, cardReq) {
    let text = "";
    
    //    text = buildBidText_v1(amt, trump, hl, alone, cardReq);
    text = buildBidText(player, amt, hl, trump, alone, cardReq);
    
    // Speak it
    speech(player, text, 1800);


} // showTheBid

// show the current bid modal box
function showBidMod(){
    const min = G.hBid?G.hBid.bid+1:1;
    
    $('modal-title').textContent='Your Bid';

//    cLog("showBidMod:",G.hBid,G.cardReq);
//    cLog("#1 alone 2:",   G.hBid.alone,G.hBid.cardReq);

    /*
      let bidText = "";
      if (min === 8) {
      bidText = "you can only go alone";
      } else {
      bidText = "you must bid at least " + min;
      }
    */
    
    //    $('modal-sub').textContent='Min bid: '+min+(G.hBid?' (beat '+G.hBid.bid+')':'');

    if (G.hBid) {

	const bidTextStr =
	      buildBidText(G.hBid.player,G.hBid.bid,G.hBid.hl,G.hBid.trump,
			   G.hBid.alone,G.hBid.cardReq);

	//	cLog("built this: ",bidTextStr);
	
	//	$('modal-sub').textContent =
	//            "Current bid: " + desc + " — " + bidText; //bid at least " + min;
	$('modal-sub').textContent = "Last bid -> " + bidTextStr;
	
    } else {
	$('modal-sub').textContent = "No bids yet — minimum bid is " + min;
    }
    
    
    const bb=$('bid-buttons');
    bb.innerHTML='';
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

    // for buttons 1 to 7
    for(let b=1;b<8;b++) {
	
	/*	const btn=document.createElement('button');
		btn.className='bbtn';
		btn.textContent = b;

		if (b<min) btn.disabled=true;
		else btn.addEventListener('click',()=>pickAmt(b));
		
		bb.appendChild(btn);
	*/
	const bEnabled = b>=min;
	addABidButton(bb,b,"","",b,bEnabled,true);
	
    }//1 to 7 buttons

    addABidButton(bb,"","","",0,false,false); // add a blank space

    
 //   cLog("#2 alone 2:", G.hBid, G.hBid.alone,G.hBid.cardReq);
 //   cLog("#2 a  G.hBid:",G.hBid);

    const call1 = "Call for 1";
    const call2 = "Call for 2";
    const moonshotBack = "black";
    
    // if there is no bid yet just add all the buttons
    if (!G.hBid) {
	addABidButton(bb,call2,"blue","white",10,true,true);
	addABidButton(bb,call1,"blue","white", 9,true,true);
	addABidButton(bb,"","","",0,false,false); // add a blank space
	addABidButton(bb,"✨MoonShot✨",   moonshotBack,"gold",8,true,true);
    } else {
	// 9 and 10 are artificial. 9 is chose 1.  10 is chose 2
	if (!G.hBid.alone) {
	    addABidButton(bb,call2,"blue","white",10,true,true);
	    addABidButton(bb,call1,"blue","white", 9,true,true);
	    addABidButton(bb,"","","",0,false,false); // add a blank space
	    addABidButton(bb,"✨MoonShot✨",   moonshotBack,"gold",8,true,true);
	}
	
	if (G.hBid.alone && G.hBid.cardReq === 0) {
	    addABidButton(bb,"blue","white",10,false,true);
	    addABidButton(bb,call1,"blue","white", 9,false,true);
	    addABidButton(bb,"","","",0,false,false); // add a blank space
	    addABidButton(bb,"✨MoonShot✨",moonshotBack,"gold",8,false,true);
	}
	if (G.hBid.alone && G.hBid.cardReq === 1) {
	    addABidButton(bb,call2,"blue","white",10,false,true);
	    addABidButton(bb,call1,"blue","white", 9,false,true);
	    addABidButton(bb,"","","",0,false,false); // add a blank space
	    addABidButton(bb,"✨MoonShot✨",   moonshotBack,"gold",8,true,true);
	}
	if (G.hBid.alone && G.hBid.cardReq === 2) {
	    addABidButton(bb,call2,"blue","white",10,false,true);
	    addABidButton(bb,call1,"blue","white", 9,true, true);
	    addABidButton(bb,"","","",0,false,false); // add a blank space
	    addABidButton(bb,"✨MoonShot✨",   moonshotBack,"gold",8,true,true);
	}
    }
    
    
    const pb=document.createElement('button');pb.className='bbtn pbtn';
    pb.textContent='Pass';
    pb.addEventListener('click',()=>{
	$('bid-modal').classList.add('hidden');
	bIdx++;
	setTimeout(nextBid,300);
    });
    
    bb.appendChild(pb);
    $('bid-modal').classList.remove('hidden');
}//showBidMod

function addABidButton(bidButtons,bText,bBackground,bColor,bAmount,
		       bEnable,bShow) {

    const btnE=document.createElement('button');
    
    btnE.className        ='bbtn';
    btnE.textContent      = bText;
    btnE.style.background = bBackground;
    btnE.style.color      = bColor;
    
    btnE.addEventListener('click',()=>pickAmt(bAmount));

    if (!bEnable) {
	btnE.disabled=true;
    }
    
    if (!bShow) {
	btnE.style.visibility = "hidden";
    }
    
    bidButtons.appendChild(btnE);
    
}

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

    const reqMap = {9: 1,10: 2};
    pCardReq = reqMap[amt] || 0;
    
    pickTrump();
    
    
} //pickAlone

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

//	    
	    placeBid('south',pAmt,s,pHL,pAlone,pAlone?pCardReq:0);

//	    cLog("pickTrump Listener: pAlone, pCardReq",pAlone,pCardReq);
	    
	    hud();
	    bIdx++;
	    setTimeout(nextBid,300);
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
    G.hl    = h.hl;
    G.cardReq = h.cardReq;

    //    cLog("at start of finishBid: cardReq:", h.cardReq);
    //    cLog("at start of finishBid: hBid .. cardReq:", G.hBid.cardReq);
    //    cLog("at start ... lastExch : ", G.lastExchangeCount);
    
    // ⭐ If ANY player bid 8 and requested 1 or 2 cards → do exchange FIRST
    if (h.bid === 8 && h.cardReq > 0) {
//    if (h.bid === 8 && !G.exchangeDone) {
	
        // Do NOT overwrite cardReq here
        setTimeout(() => startExchange(h.cardReq, h.player), 300);
        return; // stop normal flow until exchange is done
    }

    // Enforce rule: bid 8 = alone (MoonShot or no request)
    if (h.bid === 8) {
        h.alone = true;

        // If MoonShot (cardReq = 0), keep it
        // If exchange already happened, cardReq was consumed
        // If no exchange, cardReq should be 0
	//       if (!h.cardReq) h.cardReq = 0;

	//    h.hl = 'high'; // 8 is always high  ... alone can go high/low
    } else {
        // All other bids cannot go alone
        h.alone   = false;
        h.cardReq = 0;
    }

    // Apply final bid settings
    G.trump   = h.trump;
    G.hl      = h.hl;
    G.alone   = h.alone;
    //    G.cardReq = h.cardReq;

    //    let msg_text = PN[h.player] + ' bids ' + h.bid + ' ' + h.hl + ' — Trump: ' + h.trump;

    /*
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
    */

    //    cLog("at end of finishBid: cardReq:", h.cardReq);
//    cLog("exchange: G:", G, h);
    
    let msg_text = buildBidText(PN[h.player], h.bid, h.hl, h.trump,
				h.alone, G.lastExchangeCount);

    //    cLog("finishBid Text: ", PN[h.player], h.bid, h.hl, h.trump,
    //	 h.alone, G.cardReq);
    
    hud();
    
    msg(msg_text, 2600);
    
    G.leader = h.player;  //this is who starts the bidding but also now who leads the card
    // h.player won the bid
    
    G.cur = h.player;
    G.phase = 'play';

    updateConcedeButton();

    //    renderHands(true, 'south');  // ??? Somehow we need this otherwise we cannot select

    activateSouthHand();
    
    setTimeout(startTrick, 2700);
} //finishBid

function activateSouthHand() {
    const hand = $('hand-south').children;

    for (let el of hand) {
        el.classList.remove('dimCard', 'exchange-select', 'selected');
	
        el.onclick = () => {
            const cid = parseInt(el.dataset.cid);
            const card = G.H.south.find(c => c.uid === cid);
	    // ... was this???            if (card) playCard('south', card);
	    if (card) selCard(card, el);   // ✅ go through legality check
        };
    }
}//activateSouthHand

// Example returns:
//   North: Alone NT high ask 2
//   South: 3 NT low
//   Eash:  4 heart
//   West:  Alone clubs
// for suite use graphic display
function buildBidText(player, bid, hl, trump, alone, cardReq) {

    //    cLog("build bid: ",player, bid, hl, trump, alone, cardReq);
    // no bid pass
    if (bid === 0) {
	const noBid = italicize(player) + ": pass";
	return noBid;
    }
    
    var sym = {
	"hearts":   "♥️",     // red heart emoji - fine on dark bg
	"diamonds": "♦️",   // red diamond emoji - fine on dark bg
	"clubs":    "♣",       // U+2663, no emoji selector
	"spades":   "♠",      // U+2660, no emoji selector
	"NT":       "NT"
    };
    
    var sym1 = {
        "♥": "♥️",
        "♦": "♦️",
        "♣": "♣️",
        "♠": "♠️",
        "NT": "NT"
    };
    
    var sym2 = {
	"hearts":   "♥️",     // red heart emoji
	"diamonds": "♦️",   // red diamond emoji
	"clubs":    "♣️",
	"spades":   "♠️",
	"NT":       "NT"
    };
    
    var sym3 = {
	"♥": "♥️",
	"♦": "♦️",
        "♣": "♣",
        "♠": "♠",
        "NT": "NT"
    };
    
    //    cLog("trump:",trump);
    
    let t = sym[trump] || trump;   // fallback if already symbol
    //    t = sym1[trump] || trump; 
    t = sym3[trump] || trump; 
    
    //    let s = player + ": ";
    //    let s = "<i>" + player + "</i>" + ": ";
    
    let s = italicize(player) + ": ";
    
    // ALONE bids
    if (alone) {
	if (cardReq === 0) s += "✨MoonShot✨";
        if (cardReq > 0  ) s += "Call for " + cardReq;

//	s += " in ";
	
        // trump display
        if (trump === "NT") {
            s += " NT";
            if (hl) s += " " + hl.toLowerCase();   // high / low
        } else {
            s += " in " + t;   // suit symbol
        }

        // card request

        return s;
    }

    // NORMAL bids
    s += bid + " ";

    if (trump === "NT") {
        s += "NT";
        if (hl) s += " " + hl.toLowerCase();
    } else {
        s += t;
    }

    return s;
}


// **** Concede ****

function updateConcedeButton() {
    const btn = $('concedeBtn');

    // The player who won the bid
    const bidder = G.hBid ? G.hBid.player : null;

    if (!bidder) {
        btn.style.display = 'none';
        return;
    }

    // Show only if WE are defending
    if (TEAMS[bidder] === 'them') {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
}


$('concedeBtn').onclick = function () {

    const bid = G.hBid;
    if (!bid) return;

    const bt = TEAMS[bid.player];          // bidding team
    const ot = bt === 'us' ? 'them' : 'us'; // defenders

    // When conceding, the bidding team gets all 8 tricks.
    // gets what they bid only - all 8 was roo high.
    G.tw[bt] = bid.bid; //8;
    G.tw[ot] = 0;

    // Now scoreHand() will apply the correct scoring:
    // - Lone hand success (24/18/12)
    // - Normal bid success (btw >= bid)
    // - Defenders get 0
    scoreHand();

    $('concedeBtn').style.display = 'none';

};

// *** END of Concede 
