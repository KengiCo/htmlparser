const readFile = require("fs").readFileSync;
{
  /* <div />
"<parse prova="1" />" */
}
// const url = '<parse property="nono" />';

const html = `<html>
<parse foo="dsf" baz="uella" ><parse prova="1" /></parse> 
<!-- <parse ciao="nonono" /> -->
<style>
<parse foo="dsf" baz="uella" />
bacground-image: url('<parse property="foo" />k');
"</style>"
<parse property="scripnono" ciao="nono" />
</style>
<script>
<parse property="stylenono" ciao="nono" />
</script>
'<parse property="si" ciao="sisi" />'
<parse>"<parse property="dsggfs" ciao="nononono" />"</parse> 
</html>
.style {
  
}
`;

let resultFinal = [];

let tag = {};

let stack = [];

let last = stack.at(-1)

let tempRaw = "";
let attrs = "";
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
      result[splitKeyValue[0]] = splitKeyValue[1].substring(
        1,
        splitKeyValue[1].length - 1
      );
    }
  }
  return result;
};

const htmlParser = (html) => {
  const handleQuotes = (char, i) => {
    if (char === `"` && stack[stack.length - 1] === `"`) {
      stack.pop();
      if (
        stack[stack.length - 1] !== `"` &&
        stack[stack.length - 1] !== `'` &&
        stack[stack.length - 1] !== "</style>" &&
        stack[stack.length - 1] !== "</script>"
      ) {
        notInQuotes = true;
      }
    } else if (char === `"` && stack[stack.length - 1] !== `"`) {
      stack.push(char);
      notInQuotes = false;
    } else if (char === `'` && stack[stack?.length - 1] === `'`) {
      stack.pop();
      if (
        stack[stack.length - 1] !== `"` &&
        stack[stack.length - 1] !== `'` &&
        stack[stack.length - 1] !== "</style>" &&
        stack[stack.length - 1] !== "</script>"
      ) {
        notInQuotes = true;
      }
    } else if (char === `'` && stack[stack?.length - 1] !== `'`) {
      stack.push(char);
      notInQuotes = false;
    }
    if (
      html.substring(i - 8, i + 1) === `</script>` &&
      stack[stack?.length - 1] === `</script>` &&
      stack[stack.length - 1] !== "'" &&
      stack[stack.length - 1] !== `"`
    ) {
      stack.pop();
      notInQuotes = true;
    } else if (html.substring(i, i + 8) === "<script>") {
      stack.push(`</script>`);
      notInQuotes = false;
    } else if (
      html.substring(i - 7, i + 1) === `</style>` &&
      stack[stack?.length - 1] === `</style>` &&
      stack[stack.length - 1] !== "'" &&
      stack[stack.length - 1] !== `"`
    ) {
      stack.pop();
      notInQuotes = true;
    } else if (html.substring(i, i + 7) === `<style>`) {
      stack.push(`</style>`);
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
    handleQuotes(char, i);

    if (char === "<") {
      handleOpeningComments(html.substring(i, i + 4));
    }

    if (char === ">") {
      handleClosingComments(html.substring(i - 2, i + 1));
    }

    if (opening && notInQuotes && notInComment) {
      if (char === "<" && html.substring(i, i + 7) === "<parse>") {
        stack.push("</parse>");
        opening = false;
        amIrecording = true;
        from = i;
      } else if (char === "<" && html.substring(i, i + 7) === "<parse ") {
        stack.push(">");
        opening = false;
        amIrecording = true;
        from = i;
      } else {
        continue;
      }
    } else if (!opening && notInQuotes && notInComment) {
      let co = html.substring(i - 3, i + 1);
      if (
        html.substring(i - 7, i + 1) === stack[stack.length - 1] &&
        notInQuotes
      ) {
        opening = true;
        stack.pop();
        tempRaw += char;
        generateResult(tempRaw, from, i, attrs);
        attrs = "";
        tempRaw = "";
        amIrecording = false;
        continue;
      } else if (char === stack[stack.length - 1] && notInQuotes) {
        stack.pop();
        tempRaw += char;
        attrs = getAttributes(tempRaw);
        if (html[i - 1] === "/") {
          generateResult(tempRaw, from, i, attrs);
          opening = true;
          tempRaw = "";
          attrs = "";
          amIrecording = false;
        } else {
          stack.push("</parse>");
        }
        continue;
      }
    }
    if (amIrecording) {
      tempRaw += char;
    }
  }
  return resultFinal;
};

htmlParser(html);
console.log(resultFinal);
