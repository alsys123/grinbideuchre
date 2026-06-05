/*

  Info modal
  
 */

function updateHelpDetail() {
    const frame = document.getElementById('rules-frame');
    const doc = frame.contentDocument || frame.contentWindow.document;

    const box = doc.getElementById('helpDetail');
    
    const gameDetailInfoId = doc.getElementById('gameDetailInfo');
    
    if (!box) return;

 //   const dealNumber = formatDealNumber(lastDealNumber);
    
    box.innerHTML = `

 <ul style="margin-left:0; padding-left:16px; line-height:1.4;">
    <li>Dealer: ${PN[G.dealer]}</li>
    <li>Leader: ${PN[G.leader]}</li>
    <li>Trump: ${G.trump ? G.trump : '—'}</li>
    <li>High/Low call: ${G.hl}</li>
    <li>Score — Us: ${G.sc.us}, Them: ${G.sc.them}</li>
    <li>Tricks — Us: ${G.tw.us}, Them: ${G.tw.them}</li>
    <li>Last bid: ${G.hBid ? PN[G.hBid.player] + ' bid ' + G.hBid.bid : '—'}</li>
    <li>Dealer rotation — S:${G.starts.south}, W:${G.starts.west}, N:${G.starts.north}, E:${G.starts.east}</li>
  <li>Deal number: ${G.dealNumber}</li>

</ul>

  


    `;

    showHistoryInfo(gameDetailInfoId);
}//updateHelpDetail




function showHistoryInfo(gameDetailInfoId) {

    gameDetailInfoId.innerHTML = "";

    if (G.history.length === 0) {
        gameDetailInfoId.innerHTML = `<div style="text-align:center;
padding:32px 0;
color:#999;
font-style:italic;">No hands played yet.</div>`;
	
    //    $('history-modal').classList.remove('hidden');
	
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
	
	const weSide   = `${h.tricks.us}   /  ${h.score.us}`;
	const themSide = `${h.tricks.them} /  ${h.score.them}`;
	
	// bid = dealer
	// tricks = bid - who and amount and suit
	// score  = We
	// hist-runnning = them
	const divString = `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
              <td>${i + 1}</td
              <td>${h.dealer}</td
              <td>${bidText}</td
              <td>${h.calc}</td

              <td>${weSide}</td
              <td>${themSide}</td

            </tr>`;
	
        return divString;
	
    }).join('');
    /*
 <div class="hist-table">
          <div class="hist-header">
            <div class="hist-hand">#</div>
            <div class="hist-bid">Dealer</div>
            <div class="hist-tricks">Bid</div>
            <div class="hist-calc">Results</div>
            <div class="hist-we">We  Total</div>
            <div class="hist-them">Them  Total</div>
          </div>
     */
 /*   
    gameDetailInfoId.innerHTML = `
<ul style="margin-left:0; padding-left:16px; line-height:1.4;">
       
          ${rows}
        </ul`;

//    $('history-modal').classList.remove('hidden');

*/
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
  </table>
`;
    
}


$('rules-btn').addEventListener('click', () => {
    updateHelpDetail();
    $('rules-modal').classList.remove('hidden');
});

$('rules-close').addEventListener('click', () => {
    $('rules-modal').classList.add('hidden');
});
