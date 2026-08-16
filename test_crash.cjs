const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for the shops to load
    await page.waitForSelector('.grid-cols-1 > div');
    console.log("Found shop elements");
    
    // Click the first shop
    await page.click('.grid-cols-1 > div');
    console.log("Clicked shop element");
    
    // Wait a moment for any crash to happen
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  } finally {
    await browser.close();
  }
})();
