

// ═══════════════════════════ BID EUCHRE — Google-Sites-safe ═════════════════════════


//const SUITS=['♠','♥','♦','♣'], RANKS=['9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
const RANKS=['J','Q','K','A'];

const RED=new Set(['♥','♦']);

let southSortMode = "base"; // "base" or "bid"

// GAME CORE

/*function deck(){
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
    */
function deck() {
    const ranks = ["J","Q","K","A"];
    const suits = ["♠","♥","♦","♣"];
    const d = [];

    // rank values
    const rv = { J:100, Q:200, K:300, A:400 };

    // suit values
    const sv = { "♣":10, "♦":20, "♥":30, "♠":40 };

    // track how many times we've seen each rank+suit
    const count = {};

    for (let i = 0; i < 2; i++) {           // double deck
        for (let r of ranks) {
            for (let s of suits) {

                const key = r + s;
                count[key] = (count[key] || 0) + 1;   // 1 or 2

                const uid = rv[r] + sv[s] + count[key];

                d.push({ r, s, uid });
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
    // setTimeout(startBid(),500);
    startBid();

    setTimeout(() => {
	speech("south",
	       "Double‑click to re‑sort your hand, anytime",
	       3500);
}, 800);

}

// after bidding complete -- double-click re-sorts hand
function sortByBid(hand) {
    if (!G.hBid) return sortBase(hand);

    const trump = G.hBid.trump;
    const suitOrder = { "♣":1, "♦":2, "♥":3, "♠":4 };
    const rankOrder = { "J":1, "Q":2, "K":3, "A":4 };

    hand.sort((a, b) => {

        // trump suit always last
        const aTrump = (a.s === trump);
        const bTrump = (b.s === trump);
        if (aTrump !== bTrump) return aTrump ? 1 : -1;

        // normal suit order
        if (suitOrder[a.s] !== suitOrder[b.s])
            return suitOrder[a.s] - suitOrder[b.s];

        // rank order
        if (rankOrder[a.r] !== rankOrder[b.r])
            return rankOrder[a.r] - rankOrder[b.r];

        return a.uid - b.uid;
    });
}

// basic sort at start of game
function sortBase(hand) {
    const suitOrder = { "♣":1, "♦":2, "♥":3, "♠":4 };
    const rankOrder = { "J":1, "Q":2, "K":3, "A":4 };

    hand.sort((a, b) => {
        if (suitOrder[a.s] !== suitOrder[b.s])
            return suitOrder[a.s] - suitOrder[b.s];
        if (rankOrder[a.r] !== rankOrder[b.r])
            return rankOrder[a.r] - rankOrder[b.r];
        return a.uid - b.uid; // stable for duplicates
    });
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


