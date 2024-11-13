import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinPrice: number) {
  const prompt = `
    Create a professional Bitcoin market newsletter that avoids spam trigger words.
    Guidelines:
    - Use professional, measured language
    - Avoid excessive punctuation or all caps
    - Don't use hype words like "amazing", "incredible", "opportunity"
    - Focus on factual reporting and analysis
    - Use proper grammar and formatting
    
    Structure:
    1. Market Update: Current Bitcoin price ($${bitcoinPrice}) and brief technical analysis
    2. News Summary: Key developments from the articles (focus on facts, avoid sensationalism)
    3. Industry Insights: Brief analysis of implications
    
    Tone: Professional, analytical, and informative. Similar to a financial market report.
    Length: 400-500 words.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a professional financial newsletter writer for a respected Bitcoin market intelligence service. Maintain a formal, analytical tone."
      },
      {
        role: "user",
        content: prompt + "\n\nArticles:\n" + JSON.stringify(articles, null, 2)
      }
    ],
  });

  return completion.choices[0].message.content;
}
