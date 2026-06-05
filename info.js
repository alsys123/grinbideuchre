/*

  Info modal
  
 */

function updateHelpDetail() {
    const frame = document.getElementById('rules-frame');
    const doc = frame.contentDocument || frame.contentWindow.document;

    const box = doc.getElementById('helpDetail');
    if (!box) return;

    const dealNumber = formatDealNumber(lastDealNumber);
    
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
  <li>Deal number: ${dealNumber}</li>

</ul>

  


    `;
}

$('rules-btn').addEventListener('click', () => {
    updateHelpDetail();
    $('rules-modal').classList.remove('hidden');
});

$('rules-close').addEventListener('click', () => {
    $('rules-modal').classList.add('hidden');
});
