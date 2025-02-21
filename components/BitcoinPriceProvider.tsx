import React, { createContext, useContext, useState, useEffect } from "react";

const EXCHANGE_RATE_URL =
  "https://api.coinbase.com/v2/exchange-rates?currency=USD";
const SATS_PER_BTC = 100000000;

interface BitcoinPriceContextType {
  bitcoinPrice: number | null;
  isLoading: boolean;
  error: string | null;
  convertSatsToUSD: (sats: number) => number | null;
  convertUSDToSats: (usd: number) => number | null;
  refetch: () => Promise<void>;
}

const BitcoinPriceContext = createContext<BitcoinPriceContextType | undefined>(
  undefined,
);

export const BitcoinPriceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch(EXCHANGE_RATE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as {
        data: { rates: Record<"BTC", string> };
      };
      const btcRate = 1 / parseFloat(data.data.rates.BTC);
      setBitcoinPrice(btcRate);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();

    const interval = setInterval(fetchBitcoinPrice, 60000 * 15); // refetch every fifteen minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    bitcoinPrice,
    convertSatsToUSD: (sats: number) => {
      if (!bitcoinPrice) return null;
      const btc = sats / SATS_PER_BTC;
      const rawUSD = btc * bitcoinPrice;
      // two decimal places
      return Math.round(rawUSD * 100) / 100;
    },
    convertUSDToSats: (usd: number) => {
      if (!bitcoinPrice) return null;
      const btc = usd / bitcoinPrice;
      const rawSats = btc * SATS_PER_BTC;
      return Math.round(rawSats);
    },
    isLoading,
    error,
    refetch: fetchBitcoinPrice, // Expose refetch function for manual updates
  };

  return (
    <BitcoinPriceContext.Provider value={value}>
      {children}
    </BitcoinPriceContext.Provider>
  );
};

export const useBitcoinPrice = () => {
  const context = useContext(BitcoinPriceContext);
  if (context === undefined) {
    throw new Error(
      "useBitcoinPrice must be used within a BitcoinPriceProvider",
    );
  }
  return context;
};
