# remote-critical-css

Generate a critical-css file by from a website by providing a URL using [puppeteer](https://www.npmjs.com/package/puppeteer), [critical](https://www.npmjs.com/package/critical), & [cssnano](https://www.npmjs.com/package/cssnano)

## Usage

1. `$ git clone https://github.com/steveosoule/remote-critical-css.git`
2. `$ cd remote-critical-css`
3. `$ npm install`
4. Download the css files that are used on the site and place them in a mirrored path in the src file. For example, if your css is located at `https://example.com/css/main.css`, download that file to: `src/css/main.css` and repeat that for each css file that is used on your site. (Note: looking to automate this in the future)
5. `$ node index.js run --auth.username=foo --auth.password=bar -u https://www.example.com,https://www.example.com/another/page.html`