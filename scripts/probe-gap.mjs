import pw from '/Users/rohansalunke/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js';
const { chromium } = pw;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Report layout rects of the major blocks as we scroll through the transition zone.
for (let y = 4600; y <= 6400; y += 200) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const out = {};
    const phil = document.querySelector('section[aria-label="Philosophy"]');
    const cap = document.querySelector('section[aria-label="What we build"]');
    const feat = document.querySelector('section[aria-label="Featured work"]');
    const r = (el) => el ? `${Math.round(el.getBoundingClientRect().top)}..${Math.round(el.getBoundingClientRect().bottom)}` : 'none';
    out.phil = r(phil);
    out.cap = r(cap);
    out.feat = r(feat);
    // what's actually painted at viewport center (450)?
    const mid = document.elementFromPoint(720, 450);
    out.mid = mid ? (mid.getAttribute('aria-label') || mid.tagName + '.' + (mid.className?.toString().slice(0,30) || '')) : 'null';
    return out;
  }, y);
  console.log(`y=${y} | Philosophy[${info.phil}] Capabilities[${info.cap}] | center=${info.mid}`);
}

await browser.close();
