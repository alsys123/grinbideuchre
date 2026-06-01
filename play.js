
/*

  PLAY of the hand

*/

// Entry Point: startTrick --> from bidding.js
function startTrick(){
    G.trick=[];
    
    //    G.cur=G.leader;
    G.cur = G.leader;

    const skip = lonePartner();
    if (G.cur === skip) {
	const idx = PL.indexOf(G.cur);
	G.cur = PL[(idx + 1) % 4];
    }


    setAct(G.cur);
    
//    renderHands(true);
//    renderHands(true, 'south');   // redraw ONLY south
    
    if(G.cur!=='south')setTimeout(()=>aiPlay(G.cur),900);

    if (G.cur === 'south') {
	msg("Your Move!", 2600);
    }
    
}

function removeOneCard(hand, card){
    const id = cid(card);
    const i = hand.findIndex(c => cid(c) === id);
    if(i !== -1) hand.splice(i, 1);   // remove only one
}

function playCard(player, card) {

    removeOneCard(G.H[player], card);
    
    removeCardFromDOM(player, card);

    
    G.trick.push({ player, card });
    G.sel = null;

    showTC(player, card);


    // Only redraw south’s hand (no flicker)
    if (player === 'south') {
//	renderHands(true);
// -- do not redraw...	    renderHands(true, 'south');
    }
    
//    renderHands(G.phase === 'play' && G.cur === 'south');

    const needed = G.alone ? 3 : 4;

    if (G.trick.length < needed) {

        // Determine next player
        const idx = PL.indexOf(player);
        let next = PL[(idx + 1) % 4];

        const skip = lonePartner();
        if (next === skip) {
            next = PL[(idx + 2) % 4];   // skip partner
        }

        G.cur = next;
        setAct(G.cur);

        if (G.cur !== 'south') {
            setTimeout(() => aiPlay(G.cur), 850);
        }
	//	else {
	//            renderHands(true);   // re-enable your hand
	//        }
	
    } else {
	
        setTimeout(resolveT, 950);
	
    }
}

// *** AI PLAYING


function aiPlay(player) {

    const hand = G.H[player];
    let card;

    if (G.trick.length === 0) {
        card = aiLead(hand);
    } else {
        const led = esuit(G.trick[0].card, G.trump, G.hl);
        card = aiFollow(player, legal(hand, led, G.trump, G.hl), led);
    }

    playCard(player, card);
}

function aiLead(hand){
    const sc=hand.map(c=>({
	c,s:crank(c,G.trump,esuit(c,G.trump,G.hl),G.hl)}));
    if(G.hl==='high'){
	const tr=sc.filter(x=>esuit(x.c,G.trump,G.hl)===G.trump).sort((a,b)=>b.s-a.s);
	if(tr.length>0&&Math.random()<.6)
	    return tr[0].c;
	return sc.sort((a,b)=>b.s-a.s)[0].c;
    }
    const tr=sc.filter(x=>esuit(x.c,G.trump,G.hl)===G.trump).sort((a,b)=>a.s-b.s);
    if(tr.length>0)return tr[0].c;
    return sc.sort((a,b)=>a.s-b.s)[0].c;
}

function aiFollow(player,legs,led){
    const cur=G.trick.map(x=>crank(x.card,G.trump,led,G.hl)),mc=Math.max(...cur);
    const pw=G.trick.length>0&&TEAMS[twinner(G.trick,G.trump,G.hl)]===TEAMS[player];
    if(pw&&G.hl==='high')
	return legs.sort((a,b)=>crank(a,G.trump,led,G.hl)-crank(b,G.trump,led,G.hl))[0];
    const win=legs.filter(c=>crank(c,G.trump,led,G.hl)>mc);
    
    if(win.length>0)
	return win.sort((a,b)=>crank(a,G.trump,led,G.hl)-crank(b,G.trump,led,G.hl))[0];
    
    return legs.sort((a,b)=>crank(a,G.trump,led,G.hl)-crank(b,G.trump,led,G.hl))[0];
}

// Either startTrick looping again
//  OR scoreHand in mainline to end the hand
// This shows the winner of the hand.
function resolveT(){
    const winner=twinner(G.trick,G.trump,G.hl);

    G.tw[TEAMS[winner]]++;
    G.done.push({trick:G.trick,winner});
    G.leader=winner;
    setAct(winner);
    hud();

    
    const ws=$('ts-'+winner);

//    ws.style.animation='trickWin 1.0s ease'; //0.4    
  //  setTimeout(()=>{ws.style.animation=''; },400);
//ws.style.animation = 'trickWinSmooth 0.9s cubic-bezier(0.25, 0.1, 0.25, 1)';
//setTimeout(() => { ws.style.animation = ''; }, 950);
ws.style.animation = 'trickWinSoft 1.2s ease-out';
setTimeout(() => { ws.style.animation = ''; }, 1300);

    
    setTimeout(()=>{
	clearTC();
	G.trick=[];
	if(G.H.south.length===0)scoreHand();
	else startTrick();	
    },1700); // was 1700

    
} //resolveT

function resolveT_v2(){
    const winner=twinner(G.trick,G.trump,G.hl);

    // Dim all other players' trick cards
    ['north','east','south','west'].forEach(p => {
	if (p !== winner) {
            const el = $('ts-' + p);
            const img = el && el.querySelector('img');
            if (img) img.classList.add('dimCard');
	}
    });

    G.tw[TEAMS[winner]]++;
    G.done.push({trick:G.trick,winner});
    G.leader=winner;
//    msg(PN[winner]+' wins the trick!',1500);
    setAct(winner);
    hud();

    
    const ws=$('ts-'+winner);

    
    const cardImg = ws.querySelector('img');
    if (cardImg) {
	cardImg.style.animation = 'trickGlow 3.0s ease-out';
	setTimeout(() => cardImg.style.animation = '', 3200);
    }
    
/*
    const cardImg = ws.querySelector('img');
    if (cardImg) {
	cardImg.style.animation = 'growGlow 5.0s ease-out';
	setTimeout(() => cardImg.style.animation = '', 5200);
    }
*/    

//    ws.style.animation='trickWin 1.0s ease'; //0.4    
//    setTimeout(()=>{ws.style.animation=''; },400);

    
    setTimeout(()=>{
	clearTC();
	G.trick=[];
	if(G.H.south.length===0)scoreHand();
	else startTrick();	
    },2500); // was 1700

    
}

const PARTNER = {
    south: "north",
    north: "south",
    east: "west",
    west: "east"
};

function lonePartner() {
    if (!G.alone) return null;
    return PARTNER[G.hBid.player];
}


