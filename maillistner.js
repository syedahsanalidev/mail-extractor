var MailListener = require("mail-listener2");
const dotenv = require('dotenv');
const fs = require('fs')
const chromeLauncher = require('chrome-launcher');


dotenv.config();
const { Chromeless } = require('chromeless')



const username = process.env.APPUSER;
const password = process.env.PASSWORD;
console.log("user", process.env.APPUSER);

var mailListener = new MailListener({
    username: username,
    password: password,
    host: "imap.gmail.com",
    port: 993, // imap port
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    mailbox: "INBOX", // mailbox to monitor
    searchFilter: ["UNSEEN", ["FROM", "customerservice@choicehomewarranty.com"]], // the search filter being used after an IDLE notification has been retrieved
    markSeen: true, // all fetched email willbe marked as seen and not fetched next time
    attachments:true
});

module.exports.startListening = function(){
    mailListener.start(); // start listening
}
mailListener.start();
// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){

    console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
    console.log("imapDisconnected");
});

mailListener.on("error", function(err){
    console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){
    // do something with mail object including attachments
    console.log("emailParsed", mail);
    console.log("you received email from", mail.from);
    console.log("you'r received email subject is", mail.subject);

    var sid = mail.eml.split('http://www.choicehomewarranty.com/cads/accept.php?sid=')[1].split('=')[0]

    async function run() {
        const chromeless = new Chromeless()
        console.log("i am in chromeless")
        const screenshot = await chromeless
            .goto('http://www.choicehomewarranty.com/cads/accept.php?sid=' + sid)
            .press(9)
            .press(32)
            .press(13)
            .screenshot()
            .html()
        console.log("hi i m screenshot" + screenshot ) /// prints local file path or S3 url
        let timestemp = new Date()
            timestemp = timestemp.toString()
        let finalData = timestemp + "</br>" +screenshot
        fs.appendFile("logs.html", finalData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("logs saved in logs.html");
        });

        await chromeless.end()
    }

    run().catch(console.error.bind(console))


//     let html = mail.eml
//     const pp = function(html){
//            // success!
//            //  const wikiUrls = [];
//            //  for (let i = 0; i < 2; i++) {
//            //      wikiUrls.push($('.google', html).text());
//            //  }
//
//         let links = [];
//         let $ = cheerio.load(html);
//         for (let i = 1; i < 10; i++) {
//         $('.CToWUd').each( (index, value) => {
//             let link = $(value).attr('href');
//             links.push({"link": link});
//         });
//         }
//
//         console.log(links);
//         // attr('href').text('ACCEPT')
//        // console.log($('a:contains("")', html).attr('href').text('ACCEPT'));
//        //      console.log(wikiUrls);
//         }
//         pp(html)
//     // mail processing code goes here
//     async function run() {
//         const chromeless = new Chromeless()
//         const click = await chromeless
//         .click('.CToWUd')
//     console.log(click) // prints local file path or S3 url
//
//     await chromeless.end()
// }

    // run().catch(console.error.bind(console))
});

mailListener.on("attachment", function(attachment){
    console.log(attachment.path);
});
console.log('comig here')


// const url = 'http://www.choicehomewarranty.com/cads/accept.php?sid=E1sD2VMPbyPD_D7kTslTG93DNov79pjG9YCfHhznQwE&cid=DM6akUERsADdGj2vlX7mmXfm340i6tHJawNv0vW89h8&vid=44TJ-OW0pEvdb2Mz7qZ4HpOy8wxfDWBgwq-e-pk6jEE';
//