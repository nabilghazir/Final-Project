function soalno1() {
  const depositobank1 = 350000000;
  const depositobank2 = 650000000;

  const keuntunganbank = depositobank1 * 0.035;

  const obligasi = depositobank2 * 0.3;
  const keuntunganobligasi = obligasi * 0.13;

  const sahamA = depositobank2 * 0.35;
  const keuntungansahamA = sahamA * 0.145;

  const sahamB = depositobank2 * 0.35;
  const keuntungansahamB = sahamB * 0.125;

  console.log("keuntungan bank", keuntunganbank);
  console.log("obligasi", keuntunganobligasi);
  console.log("saham A", keuntungansahamA);
  console.log("keuntungan saham B", keuntungansahamB);

  const totalkeuntungan =
    (keuntunganbank +
      keuntunganobligasi +
      keuntungansahamA +
      keuntungansahamB) *
    2;

  console.log("Keuntungan", totalkeuntungan);

  const totaluanginvestor = depositobank1 + depositobank2 + totalkeuntungan;

  console.log(
    "Total Uang Investor =",
    totaluanginvestor.toLocaleString("id-ID")
  );
}

soalno1();
