const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const request = require('request');
const url = "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/65e57df1-070a-4f31-b5aa-86cfd68e529f/Events_List.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210327%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210327T055138Z&X-Amz-Expires=86400&X-Amz-Signature=90fdd44a8ddad9a88b765073ccee1d709f84df880505529656dc18df7310a347&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Events%2520List.html%22";

scrapingResult = {
    'date': '',
    'name': '',
    'feature': '',
};
(async () => {
        const browser = await puppeteer.launch({defaultViewport: null, headless: false,slowMo:10});
        const page = await browser.newPage();

        const naver_id = "hyunahshim@naver.com";
        const naver_pw = "bgriorwln!79";
        await page.goto('https://account.samsung.com/accounts/v1/ST/signInGate?response_type=code&client_id=4dt548jm01&redirect_uri=https:%2F%2Faccount.smartthings.com%2FssoCallback&goBackURL=https:%2F%2Faccount.smartthings.com%2Flogin&state=92rbtl9rcqvpsne3cj2g1o1vlfv1sigmsi3i8jg3nftc7rq82k61uba6b4f40860aHR0cHM6Ly9ncmFwaC1hcDAyLWFwbm9ydGhlYXN0Mi5hcGkuc21hcnR0aGluZ3MuY29tLw%3D%3D&countryCode=&locale=ko&gBtnYN=N');


        await page.type('#iptLgnPlnID', naver_id);
        await page.type('#iptLgnPlnPD', naver_pw);
        await page.click('#signInButton[type=button]');

        await page.waitForNavigation();
        await page.goto(url);
        await page.screenshot({ path: 'naver.png', fullPage:true });

function getData() {
    request(url, function (err, res, body) {
        const $ = cheerio.load(body);

        const bodyList = $(".table.table-bordered.table-condensed.tbl-sm tbody tr").map(function (i, element) {
                scrapingResult['date'] = String($(element).find('td:nth-of-type(1)').text().trim());
                scrapingResult['name'] = String($(element).find('td:nth-of-type(4)').text().trim());
                scrapingResult['feature'] = String($(element).find('td:nth-of-type(5)').text().trim());
                console.log(scrapingResult)
        });
})
}
