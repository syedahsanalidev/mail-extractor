var MailListener = require("mail-listener2");
const dotenv = require('dotenv');
const rp = require('request-promise');
const puppeteer = require('puppeteer')
const $ = require('cheerio');
const fs = require('fs')
dotenv.config();

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
    searchFilter: ["UNSEEN", ["FROM", "hamza.arif5587@gmail.com"]], // the search filter being used after an IDLE notification has been retrieved
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
    var fs = require('fs');

    fs.appendFile('mynewfile1.txt', mail, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    let html = mail.eml
    const pp = function(html){
        const wikiUrls = [];
        for (let i = 0; i < 45; i++) {
            wikiUrls.push($('.google', html)[i]);
        }
        // attr('href').text('ACCEPT')
        // console.log($('a:contains("")', html).attr('href').text('ACCEPT'));
        console.log(wikiUrls);
    }
    pp(html)
    // mail processing code goes here
});

mailListener.on("attachment", function(attachment){
    console.log(attachment.path);
});
console.log('comig here')


// const url = 'http://www.choicehomewarranty.com/cads/accept.php?sid=E1sD2VMPbyPD_D7kTslTG93DNov79pjG9YCfHhznQwE&cid=DM6akUERsADdGj2vlX7mmXfm340i6tHJawNv0vW89h8&vid=44TJ-OW0pEvdb2Mz7qZ4HpOy8wxfDWBgwq-e-pk6jEE';
//
