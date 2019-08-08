const fs = require('fs');
const puppeteer = require('puppeteer');
const critical = require('critical');
const CleanCSS = require('clean-css');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 768,
    height: 1024
  });

  await page.goto('https://www.example.com');

  const pageHTML = await page.content();
  fs.writeFileSync('src/index.html', pageHTML, {flag: 'w'});

  var response = critical.generate({
    base: 'src/',
    src: 'index.html',
    target: 'critical.css',
    /* height: 1024,
    width: 768, */
    minify: true,
    dimensions: [
        {
          height: 1024,
          width: 768,
        },
        {
          height: 900,
          width: 1200,
        }
      ]
  }).then(function(criticalCSS){

    const cleanCriticalCSS = new CleanCSS().minify(criticalCSS);
    fs.writeFileSync('dest/critical.css', cleanCriticalCSS, {flag: 'w'});

  });

  await browser.close();
})();
