const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = 'https://hh.ru/search/vacancy?text=Javascript+developer&page=';
let PAGE = 0;

const result = [];

const fetchHh = async url => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);

    const nav = $('a[data-qa=pager-next]').text();

    if (nav) {
        $(content).find('div.vacancy-serp-item').each((index,element) => {
            const salary = $(element).find('span[data-qa=vacancy-serp__vacancy-compensation]').text().replace(/\s+/g, ''),
                vacancy = $(element).find('a[data-qa=vacancy-serp__vacancy-title]').text().trim(),
                vacancyLink = $(element)?.find('a[data-qa=vacancy-serp__vacancy-title]').attr('href');

            if (salary) {
                let item = {
                    vacancy,
                    salary,
                    vacancyLink
                }
                result.push(item);
            }
        });

        PAGE++;
        fetchHh(URL + PAGE);
        console.log(`Page number ${PAGE} indexed successfully!!!`);
    }

    if (!nav) {
        fs.writeFile('vacancy.json', JSON.stringify(result), (e) => {
            if (e) throw e;

            console.log('File saved successfully!!!');
        });
    }

    await browser.close();
};

fetchHh(URL + PAGE);