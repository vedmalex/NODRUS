function splitStringByDelimiters(/**@type {string} */ str, /** @type {stirng[]} */ delimiters) {
  let result = [];
  let currentWord = "";

  for (let i = 0; i < str.length; i++) {
    let delimiterFound = false;

    for (let j = 0; j < delimiters.length; j++) {
      const delimiter = delimiters[j];

      if (str.startsWith(delimiter, i)) {
        currentWord += delimiter;
        i += delimiter.length - 1;
        delimiterFound = true;
        result.push(currentWord);
        currentWord = "";
        break;
      }
    }

    if (!delimiterFound) {
      currentWord += str[i];
    }
  }

  if (currentWord !== "") {
    result.push(currentWord);
  }

  return result;
}

const inputString = "Hello,<br/> world! <br />This is a test.";
const delimiters = ["<br/>", "<br />"];
const resultArray = splitStringByDelimiters(inputString, delimiters);
console.log(resultArray);
