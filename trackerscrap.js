const puppeteer = require('puppeteer');
const fs = require('fs');

const CATEGORIES = {
    phones: 'https://www.trackerstore.com.br/lista/celulares-telefones/celulares-smartphones/',
    info1: 'https://www.trackerstore.com.br/lista/informatica/',
    info2: 'https://www.trackerstore.com.br/lista/informatica/_Desde_49_OrderId_PRICE_NoIndex_True'
};

async function scrapeCategory(url, categoryName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log(`Acessando URL: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('li.ui-search-layout__item');

        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('li.ui-search-layout__item')).map(item => {
                const name = item.querySelector('a.poly-component__title')?.innerText.trim() || 'N/A';
                const price = item.querySelector('div.poly-price__current span.andes-money-amount__fraction')?.innerText.trim() || 'N/A';
                const link = item.querySelector('a.poly-component__title')?.href || 'N/A';
                return { name, price, link };
            });
        });

        console.log(`Dados extraídos para ${categoryName}`);
        return { category: categoryName, items };
    } catch (error) {
        console.error(`Erro ao executar o scraper para ${categoryName}:`, error);
        return { category: categoryName, items: [] };
    } finally {
        await browser.close();
    }
}

async function scrapeAllCategories() {
    const allData = [];

    for (const [categoryName, url] of Object.entries(CATEGORIES)) {
        const categoryData = await scrapeCategory(url, categoryName);
        allData.push(categoryData);
    }

    fs.writeFileSync('all_categories.json', JSON.stringify(allData, null, 2), 'utf-8');
    console.log('Dados salvos no arquivo all_categories.json');
}

scrapeAllCategories();
