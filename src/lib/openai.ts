import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinPrice: number) {
  const prompt = `
    Create a concise Bitcoin newsletter using these articles and the current Bitcoin price ($${bitcoinPrice}).
    Format:
    1. Current Bitcoin Price and Brief Market Analysis
    2. Top Stories (summarize the most important 3-4 articles)
    3. Quick Takes (brief points about remaining news)
    
    Keep it engaging and easy to read. Total length should be around 400-500 words.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a professional crypto newsletter writer. Keep the tone informative but accessible."
      },
      {
        role: "user",
        content: prompt + "\n\nArticles:\n" + JSON.stringify(articles, null, 2)
      }
    ],
  });

  return completion.choices[0].message.content;
}
