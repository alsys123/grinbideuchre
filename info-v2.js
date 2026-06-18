

// *** info box



function populateInfoModal() {
    const box = $('info-content');
    box.innerHTML = "";

    box.innerHTML += header();
    
    // NAVIGATION BAR
    box.innerHTML += `
    <div class="info-nav">
   <button class="info-nav-btn" data-target="sec-overview">I Overview</button>
   <button class="info-nav-btn" data-target="sec-quickstart">II Quick Start</button>
   <button class="info-nav-btn" data-target="sec-section3Deck">III The Deck</button>
  <button class="info-nav-btn" data-target="sec-section4CardRanking">IV Card Ranking</button>
  <button class="info-nav-btn" data-target="sec-the-deal">V The Deal</button>

  <button class="info-nav-btn" data-target="sec-bidding">VI Biddding</button>
  <button class="info-nav-btn" data-target="sec-playing">VII Playing</button>
  <button class="info-nav-btn" data-target="sec-scoring">VIII Scoringl</button>
  <button class="info-nav-btn" data-target="sec-winning">IX Winning</button>


  <button class="info-nav-btn" data-target="sec-deterministic">X Game Tech</button>

   <button class="info-nav-btn" data-target="sec-handSummary"
           style="background:blue; border:1px solid #27ae60; color:white;">
      Hand Summary
    </button>

     </div>
    `;

    
    box.innerHTML += section1();
    box.innerHTML += section2QuickStart();
    box.innerHTML += section3Deck();
    box.innerHTML += section4CardRanking();
    box.innerHTML += section5TheDeal();
    box.innerHTML += section6Bidding();
    box.innerHTML += section7PlayingTheHand();
    box.innerHTML += section8Scoring();
    box.innerHTML += section9Winning();
    
    box.innerHTML += section10DeterministicDeals();
    
    box.innerHTML += sectionHandSummary();

    activateInfoNav();
    activateBackToTop();   // ⭐ add this
}

function header() {
    let html = "";
    html = `
     <div class="header">
	<div class="suit-row">
	  <span class="s">♠</span>
	  <span class="h red">♥</span>
	  <span class="d red">♦</span>
	  <span class="c">♣</span>
	</div>
	<h1>Bid Euchre<em>Official Rules & Other Info</em></h1>
	<p class="subtitle">4 Players · Partnership · High &amp; Low · Trick-Taking</p>

     <p class="subtitle">v1.07 Jun 18, 2026</p>

</div>

      `;
    return html;
}

// Overview
function section1() {
    const text = `
 <div class="info-section" id="sec-overview">
        <h2><span class="section-num">I</span> Overview</h2>

        <p>
          Bid Euchre is a partnership trick-taking game blending Euchre-style
          trump rules with competitive auction bidding. Players bid contracts
          specifying the number of tricks they'll win, a trump suit, No Trump high
          or No Trump low. The team that wins the bid then tries to fulfill — or
          exceed — their contract, while the defenders try to stop them.
        </p>

        <div class="overview-grid">
          <div class="overview-item">
            <strong>Players</strong>
            <span>4 (2 teams of 2; partners sit opposite)</span>
          </div>

          <div class="overview-item">
            <strong>Deck</strong>
            <span>2 standard Euchre decks, J–A only (32 cards)</span>
          </div>

          <div class="overview-item">
            <strong>Cards per Player</strong>
            <span>8 (all cards are dealt)</span>
          </div>

          <div class="overview-item">
            <strong>Game Length</strong>
            <span>Each player deals twice.</span>
          </div>
        </div>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>


      </div>
    `;

    return text;
} //section1

function sectionHandSummary() {
    let html = "";
    
    if (!G.hBid) {

	html = `
       <div class="info-section" id="sec-handSummary">
          <h3>No Information about the hand yet!</h3>
       `;
	
	html += `
      <div class="back-to-top" data-target="top">▲ Back to Top</div>
      </div>
       `;
    
	return html;
	
    }
    
    
    const bidList = buildBidList(G);

    const textBid =
	  buildBidText(
	      PN[G.hBid.player],
	      G.hBid.bid, G.hBid.hl, G.hBid.trump, G.hBid.alone,
	      //	      G.hBid.exchanges
	      G.lastExchangeCount
	  );

    
    
    
    
    html = `
    <div class="info-section" id="sec-handSummary">
        <h3>Hand Summary</h3>

        <ul style="margin-left:0; padding-left:16px; line-height:1.4;">
            <li>Dealer: ${PN[G.dealer]}</li>
            <li>Winning Bid: ${textBid}</li>
            <li>Tricks — Us: ${G.tw.us}, Them: ${G.tw.them}</li>
            <li>Score  — Us: ${G.sc.us}, Them: ${G.sc.them}</li>
  
             <li>Dealer rotation — S:${G.starts.south}, W:${G.starts.west}, N:${G.starts.north}, E:${G.starts.east}</li>

            <li><strong>Bids:</strong> ${bidList}</li>
            <li>Deal # ${G.dealNumber}</li>
        </ul>

    `;

    html += showHistoryInfo();

//    cLog("showHistoryInfo: ",html);
    
    html += `
      <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>

    `;
    
    return html;
}

/*
function buildBidList(G) {
    cLog("for b:");
    
    // Determine bidding order based on leader
    const start = PL.indexOf(G.leader);

    cLog("start: ",start);
    
    const order = [];
    for (let i = 0; i < 4; i++) {
        order.push(PL[(start + i) % 4]);
    }

    // Build HTML list items
    return order.map(p => {
        const b = G.bids[p];
        if (!b) return `<li>${PN[p]}: —</li>`;

        const parts = [];

        // amount
        parts.push(b.bid);

        // trump or NT
        if (b.trump) parts.push(b.trump);
        if (b.hl)    parts.push(b.hl === 'high' ? 'High' : 'Low');

        // alone?
        if (b.alone) parts.push('Alone');

        // card request
        if (b.cardReq) parts.push(`ask ${b.cardReq}`);

        return `<li>${PN[p]}: ${parts.join(' ')}</li>`;
    }).join('');
}
*/



function showHistoryInfo() {

//    cLog("showHistoryInfo");
    
    let html = "";
    
    if (G.history.length === 0) {
	
        html =
            '<div style="text-align:center; padding:32px 0; color:#999; font-style:italic;">' +
            'No hands played yet.</div>';
        return html;
    }

    const rows = buildHistoryRows();

    html = '<table class="hist-table">' +
        '<thead>' +
        '<tr>' +
        '<th>#</th>' +
        '<th>Dealer</th>' +
        '<th>Bid</th>' +
        '<th>Results</th>' +
        '<th>We</th>' +
        '<th>Them</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        rows +
        '</tbody>' +
        '</table>';

    
    return html;
} //showHistoryInfo

function buildHistoryRows() {
//    cLog("at 1");
    
    let html = "";
    
	
    for (let i = 0; i < G.history.length; i++) {
        const h = G.history[i];
	
//	cLog("history: ",h);

	const bidText = buildBidText(
	    PN[h.bid.player], h.bid.bid, h.bid.hl,
	    h.bid.trump, h.bid.alone, h.bid.exchanges
	);

//	cLog("data at h:", PN[h.bid.player], h.bid.bid, h.bid.hl,
//	     h.bid.trump, h.bid.alone, h.bid.exchanges);
	
//	cLog("at 2", bidText);

/*	    
       const ex = h.bid?.exchanges || 0;
        const exText = ex ? " · " + ex + " exch" : "";

        const bidText = h.bid
            ? PN[h.bid.player] + " · " + h.bid.bid + " " +
              h.bid.trump + (h.bid.alone ? " alone" : "") + exText
            : "No bid";
	*/
	
        const weSide   = h.tricks.us   + " / " + h.score.us;
        const themSide = h.tricks.them + " / " + h.score.them;

	
        // --- ROW 1: main summary ---
        html +=
            '<tr class="' + (i % 2 === 0 ? 'even' : 'odd') + '">' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + (PN[h.dealer] || h.dealer) + '</td>' +
            '<td>' + '<span style="font-size:12px">' + bidText + '</span></td>' +
            '<td>' + '<span style="font-size:12px">' + h.calc + '</span></td>' +
            '<td>' + weSide + '</td>' +
            '<td>' + themSide + '</td>' +
            '</tr>';
	

	let data = "";
	const BidList = buildBidListFromHistory(h);
//	cLog("show h:",h, ", bid list: ", BidList);
	
	// --- ROW 2: deal number (always) ---
        html +=
            '<tr class="deal-num-row">' +
                '<td colspan="6" style="font-size:11px; color:black;' +
                'letter-spacing:1px; text-align:center; padding:2px 0;">' +
            'Deal # ' + h.dealNumber +
//	    ', Leader: ' + PN[h.leader] +
	    ', Bid List: ' + BidList +
                '</td>' +
            '</tr>';
	
 //   cLog("at 3");
	
	data = 'South Hand: ' + prettyHandHTML(h.cards.south);
	html += addRow(data);

	data = 'West Hand :  ' + prettyHandHTML(h.cards.west);
	html += addRow(data);

	data = 'North Hand: ' + prettyHandHTML(h.cards.north);
	html += addRow(data);

	data = 'East Hand :  ' + prettyHandHTML(h.cards.east);
	html += addRow(data);
	
    if (h.exchange && h.exchange.count > 0) {

//	if (h.exchange.count > 0) {
	    html += addRow(" *** Exchanges Data");

	    cLog(" *** Exchange data: ",h.exchange);

	    /// ???... north and south as partners i think are the same NOW...??
	    
	    if (h.exchange.bidder === "north") {
		data = "Bidder is " + h.exchange.bidder + " and asks for: " +
		    h.exchange.count +
		    " card(s) from " + h.exchange.partner + ".";
		html += addRow(data);
		
		data = h.exchange.partner + " gives " + h.exchange.bidder + ": "+
		    prettyHandHTML(h.exchange.get);  // was give but not universal
		html += addRow(data);
		
		data = h.exchange.bidder + " puts down: " +
		    prettyHandHTML(h.exchange.partnerGives);
		html += addRow(data);
		
		data = h.exchange.partner + ' Hand: ' +
		    prettyHandHTML(h.exchange.southHandAfter);
		html += addRow(data);
		
		data = h.exchange.bidder + ' Hand: ' +
		    prettyHandHTML(h.exchange.northHandAfter);
		html += addRow(data);

	    } // north

	    if (h.exchange.bidder === "south") {
		data = "Bidder is " + h.exchange.bidder + " and asks for: " +
		    h.exchange.count +
		    " card(s) from " + h.exchange.partner + ".";
		html += addRow(data);
		
		data = "North gives South: " +
		    prettyHandHTML(h.exchange.get);
		html += addRow(data);
		
		data = "South puts down: " + prettyHandHTML(h.exchange.partnerGives);
		html += addRow(data);
		
		data = 'South Hand: ' + prettyHandHTML(h.exchange.southHandAfter);
		html += addRow(data);
		
		data = 'North Hand: ' + prettyHandHTML(h.exchange.northHandAfter);
		html += addRow(data);

	    } // south
	    
	}
	
    } // for loop of histories

//    cLog("at 4-buildHistoryRows:",html);

    return html;
    
} //buildHistoryRows

function addRow(data) {
    const rowHTML =
            '<tr class="deal-num-row">' +
          '<td colspan="6" ' +
          'style="font-size:11px; ' +
          '       font-family:courier; ' +
          '       color:black;' +
          '       letter-spacing:1px; ' +
          '       text-align:left; ' +
          '       padding:2px 0;">' +
          data  +
          '</td>' +
          '</tr>';

    return rowHTML;

}

function buildBidList(G) {
//    cLog("for b:");

    // Determine bidding order based on leader
//    const start = PL.indexOf(G.leader);
    const start = (PL.indexOf(G.dealer) + 1);
//    cLog("start: ", start);

    const order = [];
    for (let i = 0; i < 4; i++) {
        order.push(PL[(start + i) % 4]);
    }

    let html = "";

    for (let i = 0; i < order.length; i++) {
        const p = order[i];
        const b = G.bids[p];

        if (!b) {
	    const noBid = buildBidText(PN[p],0,null,null,null,null);
	    html += noBid + ",";
	    continue;
	};
 	
//	const textBid = buildBidText_v1(b.amt, b.trump, b.hl, b.alone, b.cardReq);
	const textBid = buildBidText(
	    PN[p],b.amt, b.hl, b.trump,
	    b.alone, b.cardReq);

//	if (!textBid) textBid = "na";
//        html += `<li>${PN[p]}: ${parts.join(" ")}</li>`;
  //      html += `${PN[p]}: ${parts.join(" ")}`;
//	html += `${PN[p]}: ` + textBid + ", ";
	html += textBid + ", ";
    }

 //   html += "</ul>";
    return html;
}

// New function to format bids from history
function buildBidListFromHistory(historyEntry) {
    if (!historyEntry.bids) return "No bids recorded";
    
    const order = [];
//    const start = PL.indexOf(historyEntry.leader);
    const start = (PL.indexOf(historyEntry.dealer) + 1 );
    for (let i = 0; i < 4; i++) {
        order.push(PL[(start + i) % 4]);
    }

    return order.map(p => {
        const b = historyEntry.bids[p];
//        if (!b) return `${PN[p]}: —`;
        if (!b) {
	    const noBid = buildBidText(PN[p],0,null,null,null,null);
	    return noBid;
	};

 //       const parts = [];
 //       if (b.bid) parts.push(b.bid);
 //       if (b.trump) parts.push(b.trump);
 //       if (b.hl) parts.push(b.hl === 'high' ? 'High' : 'Low');
 //       if (b.alone) parts.push('Alone');

 //       return `${PN[p]}: ${parts.join(' ')}`;
//	...
//	const textBid = buildBidText_v1(b.amt, b.trump, b.hl,
//					b.alone, b.exchanges);
	const textBid =
	      buildBidText(
		  PN[p],
		  b.amt, b.hl, b.trump,
		  b.alone, b.cardReq);  // was exchanges

//???? here i think...	h.bid.exchanges
	
//	return `${PN[p]}: ${textBid}`;
	return `${textBid}`;

    }).join(', ');
}


function activateInfoNav() {
    const btns = document.querySelectorAll('.info-nav-btn');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const el = document.getElementById(target);

            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
/*
function activateBackToTop() {
    const btns = document.querySelectorAll('.back-to-top');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const box = $('info-content');
            box.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    }
    */
function activateBackToTop() {
    const btns = document.querySelectorAll('.back-to-top');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const box = document.querySelector('.info-box');
            box.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}


function section2QuickStart() {
    return `
    <div class="info-section" id="sec-quickstart">

      <h3><span class="section-num">II</span> Quick Start</h3>

      <p>This section gives new players a fast overview of how a hand of Bid Euchre
      is played from deal to scoring.</p>

      <ol class="quickstart-list" style="margin-left:20px; color:var(--ink-light);">

        <li style="margin-bottom:6px">
          <strong>Deal the Cards</strong> — Each player receives 8 cards from the 32‑card deck.
        </li>

        <li style="margin-bottom:6px">
          <strong>Bid Once Around</strong> — Starting left of the dealer, each player may pass
          or make a higher bid. Highest bid wins the contract and chooses trump
          (or No Trump High/Low).
        </li>

        <li style="margin-bottom:6px">
          <strong>Lone Hand Option</strong> — The bidder may declare Alone and optionally
          exchange 1 or 2 cards with their partner before play begins.
        </li>

        <li style="margin-bottom:6px">
          <strong>Lead the First Trick</strong> — The winning bidder leads. In a Lone hand,
          the bidder still leads even though only three players are active.
        </li>

        <li style="margin-bottom:6px">
          <strong>Follow Suit</strong> — Players must follow the led suit if able.
          If not, they may play any card. The Left Bower always counts as part of
          the trump suit.
        </li>

        <li style="margin-bottom:6px">
          <strong>Determine the Trick Winner</strong> —
          <ul style="margin-left:20px; margin-top:4px; color:var(--ink-light)">
            <li><strong>Suit Bid:</strong> Highest trump wins; otherwise highest card of the led suit.</li>
            <li><strong>No Trump High:</strong> Highest card of the led suit.</li>
            <li><strong>No Trump Low:</strong> Lowest card of the led suit.</li>
          </ul>
        </li>

        <li style="margin-bottom:6px">
          <strong>Winner Leads Next</strong> — Continue until all 8 tricks are played.
        </li>

        <li style="margin-bottom:6px">
          <strong>Score the Hand</strong> —
          Bidding team scores the number of tricks they win (or loses their bid if short).
          Defenders score 1 point per trick. Lone bids and Moonshots use special scoring.
        </li>

      </ol>

      <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section3Deck() {
    return `
    <div class="info-section" id="sec-section3Deck">

        <h3><span class="section-num">III</span> The Deck</h3>

        <p>
            Combine two standard Euchre decks and remove all cards except
            Jacks, Queens, Kings, and Aces. This yields <strong>32 cards</strong> —
            8 per suit, with two identical copies of every card. This duplication
            creates a special rule throughout the game:
            <strong>when two identical cards are played in the same trick,
            the one played first outranks the second.</strong>
        </p>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section4CardRanking() {
    return `
    <div class="info-section" id="sec-section4CardRanking">

        <h3><span class="section-num">IV</span> Card Ranking</h3>

        <h4>High Trump (standard play)</h4>
        <p>
            Cards rank from highest to lowest and jacks of the same colour as trump
            play a special role:
        </p>

        <table>
            <thead>
                <tr><th>#</th><th>Card</th><th>Notes</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td class="rank-num">1</td>
                    <td><strong>Right Bowers</strong></td>
                    <td>Jack of the trump suit</td>
                </tr>
                <tr>
                    <td class="rank-num">2</td>
                    <td><strong>Left Bowers</strong></td>
                    <td>Jack of the other suit of the same color as trump</td>
                </tr>
                <tr><td class="rank-num">3</td><td>Aces of trump</td><td></td></tr>
                <tr><td class="rank-num">4</td><td>Kings of trump</td><td></td></tr>
                <tr><td class="rank-num">5</td><td>Queens of trump</td><td></td></tr>
            </tbody>
        </table>

        <div class="callout">
            The second bower, ace, king or queen played always loses to the first one played.
        </div>

        <div class="callout">
            <strong>Example — Hearts are trump:</strong>
            J♥ (Right) &gt; J♦ (Left) &gt; A♥ &gt; K♥ &gt; Q♥ &gt; remaining Hearts in order,
            first played beats second.
            <br><br>
            <strong>Example — No Trump is called:</strong>
            A♥ is played then K♥, then Q♥, then a second A♥ is played.
            The first A♥ wins the trick.
        </div>

        <h4>No Trump High</h4>
        <p>
            No trump suit exists. Within each suit, Aces rank highest:
            <strong>A &gt; K &gt; Q &gt; J</strong>.
            Highest card of the led suit wins. First-played duplicate wins.
        </p>

        <h4>Low No Trump</h4>
        <p>
            When Low is called the ranking completely reverses —
            the <em>lowest</em> card wins tricks, not the highest:
        </p>

        <table>
            <thead>
                <tr><th>#</th><th>Card</th><th>Notes</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td class="rank-num">1</td>
                    <td>Jack</td>
                    <td>Is the lowest, so jack wins the trick. There is no concept of bowers in No Trump.</td>
                </tr>
                <tr><td class="rank-num">2</td><td>Queen</td><td></td></tr>
                <tr><td class="rank-num">3</td><td>King</td><td></td></tr>
                <tr><td class="rank-num">4</td><td>Ace</td><td></td></tr>
            </tbody>
        </table>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section5TheDeal() {
    return `
    <div class="info-section" id="sec-the-deal">

        <h3><span class="section-num">V</span> The Deal</h3>

        <p>
            The dealer shuffles both decks together and deals all 32 cards clockwise,
            one at a time, until each player holds 8 cards. After each hand, the deal
            passes clockwise to the next player. A full game consists of each player
            dealing twice (8 hands total).
        </p>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section6Bidding() {
    return `
    <div class="info-section" id="sec-bidding">

        <h3><span class="section-num">VI</span> Bidding</h3>

        <p>
            Bidding starts with the player to the dealer's left and proceeds clockwise.
            Each player has exactly one opportunity to either <strong>pass</strong> or
            make a <strong>higher bid</strong> than any previous bid. The player who
            makes the highest bid wins the contract and leads the first trick.
        </p>

        <h4>Anatomy of a Bid</h4>
        <p>Every valid bid has one or more of these components:</p>

        <ol style="margin-left:20px; color: var(--ink-light);">
            <li style="margin-bottom:4px">
                <strong>Number of tricks</strong> — how many tricks the bidding team pledges
                to win (1 to 7)
            </li>

            <li style="margin-bottom:4px">
                <strong>Trump designation</strong> — one of the four suits, or No Trump
            </li>

            <li style="margin-bottom:4px">
                <strong>High or Low (for No Trump)</strong> — which card wins each trick
            </li>

            <li style="margin-bottom:4px">
                <strong>Going Alone</strong> — Ask for 2 cards, ask for 1 card, or ask for no cards
            </li>
        </ol>

        <div class="bid-examples">
            <span class="bid-tag">4 Clubs</span>
            <span class="bid-tag">5 No Trump High</span>
            <span class="bid-tag">6 Hearts</span>
            <span class="bid-tag">Alone in Spades</span>
            <span class="bid-tag">Alone in Hearts, ask 1</span>
            <span class="bid-tag">3 No Trump Low</span>
        </div>

        <h4>Raising the Bid</h4>
        <p>
            Each new bid must name <strong>more tricks</strong> than the current high bid.
            Suits carry no ranking — you cannot overcall with the same number of tricks in
            a different suit or mode.
        </p>

        <div class="callout">
            <strong>Example:</strong> If the current bid is "4 Hearts High," the next bidder
            must bid 5 or more tricks. Bids of "4 Spades" or "4 No Trump" are invalid.

            <div class="bid-examples" style="margin-top:10px">
                <span class="bid-tag">5 Clubs Low ✓</span>
                <span class="bid-tag">5 No Trump High ✓</span>
                <span class="bid-tag invalid">4 Spades High</span>
                <span class="bid-tag invalid">4 No Trump Low</span>
                <span class="bid-tag">Alone Ask for 1 card ✓</span>
            </div>
        </div>

        <h4>Lone Hand Bids</h4>
        <p>
            During bidding a player may go <strong>Alone</strong>, meaning the bidder's partner
            sits out the hand with cards face down.
        </p>

        <ul style="margin-left:20px; color:var(--ink-light)">
            <li style="margin-bottom:4px">
                A lone bid takes precedence over a numbered bid of 1 to 7 tricks.
                A lone bid means you will take all 8 tricks.
            </li>

            <li>
                Opponents or your partner can counter your bid if they bid a higher‑ranking
                lone hand.
            </li>

            <li>
                Shoot The Moon or Moonshot is the highest ranking bid and cannot be countered.
            </li>

            <li>
                A lone bid of a 2‑card ask can be countered with a 1‑card ask or a Moonshot.
            </li>

            <li>
                A lone bid of a 1‑card ask can be countered with a Moonshot only.
            </li>
        </ul>

        <h4>Partner Exchange (Lone Bids Only)</h4>
        <p>
            A lone bidder may optionally exchange cards with their sitting‑out partner before
            play begins:
        </p>

        <ul style="margin-left:20px; color:var(--ink-light)">
            <li style="margin-bottom:4px">
                <strong>1‑card exchange:</strong> Bidder discards 1 card face down; partner passes 1 card face down.
            </li>

            <li>
                <strong>2‑card exchange:</strong> Same process with 2 cards each.
            </li>
        </ul>

        <div class="callout warning">
            <strong>Critical:</strong> Both the bidder and partner must choose and commit
            to their exchange cards <em>simultaneously</em>, before either sees what the
            other has passed.
        </div>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section7PlayingTheHand() {
    return `
    <div class="info-section" id="sec-playing">

        <h3><span class="section-num">VII</span> Playing the Hand</h3>

        <h4>Opening Lead</h4>
        <p>
            The winning bidder leads the first trick. In a Lone hand, the bidder leads
            even though only three hands are active.
        </p>

        <h4>Following Suit</h4>
        <p>
            Each player <strong>must</strong> follow the led suit if able. If a player
            has no cards of the led suit, they may play any card — including trump.
            The Left Bower counts as a member of the <em>trump suit</em>, not its face suit,
            for both leading and following.
        </p>

        <h4>Winning a Trick</h4>
        <p>The winning card is determined by the game mode:</p>

        <table>
            <thead>
                <tr>
                    <th>Mode</th>
                    <th>Wins with trump played</th>
                    <th>Wins without trump played</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Suit Bid</strong></td>
                    <td>Highest trump played</td>
                    <td>Highest card of led suit</td>
                </tr>

                <tr>
                    <td><strong>High No Trump</strong></td>
                    <td>There is no trump</td>
                    <td>Highest card of led suit</td>
                </tr>

                <tr>
                    <td><strong>Low No Trump</strong></td>
                    <td>There is no trump</td>
                    <td>Lowest card of led suit</td>
                </tr>
            </tbody>
        </table>

        <p style="margin-top:10px">
            The winner of each trick leads the next hand.
            Play continues until all 8 tricks are complete.
        </p>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section8Scoring() {
    return `
    <div class="info-section" id="sec-scoring">

        <h3><span class="section-num">VIII</span> Scoring</h3>

        <h4>Bidding Team</h4>
        <p>
            If the bidding team wins <em>at least</em> as many tricks as they bid,
            they score the number of tricks actually won (not just the bid amount).
            If they fall short, they <em>lose</em> points equal to their bid.
        </p>

        <table>
            <thead>
                <tr><th>Bid</th><th>Tricks Won</th><th>Result</th></tr>
            </thead>
            <tbody>
                <tr><td>5</td><td>6</td><td class="score-positive">+6</td></tr>
                <tr><td>5</td><td>5</td><td class="score-positive">+5</td></tr>
                <tr><td>5</td><td>4</td><td class="score-negative">−5</td></tr>
            </tbody>
        </table>

        <h4>Defending Team</h4>
        <p>
            The non‑bidding team scores <strong>1 point for every trick they win</strong>,
            regardless of whether the bidding team succeeds or fails.
            This is also true when an opposing team member goes alone.
        </p>

        <h4>Lone Hand Scoring</h4>
        <p>In a lone hand you must win all 8 tricks.</p>

        <table>
            <thead>
                <tr><th>Contract</th><th>Outcome</th><th>Score</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Lone (Moonshot)</td>
                    <td>Success</td>
                    <td class="score-positive">24 points</td>
                </tr>

                <tr>
                    <td>Lone — asked for 1‑card</td>
                    <td>Success</td>
                    <td class="score-positive">18 points</td>
                </tr>

                <tr>
                    <td>Lone — asked for 2‑card</td>
                    <td>Success</td>
                    <td class="score-positive">12 points</td>
                </tr>

                <tr>
                    <td>Any lone bid</td>
                    <td>Failure</td>
                    <td class="score-negative">
                        Lose the point equivalent of the win (−24, −18, or −12)
                    </td>
                </tr>
            </tbody>
        </table>

        <h4>Shooting the Moon (MoonShot)</h4>
        <p>
            A bid of all 8 tricks — “Shoot the Moon” — is the highest possible contract.
            If successful alone, the bidder’s team scores 24 points.
            If the contract fails, the team loses 24 points.
        </p>
        <p>Defenders still score any tricks they manage to win.</p>

        <h4>Reneging</h4>

        <div class="callout warning">
            <strong>Special Note:</strong> The computer game checks to ensure all players
            follow suit. This rule applies only to non‑computer play.
        </div>

        <p>
            A renege occurs when a player fails to follow the led suit despite holding a card
            of that suit. Agree on the penalty before play begins. Common options:
        </p>

        <ul style="margin-left:20px; color:var(--ink-light)">
            <li style="margin-bottom:4px">
                Automatic set: the offending team loses their bid (or the hand is conceded to the defenders)
            </li>
            <li style="margin-bottom:4px">Deduct 3 points from the offending team</li>
            <li>Replay the hand</li>
        </ul>

        <div class="callout warning">
            <strong>House rule:</strong> Agree on reneging penalties before the first hand is dealt.
        </div>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}

function section9Winning() {
    return `
    <div class="info-section" id="sec-winning">

        <h3><span class="section-num">IX</span> Winning the Game</h3>

        <p>
            The game ends when <strong>each player has dealt twice</strong> (8 hands).
            The team with the higher score at the end of the game wins.
        </p>

        <div class="callout warning">
            <strong>In case of a tie:</strong>
            Play one additional hand as a tiebreaker.
            <em>Only for non‑computer play.</em>
        </div>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}


function section10DeterministicDeals() {
    return `
    <div class="info-section" id="sec-deterministic">

        <h3><span class="section-num">X</span> Game Tech</h3>

        <p><strong>Number of Possible Deals:</strong>
            A double–deck JQKA game has an enormous number of possible card combinations —
            far beyond what a human could ever encounter naturally.
            Even with only four ranks and four suits, the number of unique 8‑card hands
            dealt to four players is measured in <em>quintillions</em> (that's a 1
            followed by 18 zeros).
            This means that almost every deal you see is effectively unique in the
            lifetime of the universe.
        </p>

        <p><strong>What "Quintillions" Means:</strong>
            If you played one new deal every second, nonstop, it would take millions of years
            to see even a tiny fraction of all possible combinations.
            In practical terms: no two games will ever be the same unless you intentionally
            replay one.
        </p>

        <p><strong>How This Game Generates Deals:</strong>
            This implementation uses a deterministic deal generator.
            Each deal is produced from a 17‑digit number called the
            <strong>Deal Number</strong>.
            The same deal number will always produce the exact same shuffle,
            the same hands, the same dealer, and the same starting conditions.
        </p>

        <p><strong>Replaying a Deal:</strong>
            You can replay any specific hand by entering its deal number into the Replay box.
            This allows you to revisit interesting hands, study strategy,
            or share a deal with someone else so they can play the exact same cards.
        </p>

        <p><strong>Copying the Deal Number:</strong>
            Click the deal number at the top of the screen to copy it.
            You can paste it into the Replay box at any time to reproduce that exact hand.
        </p>

        <h4>Developer Backdoors</h4>

        <p>
            This implementation includes two hidden developer backdoors.
            They are not part of normal gameplay, but they are extremely useful for
            testing, debugging, and verifying deterministic behavior.
        </p>

        <h4>1. View All Hands (5‑Tap Backdoor)</h4>
        <p>
            There is an invisible 40×40 pixel hotspot at the top of the screen.
            Tapping it five times reveals all four players' cards.
            This is used for debugging AI behavior, validating trick logic,
            and confirming that the shuffle and deal generator are working correctly.
        </p>
        <p>
            The backdoor does not affect gameplay logic — it only reveals information
            that is normally hidden.
        </p>

        <h4>2. Deal Number Reveal & Replay</h4>
        <p>
            Another backdoor just to the right of the reveal backdoor
            reveals the current <strong>Deal Number</strong> and
            the <strong>Replay Box</strong>.
            Every deal in this game is generated deterministically from a 17‑digit number.
            This means:
        </p>

        
          <ul style="margin-left:20px; color:var(--ink-light)">
            <li>The same deal number always produces the exact same shuffle</li>
            <li>You can replay any specific hand by entering its deal number</li>
            <li>You can share a deal number with someone else and they will get
                the identical hand</li>
            <li>
                Example: <code>163 - 51530 - 379312803</code>  
                Entering this loads that exact game.
            </li>
            <li>
                Example: <code>718 - 76501 - 046555253N</code>  
                The trailing <strong>N</strong> sets the dealer to North.
                Use E, W, S, N to set East, West, South, or North as the dealer.
            </li>
        </ul>

        <p>
            This is essential for debugging, regression testing, and reproducing rare or
            interesting hands.
            It also allows developers to verify that the AI behaves consistently across
            identical game states.
        </p>

        <h4>Scale of the Deal Numbers (fun fact!)</h4>

        <p>The size of the deal number gives a sense of how vast the space of possible
           games is:</p>

        <ul style="margin-left:20px; color:var(--ink-light)">
            <li>
                <strong>9 digits</strong> — 1 billion<br>
                &nbsp;&nbsp;• roughly the world's population<br>
                &nbsp;&nbsp;• every deal you could play once a second for about 31 years
            </li>

            <li style="margin-top:0.5em;">
                <strong>14 digits</strong> — 100 trillion<br>
                &nbsp;&nbsp;• about 100,000,000,000,000<br>
                &nbsp;&nbsp;• roughly every second since the Big Bang × 3000
            </li>

            <li style="margin-top:0.5em;">
                <strong>17 digits</strong> — 100 quadrillion<br>
                &nbsp;&nbsp;• 100,000,000,000,000,000<br>
                &nbsp;&nbsp;• more than all the deals that practically exist in this game
            </li>
        </ul>

        <p style="margin-top:0.75em;">
            Overall, this implementation spans on the order of
            <strong>30 quadrillion</strong> distinct deal possibilities.
            Almost every hand you see is effectively unique.
        </p>

        <h4>Why These Backdoors Exist</h4>
        <p>
            Card games with hidden information are notoriously difficult to debug.
            These tools allow developers to:
        </p>

        <ul style="margin-left:20px; color:var(--ink-light)">
            <li>Inspect all hands to verify trick‑taking logic</li>
            <li>Reproduce bugs by replaying the exact same deal</li>
            <li>Test AI decisions with full visibility</li>
            <li>Confirm that the deterministic shuffle is stable across browsers
                and devices</li>
        </ul>

        <p>
            These features are invisible to normal players and do not affect scoring,
            shuffling, or gameplay integrity.
        </p>

        <div class="back-to-top" data-target="top">▲ Back to Top</div>

    </div>
    `;
}


$('info-close').addEventListener('click', () => {
    $('info-modal').classList.add('hidden');
});

$('info-btn').addEventListener('click', () => {
    populateInfoModal();
    $('info-modal').classList.remove('hidden');
});
