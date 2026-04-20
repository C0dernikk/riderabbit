import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  console.log("Navigating to http://localhost:5175/vehicles");
  await page.goto('http://localhost:5175/vehicles', { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 2000));

  const buttons = await page.$$('button, a');
  let clicked = false;
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && text.includes('DETAILS')) {
      await btn.click();
      console.log("Clicked DETAILS button");
      clicked = true;
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
