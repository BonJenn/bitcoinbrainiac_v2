import puppeteer from 'puppeteer';

function isBitcoinRelated(text: string): boolean {
  const bitcoinTerms = ['bitcoin', 'btc', 'satoshi', 'lightning network'];
  const text_lower = text.toLowerCase();
  return bitcoinTerms.some(term => text_lower.includes(term));
}

export async function scrapeBitcoinNews() {
  console.log('Initializing puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });
  
  try {
    console.log('Browser launched successfully');
    const allArticles = [];
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000); // Increase timeout to 60 seconds
    
    // Set a larger viewport
    await page.setViewport({
      width: 1920,
      height: 1080
    });

    console.log('Attempting to scrape CoinGecko...');
    try {
      await page.goto('https://www.coingecko.com/en/news/bitcoin', {
        waitUntil: 'networkidle0'
      });
      console.log('Successfully loaded CoinGecko page');
      
      await page.waitForSelector('article');
      console.log('Found article elements on CoinGecko');

      const coingeckoArticles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('article');
        return Array.from(articleElements, article => {
          const titleElement = article.querySelector('h2');
          const summaryElement = article.querySelector('p');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          const summary = summaryElement ? summaryElement.textContent?.trim() : '';
          
          return {
            title,
            summary,
            source: 'CoinGecko News',
            timestamp: new Date().toISOString(),
            fullText: `${title} ${summary}`
          };
        });
      });

      // Filter for Bitcoin-related articles
      const bitcoinArticles = coingeckoArticles
        .filter(article => isBitcoinRelated(article.fullText))
        .slice(0, 3);

      allArticles.push(...bitcoinArticles);
    } catch (error) {
      console.error('Detailed CoinGecko scraping error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    // Scrape from Bitcoin.com
    try {
      await page.goto('https://www.bitcoin.com/news/', {
        waitUntil: 'networkidle0'
      });
      await page.waitForSelector('article');

      const bitcoinComArticles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('article');
        return Array.from(articleElements, article => {
          const titleElement = article.querySelector('h2, h3');
          const summaryElement = article.querySelector('p');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          const summary = summaryElement ? summaryElement.textContent?.trim() : '';
          
          return {
            title,
            summary,
            source: 'Bitcoin.com',
            timestamp: new Date().toISOString(),
            fullText: `${title} ${summary}`
          };
        });
      });

      // Filter for Bitcoin-related articles
      const bitcoinArticles = bitcoinComArticles
        .filter(article => isBitcoinRelated(article.fullText))
        .slice(0, 3);

      allArticles.push(...bitcoinArticles);
    } catch (error) {
      console.error('Error scraping Bitcoin.com:', error);
    }

    // Remove fullText field before returning
    const cleanedArticles = allArticles.map(({ fullText, ...rest }) => rest);

    if (cleanedArticles.length === 0) {
      throw new Error('No Bitcoin-specific articles found');
    }

    console.log('Successfully scraped articles:', cleanedArticles);
    return cleanedArticles;
  } catch (error) {
    console.error('Detailed scraping error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}
