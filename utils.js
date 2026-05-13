/*
Utils
  */

let msgT=null;

function msg(t,d=2400){

    cLog("got a message: ",t);
    
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

