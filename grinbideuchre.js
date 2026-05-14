

// ═══════════════════════════ BID EUCHRE — Google-Sites-safe ═════════════════════════


//const SUITS=['♠','♥','♦','♣'], RANKS=['9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
const RANKS=['J','Q','K','A'];

const RED=new Set(['♥','♦']);

let southSortMode = "base"; // "base" or "bid"

// GAME CORE

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
    if (t === "NT") return c.s;   // ⭐ No trump suit

    if (hl==='low') return c.s;
    if (c.r==='J'&&c.s===t) return t;
    if (c.r==='J'&&c.s===psuit(t)) return t;
    return c.s;
}

// Card Rank
function crank(c,t,led,hl){

    if (t === "NT") {
    const orderHigh = { J:1, Q:2, K:3, A:4 };
    const orderLow  = { A:1, K:2, Q:3, J:4 };
    const order = (hl === "low") ? orderLow : orderHigh;

    if (c.s === led) return order[c.r];
    return 0;
}

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
    sc:{us:0,them:0},
    H:{south:[],west:[],north:[],east:[]},
    trick:[],
    done:[],
    tw:{us:0, them:0 },
    
    dealer:'south',leader:'west',cur:null,

    phase:'deal',bids:{},hBid:null,trump:null,hl:'high',sel:null,
    firstHand: true
    
};

G.starts = { north:0, east:0, south:0, west:0 };
G.history = [];


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
    

    // this is done in StartNewGame instead
    //    const di=PL.indexOf(G.dealer);
    //    G.leader=PL[(di+1)%4];
    
    renderHands(false);
    // setTimeout(startBid(),500);
//    startBid();

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

    if (trump === "NT") {
	// Sort by suit, then rank
	return sortBase(hand);
    }

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

    
    G.history.push({
	dealer: G.dealer,
	leader: G.leader,
	bid: G.hBid ? {
            player: G.hBid.player,
            bid: G.hBid.bid,
            trump: G.hBid.trump,
            hl: G.hBid.hl,
            alone: G.hBid.alone
	} : null,
	tricks: { us: G.tw.us, them: G.tw.them },
	score: { us: G.sc.us, them: G.sc.them }
    });
    
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
	    G.sc={us:0,them:0};
//	    deal();
	    startNewGame();
	};

    }
    else{
	btn.textContent='Deal Next Hand';
	btn.onclick=nextHand;
    }
}

$('deal-again-btn').addEventListener('click',deal);

//$('new-game-btn').addEventListener('click',deal);
$('new-game-btn').addEventListener('click', startNewGame);

function nextHand() {
    if (allPlayersHaveTwoStarts()) {
        endGame();
    } else {
        deal();
        startNewGame();
    }
}

function randomLeader() {
    const i = Math.floor(Math.random() * 4);
    return PL[i]; // PL = ["north","east","south","west"]
}

function endGame() {

    speech("south", "Game over — all players have started twice!",2000);

    // or show a proper overlay if you want
}

//showStarterGraphic("south", ()=>{});

// player is next to bid -- dealer is to the right
function showStarterGraphic(player, cb) {

    // compute dealer = player to the right
    const i = PL.indexOf(player);
    const dealer = PL[(i + 3) % 4];   // right-hand player

    const el = $('starter-graphic');

    //    el.textContent = PN[player] + " starts!";

    el.textContent = PN[dealer] + " is the dealer.";
//    PN[player] + " bids first — "



    el.classList.remove('hidden');

    // fade in
    setTimeout(() => el.classList.add('show'), 20);

    // fade out after 1.8s
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => {
            el.classList.add('hidden');
            cb(); // continue game
        }, 600);
    }, 1800);
}

// this is actually starting a new deal
function startNewGame() {
    deal(); // deal resets hands

    let leader;
    
    if (G.firstHand) {
	// Pick winner BEFORE spinning
	leader = randomLeader();
	G.leader = leader;
	G.firstHand = false;
	

	
	const i = PL.indexOf(leader); // first to play
	const dealer = PL[(i + 3) % 4];   // right-hand player

	let leaderLabel = "";
	if (dealer === "north") dealerLabel = "➡️ N";
	if (dealer === "south") dealerLabel = "➡️ S";
	if (dealer === "east" ) dealerLabel = "➡️ E";
	if (dealer === "west" ) dealerLabel = "➡️️ W";
	
	setTimeout(() => {
	    document.querySelector('.spinner-label.' +
				   dealer).textContent = dealerLabel;
	}, 1200);

	/*
	if (leader === "north") leaderLabel = "➡️ N";
	if (leader === "south") leaderLabel = "➡️ S";
	if (leader === "east" ) leaderLabel = "➡️ E";
	if (leader === "west" ) leaderLabel = "➡️️ W";
	
	setTimeout(() => {
	    document.querySelector('.spinner-label.' +
				   leader).textContent = leaderLabel;
	}, 1200);

	 */
	
	// Step 1: show spinner
	showStarterSpinner(leader, () => {
	    // Step 3: show reveal graphic
            showStarterGraphic(leader, () => {
		// Step 4: start bidding
		startBid();
            });
	});
	
    } else {
	// All later hands: leader is left of dealer
        const di = PL.indexOf(G.dealer);
        leader = PL[(di + 1) % 4];
	
        showStarterGraphic(leader, () => startBid());

	cLog("previous dealer: ", G.dealer);
	cLog("next dealer:", leader);
    }
    
    G.starts[leader]++;
    G.leader = leader;
}

function showStarterSpinner(winner,cb) {
    const el = $('starter-spinner');
    const ring = el.querySelector('.spinner-ring');

    el.classList.remove('hidden');
    el.style.display = "block";

    let angle = 0;
    let speed = 25; // degrees per frame (fast start) was 25

    function spin() {
        angle += speed;
        ring.style.transform = `rotate(${angle}deg)`;

        // Slow down gradually
        if (speed > 0.3) {  //was 0.5
            speed *= 0.98; // decay factor was 0.97
            requestAnimationFrame(spin);
        } else {
            // Final stop
            setTimeout(() => {
                el.style.display = "none";
                el.classList.add('hidden');
                cb();
            }, 300);
        }
    }

    requestAnimationFrame(spin);
}


function allPlayersHaveTwoStarts() {
    return (
        G.starts.north >= 2 &&
        G.starts.east  >= 2 &&
        G.starts.south >= 2 &&
        G.starts.west  >= 2
    );
}

$('rules-btn').addEventListener('click', () => {
    $('rules-modal').classList.remove('hidden');
});

$('rules-close').addEventListener('click', () => {
    $('rules-modal').classList.add('hidden');
});


$('scoreboard').addEventListener('click', () => {
    showGameDetails();
});

$('details-close').addEventListener('click', () => {
    $('details-modal').classList.add('hidden');
});


function showGameDetails() {

    const body = $('details-body');

    const dealer = G.dealer;
    const leader = G.leader;

    const usScore = G.sc.us;
    const themScore = G.sc.them;

    const usTricks = G.tw.us;
    const themTricks = G.tw.them;

    const trump = G.trump ? G.trump : "—";
    const hl = G.hl ? G.hl.toUpperCase() : "";

    const bid = G.hBid
        ? `${PN[G.hBid.player]} bid ${G.hBid.bid} in ${G.hBid.trump} (${G.hBid.hl})`
        : "No bids yet";

    body.innerHTML = `
        <div><b>Dealer:</b> ${PN[dealer]}</div>
        <div><b>Leader:</b> ${PN[leader]}</div>
        <hr>
        <div><b>Score:</b> You & North ${usScore} — ${themScore} East & West</div>
        <div><b>Tricks:</b> ${usTricks} — ${themTricks}</div>
        <hr>
        <div><b>Trump:</b> ${trump} ${hl}</div>
        <div><b>Bid:</b> ${bid}</div>
    `;

    $('details-modal').classList.remove('hidden');
}

// RUNNING History

function showHistory() {
    const body = $('history-body');
    body.innerHTML = "";

    if (G.history.length === 0) {
        body.innerHTML = "<div>No hands played yet.</div>";
    } else {
        G.history.forEach((h, i) => {
            const bidText = h.bid
                ? `${PN[h.bid.player]} bid ${h.bid.bid} in ${h.bid.trump} (${h.bid.hl})${h.bid.alone ? " alone" : ""}`
                : "No bid";

            body.innerHTML += `
                <div style="margin-bottom:12px;">
                    <b>Hand ${i+1}</b><br>
                    Dealer: ${PN[h.dealer]}<br>
                    Leader: ${PN[h.leader]}<br>
                    Bid: ${bidText}<br>
                    Tricks: Us ${h.tricks.us} — ${h.tricks.them}<br>
                    Score: Us ${h.score.us} — ${h.score.them}
                </div>
            `;
        });
    }

    $('history-modal').classList.remove('hidden');
}

$('history-close').addEventListener('click', () => {
    $('history-modal').classList.add('hidden');
});

$('scoreboard').addEventListener('click', showHistory);
