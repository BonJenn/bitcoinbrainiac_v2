import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinData: { price: number, change24h: number }) {
  const priceColor = bitcoinData.change24h >= 0 ? 'green' : 'red';
  const formattedPrice = `<span style="color: ${priceColor}; font-weight: bold">$${bitcoinData.price.toLocaleString()}</span> <span style="color: ${priceColor}; font-weight: bold">(${bitcoinData.change24h.toFixed(2)}%)</span>`;
  
  const prompt = `
    Deliver an authoritative market update.
    Guidelines:
    - Write with firsthand authority - you're breaking this news
    - Make the first sentence of each section bold using **double asterisks**
    - Lead with what matters most right now
    - Back statements with specific data points
    - Include forward-looking analysis
    - Use em dashes for insider context
    - Use this exact price format for the first mention: ${formattedPrice}
    
    Structure:
    1. Price and dominant market narrative (first sentence bold)
    2. Critical developments (first sentence bold)
    3. Regulatory impact if relevant (first sentence bold)
    4. Your market analysis (first sentence bold)
    5. What to watch for next (first sentence bold)
    
    Tone: Authoritative and direct - you're the source, not the messenger
    Length: 200-250 words
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a seasoned financial analyst specializing in Bitcoin and digital assets. Your writing style is clear, analytical, and professionally measured."
      },
      {
        role: "user",
        content: prompt + "\n\nArticles:\n" + JSON.stringify(articles, null, 2)
      }
    ],
  });

  return completion.choices[0].message.content;
}
