// //Getting WikiPage Data
// const rp = require('request-promise');
// const url = 'http://www.choicehomewarranty.com/cads/accept.php?sid=E1sD2VMPbyPD_D7kTslTG93DNov79pjG9YCfHhznQwE&cid=DM6akUERsADdGj2vlX7mmXfm340i6tHJawNv0vW89h8&vid=44TJ-OW0pEvdb2Mz7qZ4HpOy8wxfDWBgwq-e-pk6jEE';
//
// rp(url)
//     .then(function(html){
//         //success!
//         console.log(html);
//     })
//     .catch(function(err){
//         //handle error
//     });


var http = require('http');
const puppeteer = require('puppeteer');

function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("http://www.choicehomewarranty.com/cads/accept.php?sid=E1sD2VMPbyPD_D7kTslTG93DNov79pjG9YCfHhznQwE&cid=DM6akUERsADdGj2vlX7mmXfm340i6tHJawNv0vW89h8&vid=44TJ-OW0pEvdb2Mz7qZ4HpOy8wxfDWBgwq-e-pk6jEE");
            // await page.type('username', 'username');
            await page.waitForSelector('.CToWUd');
            await page.focus('.CToWUd');
            await page.click('.CToWUd');
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('div.CToWUd');
                items.forEach((item) => {
                    results.push({
                        url:  item.getAttribute('href'),
                        text: item.innerText,
                    });
                });
                return results;
            })
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Hello World!');
    res.end();
}).listen(8080)