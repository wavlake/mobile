// BOLT 11
// https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
export function parseInvoice(x: string) {
  const SATS_PER_BTC = 100_000_000;
  const re = new RegExp(`(lnbc)([1234567890]{1,})(\\w)1\\w+`);
  const [zero, first, second, third] = x.match(re) || [];
  const secondInt = Number(second);
  try {
    if (!third || !second || !Number.isInteger(secondInt)) {
      throw "Invalid invoice, please ensure there is an amount specified";
    }
    switch (third) {
      case "m":
        return (secondInt * SATS_PER_BTC) / 1000; // milli (0.001 BTC)
      case "u":
        return (secondInt * SATS_PER_BTC) / 1_000_000; // micro (0.000001 BTC)
      case "n":
        return (secondInt * SATS_PER_BTC) / 1_000_000_000; // nano (0.000000001 BTC)
      case "p":
        return (secondInt * SATS_PER_BTC) / 1_000_000_000_000; // pico (0.000000000001 BTC)
      default:
        throw "Invalid invoice";
    }
  } catch (error) {
    console.log("invoiceAmount error", error);
  }
}
