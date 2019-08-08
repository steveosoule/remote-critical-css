const fs = require('fs');
const yargs = require('yargs');
const puppeteer = require('puppeteer');
const critical = require('critical');
const CleanCSS = require('clean-css');

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

async function generate(page){

  console.log('generate', page._target._targetInfo.url);

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
    const cleanCriticalCSS = new CleanCSS().minify(criticalCSS);
    console.log('argv.output', argv.output)
    createDirIfNotExist('dest');
    fs.writeFileSync('dest/' + argv.output, cleanCriticalCSS.styles, {flag: 'a'});

  });
};

async function asyncForEach(array, callback) {
  console.log('asyncForEach', array);
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function cleanup(){
  createDirIfNotExist('dest');
  fs.writeFileSync('dest/' + argv.output, '', {flag: 'w'});
}

async function init(){
  // TODO: cleanup src & dest
  cleanup()

  console.log('argv', argv);

  console.log('init');

  const browser = await puppeteer.launch();


  var urls = argv.urls.split(',');
  // console.log('init.urls', urls);
  // asyncForEach(urls, async (url) => {
    // console.log('init.asyncForEach', url);
    let page = await browser.newPage();
    await page.setViewport({
      width: 768,
      height: 1024
    });

    await page.goto(urls[0]);
    await generate(page);
  // });

  console.log('init.done');

  await browser.close();
};

init();