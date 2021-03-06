const MailListener = require("mail-listener2");
const dotenv = require('dotenv');
const fs = require('fs')
const axios = require('axios')
const json = require("./db.json")
dotenv.config();
const { Chromeless } = require('chromeless');
const schedule = require('node-schedule');

const username = process.env.APPUSER;
const password = process.env.PASSWORD;
console.log("user", username);

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 18;
rule.minute = 50;

var j = schedule.scheduleJob(rule, function(){
    clearAvailabilities()
});


const clearAvailabilities = async () => {
    console.log("Starting crone job at" + new Date() )
    let date = new Date()
    let day = date.getDay()
    console.log("m here")
    if (day > 1) {
        await axios.get(`http://localhost:3000/days?day_lte=${day-1}`).then(days => {
            days.data.map(dataDay => {
                axios.delete(`http://localhost:3000/days/${dataDay.id}`);
            });
        });
        // for (let i=1; i<day;i++) {

        // }
        // console.log("before removing item", json.days)
        // json.days.splice(0,day)
        // axios.get(`http://localhost:3000/posts/days?_start=0&_end=${day}`).then(function (res){
        //     console.log("response" + res)
        // })
        // console.log("cleared")
        // console.log(json.days)
        console.log("Job completed closing process")
    }
}


var mailListener = new MailListener({
    username: process.env.APPUSER,
    password: process.env.PASSWORD,
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
    // console.log("emailParsed", mail);
    console.log("you received email from:", mail.from);
    console.log("you'r received email subject is:", mail.subject);
    // console.log("you'r received email date is", mail.date);
    var sid = mail.eml.split('http://www.choicehomewarranty.com/cads/accept.php?sid=')[1].split('=')[0]
    var recivingDay = mail.eml.split('Date: ')[1].split(',')[0]
    var recevingLocation = mail.eml.split('LOCATION: <strong>')[1].split('</strong></p>')[0]
    //fetchin location and checking availbilty
    {
        var fetchOrder = json.cities.map(holders=> holders.cities)
        // console.log(fetchOrder)
        console.log("Mail Receiving day:", recivingDay)
        console.log("Order location:", recevingLocation)
        let cityGroupIndex = -1;
        let cityGroupName = null;
        const city = recevingLocation;
        const db_day = recivingDay;
        // console.log(city)
        // console.log(db_day)
        var availability = false;
        json.cities.map((item, index) => {
            item.cities.map((innerItem, innerIndex) => {
                if (innerItem.toLowerCase() === city.toLowerCase()) {
                    cityGroupIndex = index;
                    return false;
                }
            });
        });
        if (cityGroupIndex > -1) {
            cityGroupName = json.cities[cityGroupIndex].group;
            json["week-schedule"].map((schedule, s) => {
                schedule.days.map((day, d) => {
                    if (day.day.toLowerCase() === db_day.toLowerCase()) {
                        day.cities.map((city, c) => {
                            if (city.city.toLowerCase() === cityGroupName.toString().toLowerCase()) {
                                availability = city.availability;
                            }
                        })
                    }
                });
            });
        }
        console.log("You received mail on: ", db_day);
        console.log("Your receiving mail belongs to:",cityGroupName);
        console.log("Your availability is: ", availability);
    }

    //

    if (availability){
        async function run() {
            const chromeless = new Chromeless()
            console.log("i am in chromeless")
            const screenshot = await chromeless
                .goto('http://www.choicehomewarranty.com/cads/accept.php?sid=' + sid)
                // .press(9)
                // .press(32)
                // .press(13)
                // .screenshot()
                .html()
            // console.log("hi i m screenshot" + screenshot ) /// prints local file path or S3 url
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
    }
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

// const url = 'http://www.choicehomewarranty.com/cads/accept.php?sid=E1sD2VMPbyPD_D7kTslTG93DNov79pjG9YCfHhznQwE&cid=DM6akUERsADdGj2vlX7mmXfm340i6tHJawNv0vW89h8&vid=44TJ-OW0pEvdb2Mz7qZ4HpOy8wxfDWBgwq-e-pk6jEE';
//