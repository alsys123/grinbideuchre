
/*

  PLAY of the hand

*/


// Entry Point: startTrick --> from bidding.js
function startTrick(){

//    cLog("#4 Hand of north: ",prettyHand(G.H["north"]));
    
    G.trick=[];
    
    //    G.cur=G.leader;
    G.cur = G.leader;

    const skip = lonePartner();
    if (G.cur === skip) {
	const idx = PL.indexOf(G.cur);
	G.cur = PL[(idx + 1) % 4];
    }


    setWhoIsActive(G.cur);
    
//    renderHands(true);
//    renderHands(true, 'south');   // redraw ONLY south
    
    if(G.cur!=='south')
	setTimeout(()=>aiPlay(G.cur),900);

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
        setWhoIsActive(G.cur);

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

    // ⭐ NT LOW special lead rule
if (G.trump === 'NT' && G.hl === 'low') {

    // NT-Low rank order: J > Q > K > A
    const order = { J: 4, Q: 3, K: 2, A: 1 };

    // Sort by NT-Low rank (descending)
    const sorted = hand.slice().sort((a, b) =>
        order[b.r] - order[a.r]
    );

    // Lead the highest NT-Low card (J first)
    return sorted[0];
}

    if(G.hl==='high'){
	const tr=sc.filter(x=>esuit(x.c,G.trump,G.hl)===G.trump).sort((a,b)=>b.s-a.s);
	
	if(tr.length>0&&Math.random()<.6)
	    return tr[0].c;
	
	return sc.sort((a,b)=>b.s-a.s)[0].c;
    }
    
    const tr=sc.filter(x=>esuit(x.c,G.trump,G.hl)===G.trump).sort((a,b)=>a.s-b.s);

    if(tr.length>0)
	return tr[0].c;

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

// ???? .... something is odd here because leader is set to winner of bid or trick??

function resolveT(){
    const winner=twinner(G.trick,G.trump,G.hl);

    G.tw[TEAMS[winner]]++;
    G.done.push({trick:G.trick,winner});
    G.leader=winner;
    setWhoIsActive(winner);
    hud();

    if (winner === 'north') speech(winner,'↓', 2000);
    if (winner === 'south') speech(winner,'↑', 2000);
    if (winner === 'east')  speech(winner,'←', 2000);
    if (winner === 'west')  speech(winner,'→', 2000);
    
//    const ws=$('ts-'+winner);
//    ws.style.animation = 'trickWinSoft 1.2s ease-out';
//    setTimeout(() => { ws.style.animation = ''; }, 1300);

    /* ... other samples
    //    ws.style.animation='trickWin 1.0s ease'; //0.4    
    //  setTimeout(()=>{ws.style.animation=''; },400);
    //ws.style.animation = 'trickWinSmooth 0.9s cubic-bezier(0.25, 0.1, 0.25, 1)';
    //setTimeout(() => { ws.style.animation = ''; }, 950);
    */
    

    
    setTimeout(()=>{
	clearTC();
	G.trick=[];
//	if(G.H.south.length===0)scoreHand();
	const activePlayer = lonePartner() === 'south' ? 'north' : 'south';
	if(G.H[activePlayer].length===0)scoreHand();
	
	else startTrick();	
    },1200); // was 1700

//    cLog("at resolvtT: dealer:", G.dealer, " - leader: ", G.leader);
    
} //resolveT

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


