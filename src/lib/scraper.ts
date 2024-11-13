import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

export async function scrapeBitcoinNews() {
  console.log('Starting scrape with Puppeteer in production mode...');
  
  const browser = await puppeteer.launch({
    args: [...chrome.args, '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true
  });
  
  try {
    console.log('Browser launched, creating page...');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('Attempting to scrape Cointelegraph...');
    await page.goto('https://cointelegraph.com/tags/bitcoin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Add a delay to ensure content loads
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Page loaded, evaluating content...');
    const articles = await page.evaluate(() => {
      const elements = document.querySelectorAll('.post-card-inline');
      console.log('Found elements:', elements.length);
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
      }).filter(Boolean).slice(0, 5);
    });

    if (!articles || articles.length === 0) {
      throw new Error('No articles found on page');
    }

    console.log(`Successfully scraped ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
