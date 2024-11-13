import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinPrice: number) {
  const prompt = `
    Create a friendly, conversational Bitcoin newsletter.
    Guidelines:
    - Write like you're explaining to a friend
    - Keep it super brief and engaging
    - Use clear, simple language
    - Make it scannable with bold headings
    
    Structure:
    1. **Today's Bitcoin Price** (Quick price update and simple observation)
    2. **What's New** (2-3 key stories in plain language)
    3. **Bottom Line** (One friendly takeaway)
    
    Tone: Knowledgeable friend sharing updates
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
