export async function getBitcoinPrice() {
  try {
    const [priceResponse, fearGreedResponse] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'),
      fetch('https://api.alternative.me/fng/')
    ]);

    const priceData = await priceResponse.json();
    const fearGreedData = await fearGreedResponse.json();

    // Get fear/greed index image URL
    const fearGreedImageUrl = `https://alternative.me/crypto/fear-and-greed-index.png?timestamp=${Date.now()}`;
    
    return {
      price: priceData.bitcoin.usd,
      change24h: priceData.bitcoin.usd_24h_change,
      fearGreedIndex: {
        value: fearGreedData.data[0].value,
        classification: fearGreedData.data[0].value_classification,
        imageUrl: fearGreedImageUrl
      }
    };
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error);
    throw error;
  }
}
