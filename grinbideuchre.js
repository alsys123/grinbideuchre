

// ═══════════════════════════ BID EUCHRE — Google-Sites-safe ═════════════════════════


//const SUITS=['♠','♥','♦','♣'], RANKS=['9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
const RANKS=['J','Q','K','A'];

const RED=new Set(['♥','♦']);

let southSortMode = "base"; // "base" or "bid"

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
    firstHand: true,
    dealNumber: null,
    cards: {south:[],west:[],north:[],east:[]},
    exchangeHistory: []
//    exchangeDone: false
};

// how many hands have each player dealt
G.starts = { north:0, east:0, south:0, west:0 };
//G.starts = { north:2, east:2, south:2, west:2 }; //**** testing ONLY!

G.history = [];

let lastDealNumber = 0n;   // BigInt
let requestedDeal = null;  // null = random, BigInt = specific deal

let exch = null;

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


function legal(hand,led,t,hl){
    if(!led)
	return hand;
    const f=hand.filter(c=>esuit(c,t,hl)===led);
    return f.length?f:hand;
}

/*
  Deterministic dealing 
*/

function randomDealNumber() {
    const hi  = BigInt(Math.floor(Math.random() * 1000));
    const mid = BigInt(Math.floor(Math.random() * 100000));
    const lo  = BigInt(Math.floor(Math.random() * 1000000000));
    return hi * 100000000000000n + mid * 1000000000n + lo + 1n;
}

function formatDealNumber(n) {
    const s = n.toString().padStart(17, '0');
    return s.slice(0,3) + ' - ' + s.slice(3,8) + ' - ' + s.slice(8,17);
}

function parseDealNumber(str) {
    const cleaned = str.replace(/[\s\-]/g, '');
    if (!/^\d{1,17}$/.test(cleaned)) return null;
    return BigInt(cleaned);
}

function shuffleByDeal(deckArr, dealNumber) {
    if (!dealNumber || dealNumber === 0n) {
        dealNumber = randomDealNumber();
    }
    lastDealNumber = dealNumber;

    let n = dealNumber;
    const a = [...deckArr];
    const len = a.length;

    for (let i = len - 1; i > 0; i--) {
        const j = Number(n % BigInt(i + 1));
        n = n / BigInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


/*
 Dealing 
   */

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
    
    //    const dk=shuffle(deck());
    
    const dk = shuffleByDeal(deck(), requestedDeal);
    requestedDeal = null;   // reset to random after replay
    showDealNumber();


    G.dealNumber = formatDealNumber(lastDealNumber);
    
    //    PL.forEach((p,i)=>G.H[p]=dk.slice(i*6,i*6+6));
//    PL.forEach((p,i)=>G.H[p]=dk.slice(i*8,i*8+8));
    // Deal 8 cards to each player
    PL.forEach((p,i) => {
	G.H[p] = dk.slice(i*8, i*8+8);
    });
    
    // Store a deep copy of the full deck
//    G.cards = dk.map(c => ({ r:c.r, s:c.s, uid:c.uid }));
    G.cards = {
	south: G.H.south.map(c => ({...c})),
	west:  G.H.west.map(c => ({...c})),
	north: G.H.north.map(c => ({...c})),
	east:  G.H.east.map(c => ({...c}))
    };

    PL.forEach(p => sortBase(G.cards[p]));  // and now sort them


    // this is done in StartNewGame instead
    //    const di=PL.indexOf(G.dealer);
    //    G.leader=PL[(di+1)%4];
    
    renderHands(false);
    // setTimeout(startBid(),500);
    //    startBid();

    //!!! put this in later --- MAYBE!!!
    ////    setTimeout(() => {
    ////	speech("south",
    ////	       "Double‑click to re‑sort your hand, anytime",
    ////	       3500);
    ////    }, 800);
    
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

/* .. maybe for the future!!
   
function setExtraText(iPlayer,madeIt) {
    
    if (iPlayer === 'south' || iPlayer === 'north') {
	if (madeIt) return "You Made it!";
	else return "Sorry, you did not make it!";
    }
    
    if (iPlayer === 'east' || iPlayer === 'west') {
	if (madeIt) return "They made it!";
	else return "You beat them!";
    }

    // else
    return "";
}//setExtraText
*/
// SCORE
function scoreHand(){
    //    cLog("score: ", G);
    $('concedeBtn').style.display = 'none';
	
    G.phase='result';
    setWhoIsActive(null);
    hud();
    
    const h=G.hBid,bt=TEAMS[h.player],ot=bt==='us'?'them':'us';
    const btw=G.tw[bt],otw=G.tw[ot];
    
    let detail='';
    let pts = 0;
    
    // Lone hand?
    const isLone = h.alone === true;
    const ex = G.lastExchangeCount || 0;   // 0,1,2
    const lonePts = [24, 18, 12];

    let extra='';
    
    if (isLone) {
	// Lone hand scoring
	if (btw === 8) {
            // Made the lone hand
            pts = lonePts[ex];
            G.sc[bt] += pts;
            detail = PN[h.player] + " made a lone hand! +" + pts + " pts.";
//	    extra = setExtraText(PN[h.player], true);
	} else {
            // Failed lone hand
            pts = lonePts[ex];
            G.sc[bt] -= pts;
            detail = PN[h.player] + " failed the lone hand! −" + pts + " pts.";
//	    extra = setExtraText(PN[h.player], false);
	}
    } else {
	if(btw>=h.bid){
	    G.sc[bt]+=btw;
	    detail=PN[h.player]+"'s team made it! +"+btw+' pts.';
//	    extra = setExtraText(PN[h.player], true);
	}
	else{
	    G.sc[bt]-=h.bid;
	    detail=PN[h.player]+"'s team went set! \u2212"+h.bid+' pts.';
//	    extra = setExtraText(PN[h.player], false);
	}
	
    }
    
    G.sc[ot]+=otw;
    let title='Hand Complete';
 //   let extra='';

    /*
    if(G.sc.us>=32||G.sc.them>=32){
	if(G.sc.us>G.sc.them){
	    title='Victory!';
	    extra=' You & North win!';
	}else
	    if(G.sc.them>G.sc.us){
		title='They Won!';
		extra=' East & West win.';
	    }else{
		title='Tie Game!';
	    }
    }
*/
    //calc code
    let calc = "";
    // lone hand made
    if (isLone && btw === 8) {
	pts = lonePts[ex];
//	calc = `(✔️ 8 tricks → +${pts})`;
		calc = `(✅ 8 Tricks → +${pts})`;
/*
	calc = `(<span style="
color:#00ff00;
-webkit-text-fill-color:#00ff00;
font-size:1.4em;
font-weight:bold;
">✔</span> 8 Tricks →  ${pts} tricks)`;
		*/
    }
    //lone hand failed
    if (isLone && btw !== 8) {
	pts = lonePts[ex];
	calc = `(❌ failed lone → −${pts})`;
    }
    // normal hand
    if (!isLone && btw >= h.bid) {
		calc = `(✅ made it → +${btw})`;
/*
	calc = `(<span style="
color:#00ff00;
-webkit-text-fill-color:#00ff00;
font-size:1.4em;
font-weight:bold;
">✔</span> ${btw} tricks)`;
*/
    }
    // normal hand failed
    if (!isLone && btw < h.bid) {
	calc = `(❌set → −${h.bid})`;
    }

 //   cLog("history push -- before -- : ", G);
 //   cLog(" -- last lastExchangeCount: ", G.lastExchangeCount);
    
//    cLog("g.exchange.history: ", G.exchangeHistory);
    
    G.history.push({
	dealer: G.dealer,
	leader: G.leader,
	bid: G.hBid ? {
            player: G.hBid.player,
            bid: G.hBid.bid,
            trump: G.hBid.trump,
            hl: G.hBid.hl,
            alone: G.hBid.alone,
	    exchanges: G.lastExchangeCount || 0
	} : null,
	// ⭐ NEW: store all bids in seat order
	bids: {
            south: G.bids.south ? { ...G.bids.south } : null,
            west:  G.bids.west  ? { ...G.bids.west  } : null,
            north: G.bids.north ? { ...G.bids.north } : null,
            east:  G.bids.east  ? { ...G.bids.east  } : null
	},
	tricks: { us: G.tw.us, them: G.tw.them },
	score: { us: G.sc.us, them: G.sc.them },
	calc: calc,
	dealNumber: G.dealNumber,
	cards: {south: G.cards["south"],
		west:  G.cards["west"],
		north: G.cards["north"],
		east:  G.cards["east"]
	       },
	
	exchange: exch

    });

 //   cLog("history push -- after -- : ", G);
    
    $('result-title').textContent=title;
    $('result-detail').textContent=detail+extra;
    $('result-us').textContent=G.sc.us;
    $('result-them').textContent=G.sc.them;
    $('result-overlay').classList.remove('hidden');
    
    const di=PL.indexOf(G.dealer);
    G.dealer=PL[(di+1)%4];
    const btn=$('deal-again-btn');

    // we done saving this.  Clear for next time.
    G.lastExchangeCount = 0;
	exch = null;
    // Here we go to new game if done
    // all players have dealt twice.
    //    if(G.sc.us>=32||G.sc.them>=32){

//    cLog("Next Hand?",G.starts, allPlayersHaveTwoStarts() );
    
    if( allPlayersHaveTwoStarts() ){
	endGame();
    } else {
	btn.textContent='Deal Next Hand';
	btn.onclick=nextHand;
    }
    
    // might not need this.
    // Also, problem because G.lastExchangeCount has been cleared
    //   hud();
    
} //scoreHand

function showHistory() {
    const body = $('history-body');
    body.innerHTML = "";

    if (G.history.length === 0) {
        body.innerHTML = `<div style="text-align:center;
padding:32px 0;
color:#999;
font-style:italic;">No hands played yet.</div>`;
	
        $('history-modal').classList.remove('hidden');
	
        return;
    }

    let runUs = 0, runThem = 0;

    const rows = G.history.map((h, i) => {
        runUs   += h.score.us;
        runThem += h.score.them;

	//	cLog("history h=", i, h);
	
//-	const ex = h.bid?.exchanges || 0;
//-	const exText = ex ? ` · ${ex} exch` : "";

//-	const bidText = h.bid
//-	      ? `${PN[h.bid.player]} · ${h.bid.bid} ${h.bid.trump}${h.bid.alone ? " alone" : ""}${exText}`
//-	      : "No bid";
	
	//	???? .... here Use standard bid builder for text....
    const bidText =
	  buildBidText(
	      PN[h.bid.player],
	      h.bid.bid,
	      h.bid.hl,
	      h.bid.trump, h.bid.alone,
	      h.bid.exchanges
	  );

	
	const weSide   = `${h.tricks.us}   /  ${h.score.us}`;
	const themSide = `${h.tricks.them} /  ${h.score.them}`;
	
	// bid = dealer
	// tricks = bid - who and amount and suit
	// score  = We
	// hist-runnning = them
	const divString = `
            <div class="hist-row ${i % 2 === 0 ? 'even' : ''}">

              <div class="hist-hand">${i + 1}</div>
              <div class="hist-bid">${h.dealer}</div>
              <div class="hist-tricks">${bidText}</div>
              <div class="hist-calc">${h.calc}</div>

              <div class="hist-we">${weSide}</div>
              <div class="hist-them">${themSide}</div>

            </div>`;
	
        return divString;
	
    }).join('');

    body.innerHTML = `
        <div class="hist-table">
          <div class="hist-header">
            <div class="hist-hand">#</div>
            <div class="hist-bid">Dealer</div>
            <div class="hist-tricks">Bid</div>
            <div class="hist-calc">Results</div>
            <div class="hist-we">We  Total</div>
            <div class="hist-them">Them  Total</div>
          </div>
          ${rows}
        </div>`;

    $('history-modal').classList.remove('hidden');
    
} //showHistory


/*
// **** START OF TEST DATA

addSampleHistory();

// score is the running score total
function addSampleHistory() {
G.history.push(
{
dealer: "south",
leader: "west",
bid: { player: "north", bid: 5, trump: "♠", hl: "high", alone: false },
tricks: { us: 3, them: 2 },
score:  { us: 3, them: 2 },
calc: "not made"
},
{
dealer: "east",
leader: "south",
bid: { player: "east", bid: 8, trump: "♥", hl: "low", alone: true },
tricks: { us: 2, them: -8 },
score:  { us: 5, them: -6 },
calc: "not made"
}
);
}
// **** END OF TEST DATA
*/



$('deal-again-btn').addEventListener('click',deal);

//$('new-game-btn').addEventListener('click',deal);
$('new-game-btn').addEventListener('click', startNewGame);


function nextHand() {
    // this is more of a double check because
    // scoreHand will end the game
    if (allPlayersHaveTwoStarts()) {
        endGame();
    } else {
	//    deal();  called in startNewGame
        startNewGame();
    }
}

function randomLeader() {
    const i = Math.floor(Math.random() * 4);
    return PL[i]; // PL = ["north","east","south","west"]
}


function endGame() {

    $('concedeBtn').style.display = 'none';

    // Show final result overlay
    $('result-overlay').classList.remove('hidden');

    //    speech("north",
    //        "Game over — all players have started twice!",
    //        5000
    //    );

    $('deal-again-btn').classList.add('hidden');
    
    // Show the Play Again button
    const pb = $('play-again-btn');
    pb.classList.remove('hidden');

    $('result-title').textContent = "Game Over";
    if (G.sc.us > G.sc.them) {
	$('result-title').textContent += " - YOU WON!"; 
    }
    
    pb.onclick = () => {

        // Hide result overlay
        $('result-overlay').classList.add('hidden');
	$('result-title').textContent = "Hand complete";

         // Hide the button again for next time
         pb.classList.add('hidden');
         $('deal-again-btn').classList.remove('hidden');
	
         // Reset score
	 // ✅ ADD THESE TWO LINES:
	 G.sc = { us: 0, them: 0 };
	 G.starts = { north: 0, east: 0, south: 0, west: 0 };
	 G.firstHand = true;   // ← makes the spinner run again on hand 1
	 G.history = [];       // ← optional: clear history for fresh game
	
         // Reset game state
         startNewGame();

         // Show start screen
	 //   $('start-screen').classList.remove('hidden');
     };
}

//showStarterGraphic("south", ()=>{});

// player is next to bid -- dealer is to the right
function showStarterGraphic(player, cb) {
    //    return; // do not want his anymore
    
    // compute dealer = player to the right
    const i = PL.indexOf(player);
    const dealer = PL[(i + 3) % 4];   // right-hand player

    const el = $('starter-graphic');

    //    el.textContent = PN[player] + " starts!";
    if (PN[dealer] == "You") {
	el.textContent = "You are the dealer";
    } else {
	el.textContent = PN[dealer] + " is the dealer";
    }

    /* remove this display    
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
    */

    cb(); // just continue the bidding
    
}

// this is actually starting a new deal
// start new game AND start new hand

// ⭐ FIXED: Dealer/Leader rotation bug
// The dealer is advanced at the END of scoreHand().
// For subsequent hands, leader is simply 1 step left of dealer.
function startNewGame() {
    deal(); // deal resets hands

    let leader;
    let dealer;
    
    if (G.firstHand) {
	// Pick random leader for first hand
	leader = randomLeader();
	
//	leader = 'south'; //test
	
	G.leader = leader;
	G.firstHand = false;
	
	const i = PL.indexOf(leader); // first to bid
	dealer = PL[(i + 3) % 4];   // right-hand player (3 steps = 1 step left in reverse)
	
//	cLog("1st order: dealer:", dealer, " - leader: ", leader);

	G.dealer = dealer;
	
	let dealerLabel = "";
	if (dealer === "north") dealerLabel = "➡️ N";
	if (dealer === "south") dealerLabel = "➡️ S";
	if (dealer === "east" ) dealerLabel = "➡️ E";
	if (dealer === "west" ) dealerLabel = "➡️️ W";
	
	setTimeout(() => {
	    document.querySelector('.spinner-label.' +
				   dealer).textContent = dealerLabel;
	}, 1200);


	
	// Step 1: show spinner
	showStarterSpinner(leader, () => {
	    // Step 3: show reveal graphic
            showStarterGraphic(leader, () => {
		// Step 4: start bidding
		startBid();
            });
	});
	
    } else {
	// ⭐ FIX: For all later hands, dealer has ALREADY been advanced in scoreHand()
	// Leader is simply 1 step left of the current dealer
	const dealerIdx = PL.indexOf(G.dealer);
	leader = PL[(dealerIdx + 1) % 4];
	
	// Do NOT re-advance dealer — it was already done at end of previous hand
	// Just set leader based on current dealer

        showStarterGraphic(leader, () => startBid());
    }
    
    G.starts[G.dealer]++;
    G.leader = leader;
    
//    cLog("at end of startnewgame: dealer:", G.dealer, " - leader: ", G.leader);
    
} //startNewGame

/*
function startNewGame() {
    deal(); // deal resets hands

    let dealer, leader;

    if (G.firstHand) {
        // First hand: pick a random dealer
        dealer = randomLeader();   // better: rename to randomDealer()
        G.firstHand = false;
    } else {
        // Later hands: dealer moves one seat clockwise
        const dealerIdx = PL.indexOf(G.dealer);
        dealer = PL[(dealerIdx + 1) % 4];
    }

    // Leader is always left of dealer
    const di = PL.indexOf(dealer);
    leader = PL[(di + 1) % 4];

    G.dealer = dealer;
    G.leader = leader;
    G.starts[dealer]++;

    // Spinner label for dealer
    let dealerLabel = "";
    if (dealer === "north") dealerLabel = "➡️ N";
    if (dealer === "south") dealerLabel = "➡️ S";
    if (dealer === "east" ) dealerLabel = "➡️ E";
    if (dealer === "west" ) dealerLabel = "➡️️ W";

//    setTimeout(function () {
  //      document.querySelector('.spinner-label.' + dealer).textContent = dealerLabel;
   // }, 1200);
setTimeout(() => {
        document.querySelector('.spinner-label.' + dealer).textContent = dealerLabel;
}, 1200);
    
showStarterGraphic(leader, () => startBid());
    // Starter graphic + bidding
//    showStarterGraphic(leader, () {
  //      startBid();
      //});
}
*/
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
    const started =
	  G.starts.north >= 2 &&
          G.starts.east  >= 2 &&
          G.starts.south >= 2 &&
          G.starts.west  >= 2;

    return (started);
}



$('details-close').addEventListener('click', () => {
    $('details-modal').classList.add('hidden');
});


$('showScoreBoardHistory-btn').addEventListener('click', () => {
    showHistory();
});

/*
// ... here take this out with all the html and css .... !!!!
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
*/
// RUNNING History
/*
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
  <b>Hand ${i+1}</b>, Dealer: ${PN[h.dealer]}, Leader: ${PN[h.leader]}<br>
  Bid: ${bidText}<br>
  Tricks: Us ${h.tricks.us} — ${h.tricks.them}, 
  Score: Us ${h.score.us} — ${h.score.them}
  </div>
  `;
  });
  } */

$('history-close').addEventListener('click', () => {
    $('history-modal').classList.add('hidden');
});

$('scoreboard').addEventListener('click', showHistory);


