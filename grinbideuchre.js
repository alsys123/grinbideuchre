

// ═══════════════════════════ BID EUCHRE — Google-Sites-safe ═════════════════════════


//const SUITS=['♠','♥','♦','♣'], RANKS=['9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
const RANKS=['J','Q','K','A'];

const RED=new Set(['♥','♦']);

function sCol(s){return RED.has(s)?'#cc2222':'#111';}

// was 72x108
function cardSVG(rank,suit,down){
    if(down) return `<svg viewBox="0 0 72 108" xmlns="http://www.w3.org/2000/svg">
    <rect width="90" height="120" rx="7" fill="#1c3e60"/>
    <rect x="3" y="3" width="66" height="102" rx="6" fill="none" stroke="#2a5e90" stroke-width="1.2"/>
    <pattern id="bp${Math.random().toString(36).slice(2,6)}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M5 0L10 5L5 10L0 5Z" fill="none" stroke="#2a5e90" stroke-width="0.7"/>
    </pattern>
    <rect x="5" y="5" width="62" height="98" rx="5" fill="#1c3e60" opacity="0.7"/>
    <path d="M5 5L67 5M5 103L67 103M5 5L5 103M67 5L67 103" stroke="#2a5e90" stroke-width="0.5"/>
    <line x1="5" y1="5" x2="67" y2="103" stroke="#2a5e90" stroke-width="0.4"/>
    <line x1="67" y1="5" x2="5" y2="103" stroke="#2a5e90" stroke-width="0.4"/>
    <rect x="20" y="30" width="32" height="48" rx="3" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>
    <text x="36" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#c9a84c" opacity="0.35">&#10022;</text>
  </svg>`;

    const c=sCol(suit);
    const cr=`
    <text x="5" y="14" font-family="Georgia,serif" font-size="13"
font-weight="bold" fill="${c}">${rank}</text>
    <text x="5" y="25" font-family="Georgia,serif" font-size="17"
fill="${c}">${suit}</text>
    <g transform="translate(67,94) rotate(180)">
      <text x="5" y="14" font-family="Georgia,serif" font-size="13"
font-weight="bold" fill="${c}">${rank}</text>
      <text x="5" y="25" font-family="Georgia,serif" font-size="15"
fill="${c}">${suit}</text>
    </g>`;

    let mid='';
    if(rank==='A'){
	mid=`<text x="36" y="65" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="${c}">${suit}</text>`;
    } else if(rank==='9'){
	mid=`<text x="36" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="${c}">${suit}</text>
         <text x="36" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="${c}">${suit}</text>`;
    } else if(rank==='10'){
	[[22,30],[50,30],[22,47],[50,47],[36,39],[22,65],[50,65],[22,82],[50,82],[36,56]].forEach(([x,y])=>{
	    mid+=`<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${c}">${suit}</text>`;
	});
    } else {
	const labels={J:'JACK',Q:'QUEEN',K:'KING'};
	mid=`<rect x="13" y="22" width="46" height="64" rx="4" fill="none"
stroke="${c}" stroke-width="0.7" opacity="0.22"/>
         <text x="36" y="57" text-anchor="middle" font-family="Georgia,serif"
font-size="30" font-weight="bold" fill="${c}">${rank}</text>
         <text x="36" y="72" text-anchor="middle" font-family="Georgia,serif"
font-size="9" fill="${c}" opacity="0.6">${suit} ${labels[rank]}</text>`;
    }

    return `<svg viewBox="0 0 72 108" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="wg${rank}${suit.charCodeAt(0)}" x1="0" y1="0" x2=".3" y2="1">
      <stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#f0ece0"/>
    </linearGradient></defs>
    <rect width="72" height="108" rx="7" fill="url(#wg${rank}${suit.charCodeAt(0)})" stroke="#bbb" stroke-width=".4"/>
    ${cr}${mid}
  </svg>`;
}

// GAME CORE
/*
  function deck(){
    const d=[];
    for(const s of SUITS)
	for(const r of RANKS)d.push({r,s});
    return d;
}
*/
function deck(){
    const ranks = ["J","Q","K","A"];
    const suits = ["♠","♥","♦","♣"];
    const d = [];
    let i, r, s;

    // double deck
    for(i=0;i<2;i++){
        for(r of ranks){
            for(s of suits){
                d.push({ r, s });
            }
        }
    }
    return d;
}

function shuffle(a){
    a=[...a];
    for(let i=a.length-1;i>0;i--){
	const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];
    }
    return a;
}

function psuit(t){
    var map = {
        "♠": "♣",
        "♣": "♠",
        "♥": "♦",
        "♦": "♥"
    };
    return map[t];
}

function esuit(c,t,hl){
    if(hl==='low')
	return c.s;
    if(c.r==='J'&&c.s===t)
	return t;
    if(c.r==='J'&&c.s===psuit(t))
	return t;
    return c.s;
}

function crank(c,t,led,hl){
    if(hl==='low'){
	const lr={J:4,Q:3,K:2,A:1};
	if(c.s===t)return 10+lr[c.r];
	if(c.s===led)return lr[c.r];
	return 0;
    }
    
    if(c.r==='J'&&c.s===t)
	return 30;
    if(c.r==='J'&&c.s===psuit(t))
	return 29;
    
    const hr={Q:4,K:5,A:6,J:3};
    
    if(esuit(c,t,hl)===t)
	return 20+hr[c.r];
    if(c.s===led)
	return hr[c.r];
    return 0;
}

function twinner(trick,t,hl){
    const led=esuit(trick[0].card,t,hl);let best=trick[0];
    for(let i=1;i<trick.length;i++)
	if(crank(trick[i].card,t,led,hl)>crank(best.card,t,led,hl))best=trick[i];
    return best.player;
}

function legal(hand,led,t,hl){
    if(!led)
	return hand;
    const f=hand.filter(c=>esuit(c,t,hl)===led);
    return f.length?f:hand;
}

// STATE
const PL=['south','west','north','east'];
const TEAMS={south:'us',north:'us',west:'them',east:'them'};
const PN={south:'You',north:'North',west:'West',east:'East'};

const G={
    sc:{us:0,them:0},H:{south:[],west:[],north:[],east:[]},
    trick:[],done:[],tw:{us:0,them:0},
    dealer:'south',leader:'west',cur:null,
    phase:'deal',bids:{},hBid:null,trump:null,hl:'high',sel:null
};

// UI
let msgT=null;

function msg(t,d=2400){

    cLog("got a message: ",t);
    
    const e=$('message');
    e.textContent=t;
    e.classList.remove('hidden');
    clearTimeout(msgT);
    msgT=setTimeout(()=>e.classList.add('hidden'),d);

}

function speech(who,t,d=2000){
    const e=$('sp-'+who);if(!e)return;
    e.textContent=t;e.classList.remove('hidden');
    clearTimeout(e._t);
    e._t=setTimeout(()=>e.classList.add('hidden'),d);
}

function setAct(who){
    PL.forEach(p=>$('name-'+p).classList.toggle('active',p===who));
}

function $(i){
    return document.getElementById(i);
	     }

function hud(){
    $('score-us').textContent=G.sc.us; $('score-them').textContent=G.sc.them;
    $('tricks-us').textContent=G.tw.us+' tricks'; $('tricks-them').textContent=G.tw.them+' tricks';
    $('pile-us').textContent=G.tw.us; $('pile-them').textContent=G.tw.them;
    if(G.trump){const ts=$('trump-suit');ts.textContent=G.trump;ts.style.color=RED.has(G.trump)?'#e03030':'#f0ece0';$('trump-hl').textContent=G.hl.toUpperCase();}
    else{$('trump-suit').textContent='—';$('trump-suit').style.color='';$('trump-hl').textContent='';}
    $('bid-info').textContent=G.hBid?PN[G.hBid.player]+': '+G.hBid.bid+' tricks':'—';
}

function renderHands(canPlay){
    cLog("renderHands");
    
    PL.forEach(p=>{
	const el=$('hand-'+p); el.innerHTML='';
	const south=p==='south';
	G.H[p].forEach((card,i)=>{
	    const d=document.createElement('div');

	    d.className='card din'+(south&&canPlay?' playable':'');

	    d.innerHTML=cardSVG(card.r,card.s,!south);

	    d.style.animationDelay=(i*.04)+'s';

//	    cLog("cid:", cid(card),south,canPlay);

	    if( south && canPlay ) 
		
		d.addEventListener('click',()=>
		    selCard(card,d)
		    
		);
		
		el.appendChild(d);
	    
	    
	});
    });
}

function cid(c){
    return c.r + c.s;   // "9♣"
}


function selCard(card,el){

    cLog("select a card");
    
    if(G.cur!=='south'||G.phase!=='play')
	return;

    if(G.trick.length>0){
	const led=esuit(G.trick[0].card,G.trump,G.hl);
	
	if(!legal(G.H.south,led,G.trump,G.hl).find(c=>cid(c)===cid(card))){
	    
	    msg('Must follow suit!',1600);
	    
	    return;
	}
    }
    document.querySelectorAll('#hand-south .card.selected').forEach(e=>e.classList.remove('selected'));
    
    G.sel=card; el.classList.add('selected');
    
    $('play-btn').classList.remove('hidden');
}

$('play-btn').addEventListener('click',()=>{
    if(!G.sel)return;
    $('play-btn').classList.add('hidden');
    playCard('south',G.sel);
});

function showTC(p,c){const s=$('ts-'+p);s.innerHTML='';
		     const d=document.createElement('div');
		     d.className='card';
		     d.innerHTML=cardSVG(c.r,c.s,false);
		     s.appendChild(d);
		    }
function clearTC(){['south','north','west','east'].forEach(p=>$('ts-'+p).innerHTML='');}

// DEAL
function deal(){
    G.trick=[];
    G.done=[];
    G.tw={us:0,them:0};
    G.bids={};
    G.hBid=null;
    G.trump=null;
    G.hl='high';
    G.sel=null;
    G.phase='bid';
    clearTC(); hud();
    
    $('play-btn').classList.add('hidden');
    $('result-overlay').classList.add('hidden');
    $('message').classList.add('hidden');
    $('start-screen').classList.add('hidden');
    
    const dk=shuffle(deck());
    
//    PL.forEach((p,i)=>G.H[p]=dk.slice(i*6,i*6+6));
    PL.forEach((p,i)=>G.H[p]=dk.slice(i*8,i*8+8));
    
    const di=PL.indexOf(G.dealer);
    G.leader=PL[(di+1)%4];
    renderHands(false);
    setTimeout(startBid(),500);
}


// PLAY
function startTrick(){
    G.trick=[];G.cur=G.leader;
    setAct(G.cur);
    
    renderHands(true);
    
    if(G.cur!=='south')setTimeout(()=>aiPlay(G.cur),900);
}

function removeOneCard(hand, card){
    const id = cid(card);
    const i = hand.findIndex(c => cid(c) === id);
    if(i !== -1) hand.splice(i, 1);   // remove only one
}

function playCard(player,card){

//    G.H[player]=G.H[player].filter(c=>cid(c)!==cid(card));
    removeOneCard(G.H[player], card);
    
    G.trick.push({player,card});
    G.sel=null;

    showTC(player,card);

    renderHands(G.phase==='play'&&G.cur==='south');

    if(G.trick.length<4){
	const idx=PL.indexOf(player);
	G.cur=PL[(idx+1)%4];
	setAct(G.cur);

	if(G.cur!=='south') {
	    setTimeout(()=>aiPlay(G.cur),850);
	} else {
	    renderHands(true);   // ← re-enable your hand
	}
	
    } else
	setTimeout(resolveT,950);
    
}

// *** AI PLAYING
function aiPlay(player){
    const hand=G.H[player];let card;
    if(G.trick.length===0){
	card=aiLead(hand);
			  }
    else{const led=esuit(G.trick[0].card,G.trump,G.hl);
	 card=aiFollow(player,legal(hand,led,G.trump,G.hl),led);
	}
    playCard(player,card);
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

// SCORE
function scoreHand(){
    G.phase='result';
    setAct(null);
    hud();
    
    const h=G.hBid,bt=TEAMS[h.player],ot=bt==='us'?'them':'us';
    const btw=G.tw[bt],otw=G.tw[ot];let detail='';
    
    if(btw>=h.bid){
	G.sc[bt]+=btw;
	detail=PN[h.player]+"'s team made it! +"+btw+' pts.';
    }
    else{
	G.sc[bt]-=h.bid;
	detail=PN[h.player]+"'s team went set! \u2212"+h.bid+' pts.';
    }
    G.sc[ot]+=otw;
    let title='Hand Complete',extra='';
    if(G.sc.us>=32||G.sc.them>=32){
	if(G.sc.us>G.sc.them){
	    title='Victory!';
	    extra=' You & North win!';
	}else
	    if(G.sc.them>G.sc.us){
		title='Defeated!';e
		xtra=' East & West win.';
	    }else{
		title='Tie Game!';
	    }
    }
    $('result-title').textContent=title;
    $('result-detail').textContent=detail+extra;
    $('result-us').textContent=G.sc.us;
    $('result-them').textContent=G.sc.them;
    $('result-overlay').classList.remove('hidden');
    
    const di=PL.indexOf(G.dealer);
    G.dealer=PL[(di+1)%4];
    const btn=$('deal-again-btn');
    if(G.sc.us>=32||G.sc.them>=32){
	btn.textContent='New Game';
	
	btn.onclick=()=>{
	    G.sc={us:0,them:0};deal();
			};
    }
    else{
	btn.textContent='Deal Next Hand';btn.onclick=deal;
    }
}

$('deal-again-btn').addEventListener('click',deal);

$('new-game-btn').addEventListener('click',deal);

// Scale to fit — key for Google Sites iframe
function scale(){
    const w=$('wrap');
    const sx=window.innerWidth/900, sy=window.innerHeight/620;
    const s=Math.min(sx,sy,1.2); // allow slight upscale if lots of room
    w.style.transform='scale('+s+')';
    w.style.transformOrigin='top center';
    w.style.width='900px';
    w.style.height='620px';
    const ph=Math.max(0,Math.floor((window.innerHeight-620*s)/2));
    document.body.style.paddingTop=ph+'px';
}
window.addEventListener('resize',scale);
scale();

// Show the start screen on initial load
$('start-screen').classList.remove('hidden');

