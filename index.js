const fs = require('fs');
const yargs = require('yargs');
const puppeteer = require('puppeteer');
const critical = require('critical');
const cssnano = require('cssnano');

const argv = yargs
    .command('run', 'Generate critical css from a list of urls.', {
        urls: {
            description: 'A comma sperated list of urls.',
            alias: 'u',
            type: 'string',
            // default: 'https://www.google.com,https://www.google.com/search?q=foobar'
            default: 'https://www.google.com'
        },
        output: {
            description: 'File to write the critical-css to.',
            alias: 'o',
            type: 'string',
            default: 'critical.css'
        },
        'auth.username': {
            description: 'Optional, basic authentication username',
            alias: 'user',
            type: 'string'
        },
        'auth.password': {
            description: 'Optional, basic authentication username',
            alias: 'pass',
            type: 'string'
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

function createDirIfNotExist(path){
  if (!fs.existsSync(path)) {
    return fs.mkdirSync(path);
  }
}

var counter = 0;

async function generate(page){

  var pageUrl = page._target._targetInfo.url;

  console.log('generating...', pageUrl);

  const pageHTML = await page.content();

  createDirIfNotExist('src');
  fs.writeFileSync('src/temp.html', pageHTML, {flag: 'w'});

  // TODO: need to download the remote css files that were found and place them in mirrored path in `src`` folder`. That'll be manual for now

  var response = critical.generate({
    base: 'src/',
    src: 'temp.html',
    target: argv.output,
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

    cssnano.process(criticalCSS).then(function(result){
      // write individual css file
      let counterCSSFile = `dest/${counter}.css`;
      fs.writeFileSync(counterCSSFile, result, {flag: 'w'});
      console.log(` - output ${pageUrl} to ${counterCSSFile}`);
      counter++;

      // Update complete css file
      let destCssFile = `dest/${argv.output}`;
      let destCss = fs.readFileSync(destCssFile);

      cssnano.process(destCss + criticalCSS).then(function(combinedResult){
        fs.writeFileSync(destCssFile, combinedResult, {flag: 'w'} );
      });
    });

  });
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function cleanup(){
  // TODO: cleanup src

  // Cleanup dest
  createDirIfNotExist('dest');
  fs.writeFileSync('dest/' + argv.output, '', {flag: 'w'});
}

async function goToUrl(page, url){
  if( typeof argv.auth !== 'undefined'){
    await page.authenticate({ username: argv.auth.username, password: argv.auth.password });
  }
  await page.goto(url);
  await generate(page);
}

async function init(){
  await cleanup();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 768,
    height: 1024
  });

  var urls = argv.urls.split(',');
  await asyncForEach(urls, async function(url){
    await goToUrl(page, url)
  });

  await browser.close();
};

init();