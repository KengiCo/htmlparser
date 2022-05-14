const readFile = require("fs").readFileSync;

// quando incontriamo tag apertura < controlliamo i 6 caratteri successivi,
// *** se "parse " comincia a registrare i caratteri che ci sono fino alla chiusura("/>" oppure ">")

// elaborare per la ricerca della chiusura includendo la logica delle virgolette

// pensare ad un modo per ignorare le virgolette o singole o doppie fino alla loro chiusura

// estrarre gli attributi dalla stringa registrata(la nostra variabile maybeAMeaningfulTag) - split per spazio e split per uguale(occhio alle virgolette)

// costruire l'oggetto json con la posizione iniziale e la posizione finale, e in qualche modo gli attributi all'interno di properties

// *** se "parse>"  cercare tag di chiusura "</parse>", non ci sono attributi

{
  /* <parse foo="dsf" baz="ci" > </parse> */
}


let switchObject = {
  "<parse>": "</parse>",
  "<parse ": " />",
  "'": "'",
  '"': '"',
};


const html = `<html>
<parse foo="dsf" ></parse> 
<parse property="foo" />
<div />
.style {
background-image: url('<parse property="foo" />');
}
</style>
<script>
const url = '<parse property="foo" />';
</script>
</html>`;

let resultFinal = [];

let generateResult = (string, from, to, attributes) => {
  let tag = {};
  tag.raw = string;
  tag.from = from;
  tag.to = to;
  tag.attributes = attributes;
  resultFinal.push(tag);
};

let stack = [];

let getAttributes = (string) => {
  let attrs = string.split(" ").filter((x) => x.includes("="));
  let result = {};
  for (attr of attrs) {
    let splitKeyValue = attr.split("=");
    if (splitKeyValue.length === 2) {
      result[splitKeyValue[0]] = splitKeyValue[1];
    }
  }
  return result;
};



let tempRaw = "";
let tempObj = {};
let amIrecording = false;
let opening = true;
let notInQuotes = true;
let notInComment = true;

const htmlParser = (html) => {

  const handleQuotes = (char) =>{
    if (char === `"` && stack[stack?.length -1] === `"`){
      stack.pop()
      notInQuotes = true
    }
    else if(char === `"` && stack[stack?.length -1] !== `"`){
      stack.push(char)
      notInQuotes = false
    }
    else if(char === `'` && stack[stack?.length -1] === `'`){
      stack.pop()
      notInQuotes = true
    }
    else if(char === `'` && stack[stack?.length -1] !== `'`){
      stack.push(char)
      notInQuotes = false
    }
  
  }

  let handleOpeningComments = (string) => {
    if (string === "<!--") {
      notInComment = false;
    }
  }

  let handleClosingComments = (string) => {
    if (string === "-->") {
      notInComment = true;
    }
  }

  for (let i = 0; i < html.length; i++) {
    let ch = html.substring(i , i + 7);
    const char = html[i];
    handleQuotes(char)

    if (char === "<"){
    handleOpeningComments(html.substring(i, i+5))
    }

    if (char === ">"){
      handleClosingComments(html.substring(i, i-3))
    }

    if (opening && notInQuotes && notInComment) {
      if (char === "<" && ch === "<parse>") {
        stack.push("</parse>");
        opening = false;
        amIrecording = true;
        tempObj.from = i;
      } else if (char === "<" && ch === "<parse ") {
        stack.push(" />");
        opening = false;
        amIrecording = true;
        tempObj.from = i;
      } else {
        continue;
      }
    }
    else if (!opening && notInQuotes && notInComment) {
      let co = html.substring(i - 6, i)
      if (html.substring(i - 7, i) === "</parse>" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, tempObj.from, i, attrs);
        tempRaw = "";
        tempObj = {};
      } else if (html.substring(i - 3, i) === " />" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, tempObj.from, i, attrs);
        tempRaw = "";
        tempObj = {};
      }
    } if (amIrecording) {
      tempRaw += char;
    }
  }
};

htmlParser(html);
console.log(resultFinal);
