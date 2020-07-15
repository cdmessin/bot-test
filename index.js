//Webex Bot Starter - featuring the webex-node-bot-framework - https://www.npmjs.com/package/webex-node-bot-framework

var framework = require('webex-node-bot-framework');
var webhook = require('webex-node-bot-framework/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(express.static('images'));
const config = require("./config.json");

// init framework
var framework = new framework(config);
framework.start();
console.log("Starting framework, please wait...");

framework.on("initialized", function() {
    console.log("framework is all fired up! [Press CTRL-C to quit]");
});

// A spawn event is generated when the framework finds a space with your bot in it
// If actorId is set, it means that user has just added your bot to a new space
// If not, the framework has discovered your bot in an existing space
framework.on('spawn', (bot, id, actorId) => {
    if (!actorId) {
        // don't say anything here or your bot's spaces will get
        // spammed every time your server is restarted
        console.log(`While starting up, the framework found our bot in a space called: ${bot.room.title}`);
    } else {
        // When actorId is present it means someone added your bot got added to a new space
        // Lets find out more about them..
        var msg = 'You can say `help` to get the list of words I am able to respond to.';
        bot.webex.people.get(actorId).then((user) => {
            msg = `Hello there ${user.displayName}. ${msg}`;
        }).catch((e) => {
            console.error(`Failed to lookup user details in framwork.on("spawn"): ${e.message}`);
            msg = `Hello there. ${msg}`;
        }).finally(() => {
            // Say hello, and tell users what you do!
            if (bot.isDirect) {
                bot.say('markdown', msg);
            } else {
                let botName = bot.person.displayName;
                msg += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${botName}.`;
                bot.say('markdown', msg);
            }
        });
    }
});


//Process incoming messages

let responded = false;
/* On mention with command
ex User enters @botname help, the bot will write back in markdown
*/
framework.hears(/help|what can i (do|say)|what (can|do) you do/i, function(bot, trigger) {
    console.log(`someone needs help! They asked ${trigger.text}`);
    responded = true;
    bot.say(`Hello ${trigger.person.displayName}.`)
        .then(() => sendHelp(bot))
        .catch((e) => console.error(`Problem in help hander: ${e.message}`));
});

/* On mention reply example
ex User enters @botname 'reply' phrase, the bot will post a threaded reply
*/
framework.hears('reply', function(bot, trigger) {
    console.log("someone asked for a reply.  We will give them two.");
    responded = true;
    bot.reply(trigger.message,
        'This is threaded reply sent using the `bot.reply()` method.',
        'markdown');
    var msg_attach = {
        text: "This is also threaded reply with an attachment sent via bot.reply(): ",
        file: 'https://media2.giphy.com/media/dTJd5ygpxkzWo/giphy-downsized-medium.gif'
    };
    bot.reply(trigger.message, msg_attach);
});

/* On mention with unexpected bot command
   Its a good practice is to gracefully handle unexpected input
*/
framework.hears(/.*/, function(bot, trigger) {
    // This will fire for any input so only respond if we haven't already
    if (!responded) {
        console.log(`catch-all handler fired for user input: ${trigger.text}`);
        bot.say(`Sorry, I don't know how to respond to "${trigger.text}"`)
            .then(() => sendHelp(bot))
            .catch((e) => console.error(`Problem in the unexepected command hander: ${e.message}`));
    }
    responded = false;
});

function sendHelp(bot) {
    bot.say("markdown", 'These are the commands I can respond to:', '\n\n ' +
        '1. **reply** (have bot reply to your message) \n' +
        '2. **help** (what you are reading now)');
}


//Server config & housekeeping
// Health Check
app.get('/', function(req, res) {
    res.send(`I'm alive.`);
});

app.get('/message', function(req, res) {
    framework.webex.messages.create({
        roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vMTExMjg2NjAtYzVlOS0xMWVhLWFkZmQtMDdiYjAzMDIxZjNl',
        text: 'Someone accessed the message endpoint'
    });
    res.sendStatus(200);
});
app.post('/graylog', function(req, res) {
    console.log(req.body);
    if (req.body) {
        frameworkwebex.rooms.list({
          })
            .then(function(rooms) {
                for (var i = 0; i < rooms.items.length; i+= 1) {
                    framework.webex.messages.create({
                        //roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vMTExMjg2NjAtYzVlOS0xMWVhLWFkZmQtMDdiYjAzMDIxZjNl',
                        roomId: rooms.items[i].id,
                        text: 'req body: ' + req.body.event_definition_description
                    });
                  }
          
            return 'success';
          })

        //roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vMTExMjg2NjAtYzVlOS0xMWVhLWFkZmQtMDdiYjAzMDIxZjNl',
        res.sendStatus(200);
    } else {
        res.status(400).send('Bad Request, Missing Body')
    }

});

app.post('/', webhook(framework));

var server = app.listen(config.port, function() {
    framework.debug('framework listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
    framework.debug('stoppping...');
    server.close();
    framework.stop().then(function() {
        process.exit();
    });
});