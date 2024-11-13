export async function getBitcoinPrice() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await response.json();
    return {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change
    };
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return null;
  }
}
