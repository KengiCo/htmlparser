const readFile = require("fs").readFileSync;

// quando incontriamo tag apertura < controlliamo i 6 caratteri successivi,
// *** se "parse " comincia a registrare i caratteri che ci sono fino alla chiusura("/>" oppure ">")

// elaborare per la ricerca della chiusura includendo la logica delle virgolette

// pensare ad un modo per ignorare le virgolette o singole o doppie fino alla loro chiusura

// estrarre gli attributi dalla stringa registrata(la nostra variabile maybeAMeaningfulTag) - split per spazio e split per uguale(occhio alle virgolette)

// costruire l'oggetto json con la posizione iniziale e la posizione finale, e in qualche modo gli attributi all'interno di properties

// *** se "parse>"  cercare tag di chiusura "</parse>", non ci sono attributi


{/* <parse foo="dsf" baz="ci" > </parse> */}
const html = `<html><style>

<div />
<parse property="foo" />
.style {
background-image: url('<parse property="foo" />');
}
</style>
<script>
const url = '<parse property="foo" />';
</script>
</html>`;

let result = [];

let generateResult = (string, from, to, attributes) => {
  let tag = {};
  tag.raw = string;
  tag.from = from;
  tag.to = to;
  tag.attributes = attributes;
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

let switchObject = {
  "<parse>": "</parse>",
  "<parse ": " />",
  "'": "'",
  '"': '"',
};

let tempRaw = "";
let tempObj = {};
let amIrecording = false;
let opening = true;
let notInQuotes = true;

const htmlParser = (html) => {
  for (let i = 0; i < html.length; i++) {
    // let ch = html.slice(i, i + 7);
    const char = html[i];

    if (opening) {
      if (char === "'") {
        stack.push(char);
        opening = false;
        notInQuotes = false;
      } else if (char === '"') {
        stack.push(char);
        opening = false;
        notInQuotes = false;
      } else if (html.slice(i, i + 6) === "<parse>") {
        stack.push("</parse>");
        opening = false;
        amIrecording = true;
        tempObj.from = i;
        tempRaw += char;
      } else if (html.slice(i, i + 6) === "<parse ") {
        stack.push(" />");
        opening = false;
        amIrecording = true;
        tempObj.from = i;
        tempRaw += char;
      } else {
        continue;
      }
    }
    if (!opening) {
      if (stack[stack.length - 1] === "'" && char === "'") {
        opening = true;
        stack.pop();
        notInQuotes = true;
      } else if (stack[stack.length - 1] === '"' && char === '"') {
        opening = true;
        stack.pop();
        notInQuotes = true;
      } else if (html.slice?.[(i - 7, i + 1)] === "</parse>" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, tempObj.from, i, attrs);
        tempRaw = "";
        tempObj = {};
      } else if (html.slice?.[(i - 3, i + 1)] === " />" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, tempObj.from, i, attrs);
        tempRaw = "";
        tempObj = {};
      } else if (notInQuotes) {
        tempRaw += char;
      }
    }
  }
};

htmlParser(html);
console.log(result)