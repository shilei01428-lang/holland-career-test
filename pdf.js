const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, 'report.html');
    await page.goto('file://' + filePath, { waitUntil: 'networkidle' });

    await page.pdf({
        path: '工作汇报_霍兰德职业兴趣测评.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    console.log('PDF generated successfully: 工作汇报_霍兰德职业兴趣测评.pdf');
})();
