import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  console.log("Navigating to http://localhost:5175/");
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });

  const content = await page.content();
  console.log("BODY LENGTH:", content.length);
  if (content.length < 500) {
    console.log("CONTENT:", content);
  }

  await browser.close();
})();
