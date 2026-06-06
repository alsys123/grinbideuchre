/*

  Info modal
  
 */

function updateHelpDetail() {

    cLog("G: ",G);
    
    const frame = document.getElementById('rules-frame');
    const doc = frame.contentDocument || frame.contentWindow.document;

    const box = doc.getElementById('helpDetail');
    
    const gameDetailInfoId = doc.getElementById('gameDetailInfo');
    
    if (!box) return;

    const bidList = buildBidList(G);

 //   const dealNumber = formatDealNumber(lastDealNumber);
    
    box.innerHTML = `

 <ul style="margin-left:0; padding-left:16px; line-height:1.4;">
    <li>Dealer: ${PN[G.dealer]}</li>
    <li>Leader: ${PN[G.leader]}</li>
<li>Winning Bid: ${PN[G.hBid.player]}</li>
    <li>Trump: ${G.trump ? G.trump : '—'}</li>
    <li>High/Low call: ${G.hl}</li>
    <li>Score — Us: ${G.sc.us}, Them: ${G.sc.them}</li>
    <li>Tricks — Us: ${G.tw.us}, Them: ${G.tw.them}</li>
    <li>Last bid: ${G.hBid ? PN[G.hBid.player] + ' bid ' + G.hBid.bid : '—'}</li>
    <li>Dealer rotation — S:${G.starts.south}, W:${G.starts.west}, N:${G.starts.north}, E:${G.starts.east}</li>

<li style="margin-top:10px;"><strong>Bids this hand:</strong></li>
    ${bidList}
<li>Deal # ${formatDealNumber(G.dealNumber)}</li

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
        if (!b) return `${PN[p]}: —`;

        const parts = [];

        // amount
        parts.push(b.amt);

        // trump or NT
        if (b.trump) parts.push(b.trump);
        if (b.hl)    parts.push(b.hl === 'H' ? 'High' : 'Low');

        // alone?
        if (b.alone) parts.push('Alone');

        // card request
        if (b.cardReq) parts.push(`Req ${b.cardReq}`);

        return `${PN[p]}: ${parts.join(' ')}`;
    }).join(', ');
}

/*
function showHistoryInfo(gameDetailInfoId) {

    gameDetailInfoId.innerHTML = "";

    if (G.history.length === 0) {
        gameDetailInfoId.innerHTML = `<div style="text-align:center;
            padding:32px 0; color:#999; font-style:italic;">
            No hands played yet.</div>`;
        return;
    }

    let runUs = 0, runThem = 0;

    const rows = G.history.map((h, i) => {
        runUs   += h.score.us;
        runThem += h.score.them;

        const ex = h.bid?.exchanges || 0;
        const exText = ex ? ` · ${ex} exch` : "";

        const bidText = h.bid
            ? `${PN[h.bid.player]} · ${h.bid.bid} ${h.bid.trump}${h.bid.alone ? " alone" : ""}${exText}`
            : "No bid";

        const weSide   = `${h.tricks.us} / ${h.score.us}`;
        const themSide = `${h.tricks.them} / ${h.score.them}`;

        // Deal number on row 2 — only show if recorded
        const dealLine = (i === 0 && h.dealNumber)
            ? `<tr class="deal-num-row">
                 <td colspan="6" style="font-size:11px; color:var(--gold);
                     letter-spacing:1px; text-align:center; padding:2px 0;">
                   Deal # ${formatDealNumber(h.dealNumber)}
                 </td>
               </tr>`
            : '';

        return `
            ${dealLine}
            <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
                <td>${i + 1}</td>
                <td>${PN[h.dealer] ?? h.dealer}</td>
                <td>${bidText}</td>
                <td>${h.calc}</td>
                <td>${weSide}</td>
                <td>${themSide}</td>
            </tr>
         <tr>Deal number: ${G.dealNumber}, Leader = ${G.leader}</tr>
     `;

    }).join('');

    gameDetailInfoId.innerHTML = `
        <table class="hist-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Dealer</th>
                    <th>Bid</th>
                    <th>Results</th>
                    <th>We</th>
                    <th>Them</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>`;
}
*/
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
/*
function buildHistoryRows() {
    let html = "";
    let runUs = 0, runThem = 0;

    for (let i = 0; i < G.history.length; i++) {
        const h = G.history[i];

        runUs   += h.score.us;
        runThem += h.score.them;

        const ex = h.bid?.exchanges || 0;
        const exText = ex ? " · " + ex + " exch" : "";

        const bidText = h.bid
            ? PN[h.bid.player] + " · " + h.bid.bid + " " +
              h.bid.trump + (h.bid.alone ? " alone" : "") + exText
            : "No bid";

        const weSide   = h.tricks.us   + " / " + h.score.us;
        const themSide = h.tricks.them + " / " + h.score.them;

        // Optional deal number row
        if (i === 0 && h.dealNumber) {
            html +=
                '<tr class="deal-num-row">' +
                '<td colspan="6" style="font-size:11px; color:var(--gold);' +
                'letter-spacing:1px; text-align:center; padding:2px 0;">' +
                'Deal # ' + formatDealNumber(h.dealNumber) +
                '</td></tr>';
        }

        html +=
            '<tr class="' + (i % 2 === 0 ? 'even' : 'odd') + '">' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + (PN[h.dealer] || h.dealer) + '</td>' +
                '<td>' + bidText + '</td>' +
                '<td>' + h.calc + '</td>' +
                '<td>' + weSide + '</td>' +
                '<td>' + themSide + '</td>' +
            '</tr>';
    }

    return html;
} */
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
	

	    
	const BidList = buildBidList(h);
	cLog("show h:",h, ", bid list: ", BidList);
	
	// --- ROW 2: deal number (always) ---
        html +=
            '<tr class="deal-num-row">' +
                '<td colspan="6" style="font-size:11px; color:var(--gold);' +
                'letter-spacing:1px; text-align:center; padding:2px 0;">' +
            'Deal # ' + formatDealNumber(h.dealNumber) +
	    ', Leader: ' + PN[h.leader] +
	    ', Bid List: ', BidList +
                '</td>' +
            '</tr>';
    }

    return html;
}

$('rules-btn').addEventListener('click', () => {
    updateHelpDetail();
    $('rules-modal').classList.remove('hidden');
});

$('rules-close').addEventListener('click', () => {
    $('rules-modal').classList.add('hidden');
});
