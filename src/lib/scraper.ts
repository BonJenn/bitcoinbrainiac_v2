import puppeteer from 'puppeteer';

export async function scrapeBitcoinNews() {
  console.log('Starting scrape with Puppeteer...');
  
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1200,
      height: 800
    },
    headless: "new"
  });
  
  try {
    console.log('Browser launched, creating page...');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    page.setDefaultTimeout(15000);
    
    console.log('Attempting to scrape Cointelegraph...');
    await page.goto('https://cointelegraph.com/tags/bitcoin', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    await page.waitForSelector('.post-card-inline');
    
    const articles = await page.evaluate(() => {
      const elements = document.querySelectorAll('.post-card-inline');
      return Array.from(elements, article => {
        const titleEl = article.querySelector('.post-card-inline__title');
        const summaryEl = article.querySelector('.post-card-inline__text');
        
        const title = titleEl?.textContent?.trim();
        const summary = summaryEl?.textContent?.trim();
        
        if (!title || !summary) return null;
        
        return {
          title,
          summary,
          source: 'Cointelegraph',
          timestamp: new Date().toISOString(),
          fullText: `${title} ${summary}`
        };
      }).filter(Boolean).slice(0, 3);
    });

    if (!articles || articles.length === 0) {
      throw new Error('No articles found on page');
    }

    console.log(`Successfully scraped ${articles.length} articles`);
    return articles;
  } finally {
    await browser.close();
  }
}
