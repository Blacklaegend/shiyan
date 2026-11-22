const { chromium } = require('C:/Users/d1505/.dsh/profiles/desktop/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await ctx.route('https://v1.hitokoto.cn/**', r => r.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ hitokoto: '人生如逆旅，我亦是行人。', from: '临江仙', from_who: '苏轼', type: 'i' }) }));
  const page = await ctx.newPage();
  await page.goto('https://blacklaegend.github.io/shiyan/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => document.querySelector('#quoteText')?.textContent.includes('逆旅'), { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: 1 });
  async function fonts(selector) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const r = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    return r.fonts;
  }
  console.log('quote', await fonts('#quoteText'));
  console.log('brand', await fonts('.brand-name'));
  console.log('button', await fonts('#refreshBtn'));
  console.log('hint', await fonts('.dbl-hint'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
