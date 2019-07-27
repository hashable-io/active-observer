export function randString(maxLength = 10) {
  let length = Math.ceil(Math.random() * maxLength)
  const generatedString = [];
  while(length > 0) {
    generatedString.push(String.fromCharCode(97 + Math.floor((Math.random() * 26))))
    length--;
  };
  return generatedString.join("");
};

