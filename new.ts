const MailListenerClient = require("mail-listener2");
const cheerio = require('cheerio');
const simpleParser = require('mailparser').simpleParser;
export class MailListener {

    public mailListener:any;

    constructor() {
        this.mailListener = new MailListenerClient({
            username: "",
            password: "",
            host: "imap.gmail.com",
            port: 993,
            tls: true,
            mailbox: "INBOX",
            searchFilter: ["UNSEEN", ["FROM", "fromemail@gmail.com"],["SUBJECT","subject of the email"]],
            /*it will search for are "unseen" mail send from "fromemail@gmail.com" with subject "fromemail@gmail.com"*/
            connTimeout: 10000,
            authTimeout: 5000,
            markSeen: true,
            mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
            attachments: true, // download attachments as they are encountered to the project directory
            attachmentOptions: {directory: "attachments/"},
            debug : console.log
        });
    }

    init() {
        this.mailListener.start();
    }

    close() {
        this.mailListener.stop();
    }


    getLinkFromEmail() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.mailListener.on("mail", function (mail) {
                /*simpleParser is used to convert string to HTML format*/
                simpleParser(mail.eml).then(function (parsedEmail) {
                    var html = parsedEmail.html;
                    /* cheerio is used to write query on parsed HTML content
                     * refer https://www.npmjs.com/package/cheerio
                     */
                    resolve(cheerio.load(html)("a").attr("href"));
                });
            });

            self.mailListener.on("error", function (err) {
                reject(err);
            });
        });
    }

}