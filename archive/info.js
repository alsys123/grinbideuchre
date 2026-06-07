/*

  Info modal
  
 */

function updateHelpDetail() {

    cLog("G: ",G);
    
    const box = document.getElementById('helpDetail');
    const gameDetailInfoId = document.getElementById('gameDetailInfo');
    
    if (!box) return;

    const bidList = buildBidList(G);

    box.innerHTML = `

 <ul style="margin-left:0; padding-left:16px; line-height:1.4;">
    <li>Dealer: ${PN[G.dealer]}</li>
    <li>Leader: ${PN[G.leader]}</li>
    <li>Winning Bid: ${G.hBid ? PN[G.hBid.player] : '—'}</li>
    <li>Trump: ${G.trump ? G.trump : '—'}</li>
    <li>High/Low call: ${G.hl}</li>
    <li>Score — Us: ${G.sc.us}, Them: ${G.sc.them}</li>
    <li>Tricks — Us: ${G.tw.us}, Them: ${G.tw.them}</li>
    <li>Last bid: ${G.hBid ? PN[G.hBid.player] + ' bid ' + G.hBid.bid : '—'}</li>
    <li>Dealer rotation — S:${G.starts.south}, W:${G.starts.west}, N:${G.starts.north}, E:${G.starts.east}</li>

    <li style="margin-top:10px;"><strong>Bids this hand:</strong></li>
    ${bidList}
    <li>Deal # ${G.dealNumber}</li>

 </ul>
    `;

    showHistoryInfo(gameDetailInfoId);
}//updateHelpDetail

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

function showHistoryInfo(gameDetailInfoId) {

    if (G.history.length === 0) {
        gameDetailInfoId.innerHTML =
            '<div style="text-align:center; padding:32px 0; color:#999; font-style:italic;">' +
            'No hands played yet.</div>';
        return;
    }

    const rows = buildHistoryRows();

    gameDetailInfoId.innerHTML =
        '<table class="hist-table">' +
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
}

function buildHistoryRows() {
    let html = "";

    for (let i = 0; i < G.history.length; i++) {
        const h = G.history[i];

        const ex = h.bid?.exchanges || 0;
        const exText = ex ? " · " + ex + " exch" : "";

        const bidText = h.bid
            ? PN[h.bid.player] + " · " + h.bid.bid + " " +
              h.bid.trump + (h.bid.alone ? " alone" : "") + exText
            : "No bid";

        const weSide   = h.tricks.us   + " / " + h.score.us;
        const themSide = h.tricks.them + " / " + h.score.them;

        // --- ROW 1: main summary ---
        html +=
            '<tr class="' + (i % 2 === 0 ? 'even' : 'odd') + '">' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + (PN[h.dealer] || h.dealer) + '</td>' +
                '<td>' + bidText + '</td>' +
                '<td>' + h.calc + '</td>' +
                '<td>' + weSide + '</td>' +
                '<td>' + themSide + '</td>' +
            '</tr>';
	

	    
	const BidList = buildBidListFromHistory(h);
	cLog("show h:",h, ", bid list: ", BidList);
	
	// --- ROW 2: deal number (always) ---
        html +=
            '<tr class="deal-num-row">' +
                '<td colspan="6" style="font-size:11px; color:var(--gold);' +
                'letter-spacing:1px; text-align:center; padding:2px 0;">' +
            'Deal # ' + h.dealNumber +
	    ', Leader: ' + PN[h.leader] +
	    ', Bid List: ' + BidList +
                '</td>' +
            '</tr>';
    }

    return html;
}

// New function to format bids from history
function buildBidListFromHistory(historyEntry) {
    if (!historyEntry.bids) return "No bids recorded";
    
    const order = [];
    const start = PL.indexOf(historyEntry.leader);
    for (let i = 0; i < 4; i++) {
        order.push(PL[(start + i) % 4]);
    }

    return order.map(p => {
        const b = historyEntry.bids[p];
        if (!b) return `${PN[p]}: —`;

        const parts = [];
        if (b.bid) parts.push(b.bid);
        if (b.trump) parts.push(b.trump);
        if (b.hl) parts.push(b.hl === 'high' ? 'High' : 'Low');
        if (b.alone) parts.push('Alone');

        return `${PN[p]}: ${parts.join(' ')}`;
    }).join(', ');
}

$('rules-btn').addEventListener('click', () => {
    updateHelpDetail();
    $('rules-modal').classList.remove('hidden');
});

$('rules-close').addEventListener('click', () => {
    $('rules-modal').classList.add('hidden');
});
