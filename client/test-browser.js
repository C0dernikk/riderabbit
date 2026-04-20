import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log("Navigating to http://localhost:5175/vehicles");
  await page.goto('http://localhost:5175/vehicles', { waitUntil: 'networkidle0' });

  // Click the first vehicle details button
  console.log("Clicking on details button...");
  const buttons = await page.$$('button, a');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && text.includes('DETAILS')) {
      await btn.click();
      console.log("Clicked DETAILS button");
      break;
    }
  }

  // Wait for navigation
  await new Promise(r => setTimeout(r, 3000));
  
  // Check what's rendered
  const content = await page.content();
  if (content.includes("Complete Your Booking") || content.includes("Book This Ride Now")) {
    console.log("Page rendered successfully!");
  } else if (content.includes("Vehicle not found")) {
    console.log("Rendered 'Vehicle not found'");
  } else {
    console.log("Page is possibly blank. Body length:", content.length);
  }

  await browser.close();
})();
