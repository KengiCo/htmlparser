const readFile = require("fs").readFileSync;

const html = `<html>
<parse foo="dsf" baz="uella" ></parse> 
<parse property="foo" ciao="orpo" />
<div />
"<parse prova="1" />"
<!-- <parse ciao="orpo" /> -->
.style {
background-image: url('<parse property="foo" />');
}
</style>
<script>
const url = '<parse property="foo" />';
</script>
</html>`;

let resultFinal = [];

let tag = {};

let stack = [];

let tempRaw = "";
let from;
let amIrecording = false;
let opening = true;
let notInQuotes = true;
let notInComment = true;

let generateResult = (string, from, to, attributes) => {
  tag.raw = string;
  tag.from = from;
  tag.to = to;
  tag.attributes = attributes;
  resultFinal.push(tag);
  tag = {};
};

let getAttributes = (string) => {
  let attrs = string.split(" ").filter((x) => x.includes("="));
  let result = {};
  for (attr of attrs) {
    let splitKeyValue = attr.split("=");
    if (splitKeyValue.length === 2) {
      result[splitKeyValue[0]] = splitKeyValue[1].substring(1 , splitKeyValue[1].length - 1);
    }
  }
  return result;
};

const htmlParser = (html) => {
  const handleQuotes = (char) => {
    if (char === `"` && stack[stack?.length - 1] === `"`) {
      stack.pop();
      notInQuotes = true;
    } else if (char === `"` && stack[stack?.length - 1] !== `"`) {
      stack.push(char);
      notInQuotes = false;
    } else if (char === `'` && stack[stack?.length - 1] === `'`) {
      stack.pop();
      notInQuotes = true;
    } else if (char === `'` && stack[stack?.length - 1] !== `'`) {
      stack.push(char);
      notInQuotes = false;
    }
  };

  let handleOpeningComments = (string) => {
    if (string === "<!--") {
      notInComment = false;
    }
  };

  let handleClosingComments = (string) => {
    if (string === "-->") {
      notInComment = true;
    }
  };

  for (let i = 0; i < html.length; i++) {
    let ch = html.substring(i, i + 5);
    const char = html[i];
    handleQuotes(char);

    if (char === "<") {
      handleOpeningComments(html.substring(i, i + 4));
    }

    if (char === ">") {
      handleClosingComments(html.substring(i - 2, 1 + 1));
    }

    if (opening && notInQuotes && notInComment) {
      if (char === "<" && html.substring(i, i + 7) === "<parse>") {
        stack.push("</parse>");
        opening = false;
        amIrecording = true;
        from = i;
      } else if (char === "<" && html.substring(i, i + 7) === "<parse ") {
        stack.push(" />");
        opening = false;
        amIrecording = true;
        from = i;
      } else {
        continue;
      }
    } else if (!opening && notInQuotes && notInComment) {
      let co = html.substring(i - 3, i + 1)
      if (html.substring(i - 7, i + 1) === "</parse>" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, from, i, attrs);
        tempRaw = "";
        continue;
      } else if (html.substring(i - 2, i + 1) === " />" && notInQuotes) {
        opening = true;
        stack.pop();
        tempRaw += char;
        let attrs = getAttributes(tempRaw);
        generateResult(tempRaw, from, i, attrs);
        tempRaw = "";
        continue;
      }
    }
    if (amIrecording) {
      tempRaw += char;
    }
  }
  return resultFinal
};

htmlParser(html);
console.log(resultFinal);
