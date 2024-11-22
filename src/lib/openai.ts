import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinData: { price: number, change24h: number }) {
  const priceColor = bitcoinData.change24h >= 0 ? 'green' : 'red';
  const formattedPrice = `<span style="color: ${priceColor}; font-weight: bold">$${bitcoinData.price.toLocaleString()}</span> <span style="color: ${priceColor}; font-weight: bold">(${bitcoinData.change24h.toFixed(2)}%)</span>`;
  
  const prompt = `
    Create a well-structured Bitcoin market update with clear sections.
    
    Format Requirements:
    - Use HTML formatting for structure
    - Each section should have an <h3> heading
    - Use <p> tags for paragraphs
    - Use <strong> for bold text
    - Add line breaks between sections
    - First sentence of each section should be bold
    - Include bullet points where relevant using <ul> and <li>
    
    Required Sections:
    1. Market Overview
       - Lead with current price: ${formattedPrice}
       - Include dominant market narrative
    
    2. Key Developments
       - Major news or events
       - Market-moving updates
    
    3. Institutional Adoption
       - Recent institutional investments
       - Corporate treasury updates
       - ETF inflows/outflows
       - Notable public statements from institutions
    
    4. Technical Analysis
       - Support/resistance levels
       - Key indicators
       - Volume analysis
    
    5. Market Sentiment
       - Institutional activity
       - Trading volume patterns
       - Derivatives market overview
    
    6. Looking Ahead
       - Key events to watch
       - Potential market movers
       - Institutional developments to monitor
    
    Style:
    - Professional and authoritative tone
    - Data-driven analysis
    - Clear section transitions
    - 300-350 words total
    - Emphasize institutional movements and their market impact
    
    Note: 
    - Ensure proper HTML formatting and spacing between sections
    - Include specific numbers and data points where possible
    - Highlight institutional flows and their market impact
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
