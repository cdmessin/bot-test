//Example code taken from Webex Bot Starter
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


/* On mention with unexpected bot command
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
    bot.say("markdown", 'I will alert this space of high 5xx and 47x responses on both external and internal clusters.');
}


//Server config & housekeeping
// Health Check
app.get('/', function(req, res) {
    res.send(`I'm alive.`);
});

/* What to do when graylog contacts the server.
  Sends the event description as a message to all group rooms that the bot is a part of
 */
app.post('/graylog', function(req, res) {
    console.log(req.body);
    //Ensures post request contains an event description in the body
    if (req.body.event_definition_description) {
        //Gets list of all rooms that the bot is in
        framework.webex.rooms.list({})
            .then(function(rooms) {
                for (var i = 0; i < rooms.items.length; i += 1) {
                    //Messages only rooms that are not direct rooms
                    if (rooms.items[i].type != 'direct') {
                        framework.webex.messages.create({
                            roomId: rooms.items[i].id,
                            text: 'Alert!: ' + req.body.event_definition_description
                        });
                    }
                }
                return 'success';
            })
        res.sendStatus(200);
    } else {
        res.status(400).send('Bad Request, Missing Body')
    }

});

//This is the endpoint that is automatically called when the bot is mentioned or added to a room.
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