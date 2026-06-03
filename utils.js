/*
Utils
  */

let msgT=null;

function msg(t,d=2400){

//    cLog("got a message: ",t);
    
    const e=$('message');
    e.textContent=t;
    e.classList.remove('hidden');
    clearTimeout(msgT);
    msgT=setTimeout(()=>e.classList.add('hidden'),d);

}

function dei(Element) {
    const Id = document.getElementById(Element);
    return Id;
} //dei


function cLog(...text) {
    console.log(...text);
}

function $(i){
    return document.getElementById(i);
}

/*
function cid(c){
    return c.r + c.s;   // "9♣"
    }
    */
function cid(card) {
    return card.uid;
}
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
/*
function updateHelpDetail() {
    const el = document.getElementById('helpDetail');
    if (!el) return;

    el.innerHTML = `
        <h3>Current Game State</h3>

        <p><strong>Dealer:</strong> ${G.dealer} (${PN[G.dealer]})</p>
        <p><strong>Leader:</strong> ${G.leader} (${PN[G.leader]})</p>
        <p><strong>Trump:</strong> ${G.trump ? G.trump : '—'}</p>
        <p><strong>High/Low:</strong> ${G.hl}</p>

        <h4>Score</h4>
        <p>Us: ${G.sc.us} &nbsp;&nbsp; Them: ${G.sc.them}</p>

        <h4>Tricks Taken</h4>
        <p>Us: ${G.tw.us} &nbsp;&nbsp; Them: ${G.tw.them}</p>

        <h4>Last Bid</h4>
        <p>${G.hBid ? PN[G.hBid.player] + ' bid ' + G.hBid.bid : '—'}</p>

        <h4>Starts (Dealer Rotation)</h4>
        <p>
            South: ${G.starts.south} &nbsp;&nbsp;
            West: ${G.starts.west} &nbsp;&nbsp;
            North: ${G.starts.north} &nbsp;&nbsp;
            East: ${G.starts.east}
        </p>
    `;
    }
    */
