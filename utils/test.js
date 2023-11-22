const delimiters = [".", ",", "!", "?", ":", ";", "—", "(", ")", " ", "\n", "\r"];

function splitString(str) {
  let result = [];
  let currentWord = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (delimiters.includes(char)) {
      if (currentWord !== "") {
        result.push(currentWord);
        currentWord = "";
      }
      result.push(char);
    } else {
      currentWord += char;
    }
  }

  if (currentWord !== "") {
    result.push(currentWord);
  }

  return result;
}
function mergeDelimiters(arr) {
  let result = [];
  let currentDelimiter = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (delimiters.includes(element)) {
      currentDelimiter += element;
    } else {
      if (currentDelimiter !== "") {
        if (currentDelimiter.trim() !== "" || result.length === 0) {
          result.push({ delim: currentDelimiter });
        } else {
          result.push(currentDelimiter);
        }
        currentDelimiter = "";
      }
      result.push(element);
    }
  }

  if (currentDelimiter !== "") {
    result.push({ delim: currentDelimiter });
  }

  return result;
}

function mergeStringElements(arr) {
  let result = [];
  let currentString = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (typeof element === "string") {
      currentString += element;
    } else {
      if (currentString !== "") {
        result.push(currentString);
        currentString = "";
      }
      result.push(element);
    }
  }

  if (currentString !== "") {
    result.push(currentString);
  }

  return result;
}

function createString(arr) {
  let result = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (typeof element === "string") {
      result += `<em>${element}</em>`;
    } else if (typeof element === "object" && "delim" in element) {
      result += element.delim;
    }
  }

  return result;
}

function formatString(inputString) {
  const punctuationRegex = /\s+[.,?!:;\)\(\n]+/g;
  let result = inputString.replace(punctuationRegex, match => match.trim());
  return result;
}

// const inputString = " провалы, завалы белого прекрасного полотна( снега ) !  ";
const inputString = `йога
,`;

const resultArray = formatString(createString(mergeStringElements(mergeDelimiters(splitString(inputString)))));
console.log(`'${resultArray}'`);
