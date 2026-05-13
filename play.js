

// PLAY
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

function resolveT(){
    const winner=twinner(G.trick,G.trump,G.hl);
    G.tw[TEAMS[winner]]++; G.done.push({trick:G.trick,winner}); G.leader=winner;
    msg(PN[winner]+' wins the trick!',1500); setAct(winner); hud();
    const ws=$('ts-'+winner); ws.style.animation='trickWin .4s ease';
    
    setTimeout(()=>{ws.style.animation='';
		   },400);
    setTimeout(()=>{
	clearTC();G.trick=[];
	if(G.H.south.length===0)scoreHand();
	else startTrick();
    },1700);
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
