import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinData: { price: number, change24h: number }) {
  const priceColor = bitcoinData.change24h >= 0 ? 'green' : 'red';
  const formattedPrice = `<span style="color: ${priceColor}; font-weight: bold">$${bitcoinData.price.toLocaleString()}</span> <span style="color: ${priceColor}; font-weight: bold">(${bitcoinData.change24h.toFixed(2)}%)</span>`;
  
  const prompt = `
    Create a conversational yet professional Bitcoin market update.
    Guidelines:
    - Use a mix of data and narrative storytelling
    - Include specific numbers and percentages
    - Reference relevant political/regulatory context
    - Use em dashes for asides and side notes
    - Include forward-looking predictions or expert opinions
    - Feel free to use bullet points for key developments
    - Use this exact price format for the first mention: ${formattedPrice}
    
    Structure:
    1. Opening hook with current price and major narrative
    2. Key developments (bullet points welcome)
    3. Political/regulatory context if relevant
    4. Expert opinions or market predictions
    5. Forward-looking conclusion
    
    Tone: Similar to Morning Brew or Axios - smart but conversational
    Length: 200-250 words
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a friendly Bitcoin expert writing for a community of interested readers. Make complex topics accessible while maintaining credibility."
      },
      {
        role: "user",
        content: prompt + "\n\nArticles:\n" + JSON.stringify(articles, null, 2)
      }
    ],
  });

  return completion.choices[0].message.content;
}
