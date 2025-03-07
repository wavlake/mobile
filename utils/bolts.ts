// BOLT 11
// https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
export function parseInvoice(x: string) {
  const SATS_PER_BTC = 100_000_000;

  // Updated regex to match the actual BOLT11 format more accurately
  // This matches "lnbc" followed by digits, followed by a denomination character
  const re = /lnbc(\d+)([munp])/;
  const match = x.match(re);

  if (!match) {
    throw new Error("Invalid invoice format");
  }

  const [_, amountStr, denomination] = match;
  const amount = Number(amountStr);

  if (!Number.isInteger(amount)) {
    throw new Error("Invalid invoice, amount is not an integer");
  }

  try {
    switch (denomination) {
      case "m":
        return (amount * SATS_PER_BTC) / 1000; // milli (0.001 BTC)
      case "u":
        return (amount * SATS_PER_BTC) / 1_000_000; // micro (0.000001 BTC)
      case "n":
        return (amount * SATS_PER_BTC) / 1_000_000_000; // nano (0.000000001 BTC)
      case "p":
        return (amount * SATS_PER_BTC) / 1_000_000_000_000; // pico (0.000000000001 BTC)
      default:
        throw new Error("Invalid denomination");
    }
  } catch (error) {
    console.error("Invoice parsing error:", error);
    throw error; // Re-throw the error to handle it at a higher level
  }
}
