import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log("Navigating to http://localhost:5175/vehicles");
  await page.goto('http://localhost:5175/vehicles', { waitUntil: 'networkidle0' });

  // Wait for vehicles to load
  await new Promise(r => setTimeout(r, 2000));

  // Find a DETAILS button and click it
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

  if (!clicked) {
    console.log("Could not find DETAILS button");
  } else {
    // Wait for the next page to load and potentially crash
    await new Promise(r => setTimeout(r, 4000));
  }

  await browser.close();
})();
