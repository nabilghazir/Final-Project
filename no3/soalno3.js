function cetakPola(rows) {
  for (let i = rows; i >= 1; i--) {
    let row = "";
    for (let j = rows; j > i; j--) {
      row += " ";
    }
    for (let k = 1; k <= 2 * i - 1; k++) {
      if (k % 2 == 0) {
        row += "+";
      } else {
        row += "#";
      }
    }
    console.log(row);
  }
}

cetakPola(20);
