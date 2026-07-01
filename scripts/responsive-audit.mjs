/**
 * Responsive audit — drives a headless Chrome across every route at every
 * target viewport width and reports horizontal overflow + offending elements.
 * Not part of the app build; a dev/QA tool run manually.
 *
 *   npm run build && npm run preview        # serve dist on :4173
 *   node scripts/responsive-audit.mjs       # then run this
 */
import puppeteer from 'puppeteer-core';

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE ?? 'http://localhost:4173';

const WIDTHS = [320, 360, 375, 390, 414, 480, 640, 768, 1024, 1280, 1440, 1920];

const ROUTES = [
  '/', '/portfolio', '/services', '/about', '/contact',
  '/blog', '/resources', '/privacy', '/terms', '/cookies',
  '/portfolio/orange-city-grocers',
  '/services/development',
  '/blog/engineering-for-99-8-uptime',
  '/nonexistent-404-check',
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});

const findings = [];

for (const route of ROUTES) {
  const page = await browser.newPage();
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 400));
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 150));
    });

    const result = await page.evaluate((vw) => {
      const docW = document.documentElement.scrollWidth;
      const overflow = docW - window.innerWidth;
      const offenders = [];
      if (overflow > 0) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > vw + 1 && r.width <= vw + 2) {
            const cls = el.className?.toString?.() ?? '';
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: cls.slice(0, 80),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
          }
        }
      }
      return { docW, overflow, offenders: offenders.slice(0, 6) };
    }, width);

    if (result.overflow > 0) {
      findings.push({ route, width, overflow: result.overflow, offenders: result.offenders });
    }
  }
  await page.close();
}

await browser.close();

if (findings.length === 0) {
  console.log('✅ No horizontal overflow found across all routes × widths.');
} else {
  console.log(`❌ ${findings.length} overflow finding(s):\n`);
  for (const f of findings) {
    console.log(`— ${f.route} @ ${f.width}px  (overflow ${f.overflow}px)`);
    for (const o of f.offenders) {
      console.log(`     <${o.tag}> right=${o.right} w=${o.w}  ${o.cls}`);
    }
  }
}
