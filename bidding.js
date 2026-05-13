// BIDDING
let bOrder=[],bIdx=0,pAmt=null,pHL=null,pAlone=null,pCardReq=null;

function startBid(){
    G.phase='bid';const si=PL.indexOf(G.leader);
    bOrder=PL.map((_,i)=>PL[(si+i)%4]);bIdx=0;nextBid();
}

function nextBid(){
    if(bIdx>=bOrder.length){if(!G.hBid){
	msg('All passed — dealer must bid 3!',2200);
	setTimeout(()=>{
	    placeBid(G.dealer,3,G.H[G.dealer][0].s,'high',false,0);
	    finishBid();
	},2300);return;}finishBid();return;
			   }
    const p=bOrder[bIdx]; setAct(p);
    if(p==='south')showBidMod(); else setTimeout(()=>aiBid(p),1000);
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
    const bs = Object.entries(sc).sort((a,b)=>b[1]-a[1])[0][0];
    str += sc[bs] * 0.5; // best suit bonus

    // Right bower bonus
    if (hand.find(c => c.r === 'J' && c.s === bs)) str += 1;

    const min = G.hBid ? G.hBid.bid + 1 : 3;
    let bid = 0;

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
    }

    // High/Low
    const hl = (hand.filter(c => c.r === '9' || c.r === '10').length >= 3 && Math.random() < .3)
        ? 'low'
        : 'high';

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
    if (amt === 8) {
        // auto alone, auto high, auto no card request
        pHL = 'high';
        pAlone = true;
        pCardReq = 0;
        pickTrump();
        return;
    }
    
    $('bid-buttons').style.display='none';

    $('modal-sub').textContent='High or Low?';

    const hl=$('highlow-picker');
    hl.style.display='flex';
    hl.innerHTML='';

    ['high','low'].forEach(v=>{
	const b=document.createElement('button');
	b.className='hlbtn';
	b.textContent=v[0].toUpperCase()+v.slice(1);
	b.addEventListener('click',()=>{pHL=v;pickAlone();
				       });
	hl.appendChild(b);
    });
}

function pickAlone(){
    $('highlow-picker').style.display='none';
    $('modal-sub').textContent='Go alone?';
    const ap=$('alone-picker');
    ap.style.display='flex';
    ap.innerHTML='';
    ['Yes','No'].forEach(v=>{const b=document.createElement('button');
			     b.className='abtn';
			     b.textContent=v;
			     b.addEventListener('click',()=>{pAlone=(v==='Yes');
							     pAlone?pickCardReq():pickTrump();});
			     ap.appendChild(b);
			    });
}

function pickCardReq(){
    $('alone-picker').style.display='none';
    $('modal-sub').textContent='Ask partner for cards?';
    const cp=$('card-req-picker'); cp.style.display='flex'; cp.innerHTML='';
    ['0','1','2'].forEach(v=>{const b=document.createElement('button');
			      b.className='cbtn';
			      b.textContent=v;
			      b.addEventListener('click',()=>{pCardReq=parseInt(v);pickTrump();});cp.appendChild(b);
			     });
    
}

function pickTrump(){
    $('card-req-picker').style.display='none'; $('alone-picker').style.display='none';
    $('modal-sub').textContent='Choose Trump Suit';
    const tp=$('trump-picker'); tp.style.display='flex'; tp.innerHTML='';
    SUITS.forEach(s=>{const b=document.createElement('button');
		      b.className='tbtn '+(RED.has(s)?'red-s':'blk-s');
		      b.textContent=s;
		      b.addEventListener('click',()=>{$('bid-modal').classList.add('hidden');
					    $('bid-buttons').style.display='grid';
					    placeBid('south',pAmt,s,pHL,pAlone,pAlone?pCardReq:0);
					    hud();
					    bIdx++;setTimeout(nextBid,300);});
		      tp.appendChild(b);
		     });
}

function finishBid(){
    if(!G.hBid)return;
    const h=G.hBid;

    // Enforce rule: bid 8 = alone
    if (h.bid === 8) {
        h.alone = true;
        h.cardReq = 0;
        h.hl = 'high';   // optional: 8 is always high
    }
    
    G.trump=h.trump;
    G.hl=h.hl;
    G.alone=h.alone;
    G.cardReq=h.cardReq;
    
    let msg_text=PN[h.player]+' bids '+h.bid+' '+h.hl+' — Trump: '+h.trump;
    
    if(h.alone)msg_text+=' (ALONE'+(h.cardReq?' - ask '+h.cardReq+' card'+(h.cardReq===1?'':'s'):'')+ ' - need 8 tricks)';
    hud();
    msg(msg_text,2600);
    G.leader=h.player;
    G.cur=h.player;
    G.phase='play';

    renderHands(true,'south');

    setTimeout(startTrick,2700);
}
