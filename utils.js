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

function italicize(str) {
    const map = {
        A:"𝐴", B:"𝐵", C:"𝐶", D:"𝐷", E:"𝐸", F:"𝐹", G:"𝐺",
        H:"𝐻", I:"𝐼", J:"𝐽", K:"𝐾", L:"𝐿", M:"𝑀", N:"𝑁",
        O:"𝑂", P:"𝑃", Q:"𝑄", R:"𝑅", S:"𝑆", T:"𝑇", U:"𝑈",
        V:"𝑉", W:"𝑊", X:"𝑋", Y:"𝑌", Z:"𝑍",
        a:"𝑎", b:"𝑏", c:"𝑐", d:"𝑑", e:"𝑒", f:"𝑓", g:"𝑔",
        h:"ℎ", i:"𝑖", j:"𝑗", k:"𝑘", l:"𝑙", m:"𝑚", n:"𝑛",
        o:"𝑜", p:"𝑝", q:"𝑞", r:"𝑟", s:"𝑠", t:"𝑡", u:"𝑢",
        v:"𝑣", w:"𝑤", x:"𝑥", y:"𝑦", z:"𝑧",
        0:"𝟎", 1:"𝟏", 2:"𝟐", 3:"𝟑", 4:"𝟒",
        5:"𝟓", 6:"𝟔", 7:"𝟕", 8:"𝟖", 9:"𝟗"
    };
    return str.replace(/[A-Za-z0-9]/g, c => map[c] || c);
}
