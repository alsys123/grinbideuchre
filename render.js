
/*
  Render
  
*/
// delete me
function sCol(s){
    return RED.has(s)?'#cc2222':'#111';
}


//v3
function cardSVG(rank, suit, down) {
    const downDiv =
	  `<div style="width:66px;height:100px;
         background:#1c3e60;border-radius:7px;
         border:1px solid #2a5e90;"></div>`;

    if (down) return downDiv;

    const faceMap = { 'A': 'a', 'J': 'j', 'Q': 'q', 'K': 'k' };
    const fileRank = faceMap[rank] ?? rank;
    const faceCard =
	  `<img src="cards/Simple/${suit}${fileRank}.png"  
	style="
        display:block;
        width:125px;
        transform: translateY(-60px) translateX(-30px);
        z-index:50;
        draggable="false"
           >`
    
    return faceCard;

}
//        width:92px;
//        height:128px;

//v4
function cardSVGv4(rank, suit, down) {
    if (down) return `<img src="cards/Simple/back.jpg"
style="width:72px;
height:108px;
display:block;"
draggable="false">`;

    const faceMap = { 'A': 'a', 'J': 'j', 'Q': 'q', 'K': 'k' };
    const fileRank = faceMap[rank] ?? rank;
    return `<img src="cards/Simple/${suit}${fileRank}.png"
style="width:72px;height:108px;display:block;" draggable="false">`;
}


//v2
function cardSVGv2(rank, suit, down) {
    if (down) return `<svg viewBox="0 0 72 108" xmlns="http://www.w3.org/2000/svg">
    <rect width="90" height="120" rx="7" fill="#1c3e60"/>
    <rect x="3" y="3" width="66" height="102" rx="6" fill="none" stroke="#2a5e90" stroke-width="1.2"/>
    <rect x="5" y="5" width="62" height="98" rx="5" fill="#1c3e60" opacity="0.7"/>
    <path d="M5 5L67 5M5 103L67 103M5 5L5 103M67 5L67 103" stroke="#2a5e90" stroke-width="0.5"/>
    <line x1="5" y1="5" x2="67" y2="103" stroke="#2a5e90" stroke-width="0.4"/>
    <line x1="67" y1="5" x2="5" y2="103" stroke="#2a5e90" stroke-width="0.4"/>
    <rect x="20" y="30" width="32" height="48" rx="3" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>
    <text x="36" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#c9a84c" opacity="0.35">&#10022;</text>
  </svg>`;

    const faceMap = { 'A': 'a', 'J': 'j', 'Q': 'q', 'K': 'k' };
    const fileRank = faceMap[rank] ?? rank;
    const file = `cards/Simple/${suit}${fileRank}.png`;

    return `<img src="${file}" style="width:72px;height:108px;display:block;" draggable="false">`;
}

// was 72x108
//v1
function cardSVGv1(rank,suit,down){
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

function removeCardFromDOM(player, card) {
    const id = cid(card);
    const hand = document.querySelector(`#hand-${player}`);
    if (!hand) return;

    const el = hand.querySelector(`.card[data-cid="${id}"]`);
    if (el) {
        el.classList.add('fade-out');
        setTimeout(() => el.remove(), 200);
    }
}

function hud(){
    $('score-us').textContent=G.sc.us;
    $('score-them').textContent=G.sc.them;
    $('tricks-us').textContent=G.tw.us+
	' tricks';
    $('tricks-them').textContent=G.tw.them+' tricks';
    $('pile-us').textContent=G.tw.us;
    $('pile-them').textContent=G.tw.them;
    
    if(G.trump){
	const ts=$('trump-suit');
	ts.textContent=G.trump;
	ts.style.color=RED.has(G.trump)?'#e03030':'#f0ece0';
	$('trump-hl').textContent=G.hl.toUpperCase();
    }
    else{
	$('trump-suit').textContent='—';
	$('trump-suit').style.color='';
	 $('trump-hl').textContent='';
    }
    
//    $('bid-info').textContent=G.hBid?PN[G.hBid.player]+
//	': '+
//	G.hBid.bid+' tricks':'—';

    if (G.hBid) {
    const b = G.hBid;
    const suit = b.trump === "NT" ? "NT" : b.trump;
    const hl = b.hl.toUpperCase();
    const alone = b.alone ? " alone" : "";
	const suitSpan =
	      `<span style="color:${RED.has(b.trump)?'#e03030':'#f0ece0'}">${suit}</span>`;
	$('bid-info').innerHTML =
	    `${PN[b.player]}: ${b.bid} in ${suitSpan} (${hl})${alone}`;

//	$('bid-info').textContent =
//            `${PN[b.player]}: ${b.bid} in ${suit} (${hl})${alone}`;
    } else {
	$('bid-info').textContent = '—';
    }
    
}

function renderHands(canPlay, onlyPlayer = null) {

    PL.forEach(p => {

        if (onlyPlayer && p !== onlyPlayer)
            return;

        // SORT BEFORE RENDERING
        if (p === "south") {
            if (southSortMode === "base") sortBase(G.H[p]);
            else sortByBid(G.H[p]);
        } else {
            sortBase(G.H[p]); // AI hands always base‑sorted
        }

        const el = $('hand-' + p);
        el.innerHTML = '';

        const south = (p === 'south');
	
	const count = G.H[p].length;
	
        G.H[p].forEach((card,i) => {

            const d = document.createElement('div');
            d.className = 'card din' + (south && canPlay ? ' playable' : '');

            d.innerHTML = cardSVG(card.r, card.s, !south);
            d.dataset.cid = card.uid;

	    
	    if (p === "south") {
		if (i==2) {
		}
	    }
	    
	    /*
		const spread = 40; // degrees
		const angle = ((i / (count - 1)) - 0.5) * spread;
// was		const offset = (i - (count - 1) / 2) * 26;
		const offset = (i - (count - 1) / 2) * 120;  // instead of 26 or similar

		d.style.position = "absolute";
		d.style.bottom = "0";
		d.style.left = "50%";
		d.style.transformOrigin = "bottom center";
		d.style.transform = `translateX(${offset}px) rotate(${angle}deg)`;
		    d.style.zIndex = i;   // ⭐ THIS FIXES IT
	    }
*/	    
            if (south && canPlay) {
                d.addEventListener('click', () => selCard(card, d));

                // DOUBLE‑CLICK / DOUBLE‑TAP TO RESORT
                d.addEventListener('dblclick', () => {
                    southSortMode = (southSortMode === "base" ? "bid" : "base");
                    renderHands(canPlay, "south");
                });
            }

            el.appendChild(d);
        });

	
    });
}

function selCard(card,el){

  //  cLog("select a card");
    
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

// UI

// The speech bubble - displays with a timer
function speech(who,t,d=2000){
    const e=$('sp-'+who);if(!e)return;
    e.textContent=t;e.classList.remove('hidden');
    clearTimeout(e._t);
    e._t=setTimeout(()=>e.classList.add('hidden'),d);
}

function setAct(who){
    PL.forEach(p=>$('name-'+p).classList.toggle('active',p===who));
}



function showTC(p,c){const s=$('ts-'+p);s.innerHTML='';
		     const d=document.createElement('div');
		     d.className='card';
		     d.innerHTML=cardSVG(c.r,c.s,false);
		     s.appendChild(d);
		    }
function clearTC(){['south','north','west','east'].forEach(p=>$('ts-'+p).innerHTML='');}
