import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinData: { 
  price: number, 
  change24h: number,
  fearGreedIndex: {
    value: number,
    classification: string
  }
}) {
  const priceColor = bitcoinData.change24h >= 0 ? 'green' : 'red';
  const formattedPrice = `<span style="color: ${priceColor}; font-weight: bold">$${bitcoinData.price.toLocaleString()}</span> <span style="color: ${priceColor}; font-weight: bold">(${bitcoinData.change24h.toFixed(2)}%)</span>`;
  
  const formattedArticles = articles.map(article => ({
    ...article,
    imageHtml: article.imageUrl ? 
      `<div style="margin: 20px 0;">
        <img src="${article.imageUrl}" alt="${article.title}" style="max-width: 100%; height: auto; border-radius: 8px;">
        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">Source: ${article.imageSource}</p>
      </div>` : ''
  }));

  const fearGreedColor = bitcoinData.fearGreedIndex.classification.toLowerCase().includes('fear') ? 'dc3545' : '28a745';
  const fearGreedChartUrl = 'https://alternative.me/crypto/fear-and-greed-index.png';
  
  const fearGreedHtml = `
    <div style="margin: 20px 0;">
      <img src="${fearGreedChartUrl}" alt="Bitcoin Fear and Greed Index" style="max-width: 100%; height: auto; border-radius: 8px;">
      <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
        Current Fear & Greed Index: 
        <span style="color: #${fearGreedColor}; font-weight: bold">
          ${bitcoinData.fearGreedIndex.value} (${bitcoinData.fearGreedIndex.classification})
        </span>
      </p>
    </div>
  `;

  const prompt = `
    Create a well-structured Bitcoin market update with clear sections in the voice of Scott Galloway.
    Focus exclusively on Bitcoin - do not include any NFT-related content or any other crypto-assets.
    Include relevant images from the articles where they fit naturally in the content.
    
    Format Requirements:
    - Wrap the entire content in a div with these styles:
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
    - Each section heading should use:
      <h3 style="color: #1a1a1a; border-bottom: 2px solid #f7931a; padding-bottom: 8px; margin-top: 25px;">
    - Paragraphs should use:
      <p style="color: #333; margin: 16px 0;">
    - Lists should use:
      <ul style="margin: 16px 0; padding-left: 20px;">
      <li style="margin: 8px 0; color: #333;">
    - Price changes should be colored:
      Positive: <span style="color: #28a745;">
      Negative: <span style="color: #dc3545;">
    
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
       ${fearGreedHtml}
       - Institutional activity
       - Trading volume patterns
       - Derivatives market overview
    
    6. Looking Ahead
       - Key events to watch
       - Potential market movers
       - Institutional developments to monitor
    
    Style:
    - Professional and authoritative tone
    - Data-driven analysis with specific numbers
    - Each section should start directly with the heading text (no HTML prefix)
    - Clear section transitions
    - 400-450 words total
    - Balance between narrative paragraphs and bullet points
    
    Images:
    - Insert the provided imageHtml where relevant to the content
    - Place images after their related paragraphs
    - Maximum 3 images in the newsletter
    
    Note: 
    - Do not include any HTML prefix before the first section
    - Start directly with "Market Overview" as the first line
    - Ensure proper HTML formatting within sections only
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
        content: prompt + "\n\nArticles:\n" + JSON.stringify(formattedArticles, null, 2)
      }
    ],
  });

  return completion.choices[0].message.content;
}
