// puppeteer-extra is a drop-in replacement for puppeteer, 
// it augments the installed puppeteer with plugin functionality 
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { executablePath } = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

function index() {
    return `
        <!doctype html>
        <html>
            <head>
                <title>codepen proxy</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                    }
                    form {
                        text-align: center;
                        margin: 3em 0;
                    }
                    input[type="text"], button {
                        font-size: 2em;
                        padding: .2em;
                    }
                    input[type="text"] {
                        width: calc(90% - 120px);
                    }
                </style>
            </head>
            <body>
                <form method="post" action="/">
                    <input name="url" type="text" placeholder="Put url" pattern="https://codepen.io.*" required>
                    <button type="submit">submit</button>
                </form>
            </body>
        </html>
    `
}

async function getHtml(url = "https://example.com") {
    const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
    try {
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(2000);
        const html = await page.content();

        return html
    } finally {
        await browser.close();
    }
}

const app = express();
const port = process.env.PORT ?? 8080;
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send(index());
});

app.post('/', async (req, res) => {
    const url = req.body.url;
    if (!/https:\/\/codepen\.io\/*/.test(url)) {
        res.send(index())
        return;
    }
    const html = await getHtml(url);
    res.send(html);
})

app.listen(port, () => {
    console.log('codepen proxy start');
});
