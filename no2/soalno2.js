function loopinguntuksortingan(arr, target) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    let targetChar = target[i];
    for (let j = i; j < n; j++) {
      if (arr[j] === targetChar) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        break;
      }
    }
  }
}

function urutanarray(arr) {
  let target = "Dumbways is awesome".split("");
  loopinguntuksortingan(arr, target);
  let result = arr.join("");
  return result;
}

let dataArray = [
  "u",
  "D",
  "m",
  "w",
  "b",
  "a",
  "y",
  "s",
  "i",
  "s",
  "w",
  "a",
  "e",
  "s",
  "e",
  "o",
  "m",
  " ",
  " ",
];

let sortedString = urutanarray(dataArray);
console.log(sortedString);
