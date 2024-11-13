import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinPrice: number) {
  const prompt = `
    Create a concise, factual Bitcoin market update.
    Guidelines:
    - Use precise, data-driven language
    - Focus on price action and key market movements
    - Include specific numbers and percentages
    - Maintain neutral, journalistic tone
    - No emojis or casual language
    
    Structure:
    1. **Market Update** (Current price, recent movement, key levels)
    2. **Key Developments** (2-3 most significant news items)
    3. **Market Context** (Brief technical or fundamental insight)
    
    Tone: Professional market reporting, similar to Bloomberg or Reuters
    Length: 150-200 words maximum
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
