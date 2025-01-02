import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(articles: any[], bitcoinData: { 
  price: number, 
  change24h: number,
  fearGreedIndex: {
    value: number,
    classification: string,
    imageUrl: string
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
  const fearGreedHtml = `
    <div class="fear-greed">
      <h3>Fear & Greed Index: ${bitcoinData.fearGreedIndex.value} - ${bitcoinData.fearGreedIndex.classification}</h3>
      <img src="${bitcoinData.fearGreedIndex.imageUrl}" alt="Fear and Greed Index" style="max-width: 100%; height: auto;">
    </div>
  `;

  const prompt = `
    Create a Bitcoin-focused market update with clear sections in the voice of Scott Galloway.
    IMPORTANT: Focus EXCLUSIVELY on Bitcoin - DO NOT include any content about other cryptocurrencies, tokens, or NFTs.
    
    Format Requirements:
    - Wrap the entire content in a div with these styles:
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; font-size: 16px;">
    - Each section heading should use:
      <h3 style="color: #1a1a1a; border-bottom: 2px solid #f7931a; padding-bottom: 8px; margin-top: 25px; font-size: 20px;">
    - Paragraphs should use:
      <p style="color: #333; margin: 16px 0; font-size: 16px;">
    - Lists should use:
      <ul style="margin: 16px 0; padding-left: 20px; font-size: 16px;">
      <li style="margin: 8px 0; color: #333;">
    - Price changes should be colored:
      Positive: <span style="color: #28a745;">
      Negative: <span style="color: #dc3545;">
    
    Required Sections:
    0. Key Points
       - 3-4 bullet points summarizing the main topics covered in this newsletter
       - Must relate directly to content in the following sections
    
    1. Market Overview
       - Lead with current price: ${formattedPrice}
       - Include dominant Bitcoin market narrative
    
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
       [FEAR_GREED_INDEX]
       - Institutional activity
       - Trading volume patterns
       - Derivatives market overview
    
    6. Looking Ahead
       - Key events to watch
       - Potential market movers
       - Institutional developments to monitor
    
    Style Guidelines:
    - BITCOIN ONLY - Remove any non-Bitcoin content
    - Email subject must directly relate to content covered in the newsletter
    - Professional and authoritative tone
    - Data-driven analysis with specific numbers
    - Each section should start directly with the heading text
    - Clear section transitions
    - 400-450 words total
    
    Note:
    - Ensure the subject line topic is thoroughly covered in the newsletter content
    - Do not mention any cryptocurrencies other than Bitcoin
    - Start with "Key Points" section followed by "Market Overview"
  `;

  const finalPrompt = prompt.replace('[FEAR_GREED_INDEX]', fearGreedHtml);

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a seasoned financial analyst specializing in Bitcoin and digital assets. Your writing style is clear, analytical, and professionally measured. Do not modify any HTML blocks marked with [FEAR_GREED_INDEX]."
      },
      {
        role: "user",
        content: finalPrompt + "\n\nArticles:\n" + JSON.stringify(formattedArticles, null, 2)
      }
    ],
  });

  let content = completion.choices[0].message.content;
  
  if (!content) {
    throw new Error('Failed to generate newsletter content');
  }
  
  // Ensure fear and greed index HTML is present
  if (!content.includes(fearGreedHtml)) {
    content = content.replace('5. Market Sentiment', `5. Market Sentiment\n${fearGreedHtml}`);
  }

  return content;
}
