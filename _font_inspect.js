const { chromium } = require('C:/Users/d1505/.dsh/profiles/desktop/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await ctx.route('https://v1.hitokoto.cn/**', r => r.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ hitokoto: '人生如逆旅，我亦是行人。', from: '临江仙', from_who: '苏轼', type: 'i' }) }));
  const page = await ctx.newPage();
  await page.goto('https://blacklaegend.github.io/shiyan/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => document.querySelector('#quoteText')?.textContent.includes('逆旅'), { timeout: 20000 });
  const out = await page.evaluate(() => {
    const pick = (sel) => { const el=document.querySelector(sel); if(!el) return null; const c=getComputedStyle(el); return {sel, family:c.fontFamily, weight:c.fontWeight, size:c.fontSize}; };
    return [pick('body'),pick('#quoteText'),pick('.brand-name'),pick('#refreshBtn'),pick('.dbl-hint'),pick('#settingsBtn'),pick('.footer-left')];
  });
  console.log(JSON.stringify(out,null,2));
  await page.screenshot({ path: 'E:/Users/beida/deepseek-harness/default-workspace/yiyan/font-inspect.png' });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
