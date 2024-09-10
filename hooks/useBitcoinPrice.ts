import { useState, useEffect } from "react";

const useBitcoinPrice = () => {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coinbase.com/v2/exchange-rates?currency=USD",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const btcRate = 1 / parseFloat(data.data.rates.BTC);
        setBitcoinPrice(btcRate);
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message);
        setIsLoading(false);
      }
    };

    fetchBitcoinPrice();

    // Optional: Set up an interval to fetch the price periodically
    const interval = setInterval(fetchBitcoinPrice, 60000); // Fetch every minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return { bitcoinPrice, isLoading, error };
};

export default useBitcoinPrice;
