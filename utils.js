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

function partnerOf(p) {
    const idx = PL.indexOf(p);
    return PL[(idx + 2) % 4];
}

function prettyHandPlain(arr) {
       return arr
        .map(c => c.r + c.s + " (" + c.uid + ")")
        .join("  ");
}

function prettyHandHTML(arr) {
    return arr
        .map(c => {
            const red = (c.s === "♥" || c.s === "♦");
            const suit = red
                ? `<span style="color:red">${c.s}</span>`
                : c.s;

            return `${c.r}${suit} <span style="font-size:70%">(${c.uid})</span>`;
        })
        .join("  ");
}
