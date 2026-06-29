import { chromium } from 'playwright';

const URL = 'http://localhost:5175/';
const OUT = '/tmp/ryze-shots';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Total scrollable height
const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
console.log('maxScroll =', maxScroll, 'innerHeight =', 900);

const steps = 16;
for (let i = 0; i <= steps; i++) {
  const y = Math.round((maxScroll * i) / steps);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(450);
  const f = `${OUT}/shot_${String(i).padStart(2, '0')}_y${y}.png`;
  await page.screenshot({ path: f });
  // report which section labels are currently in the viewport center band
  const visible = await page.evaluate(() => {
    const labels = [];
    document.querySelectorAll('section[aria-label], [aria-label]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight && r.height > 40) {
        labels.push(`${el.getAttribute('aria-label')}@${Math.round(r.top)}`);
      }
    });
    return labels;
  });
  console.log(`i=${i} y=${y} →`, visible.join(' | '));
}

await browser.close();
console.log('done →', OUT);
