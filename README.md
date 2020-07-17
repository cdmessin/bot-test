# BDB-Alert-Bot

This Webex bot receives alerts from Graylog and messages all Webex team spaces that the bot is in with the corresponding event message.

## Prerequisites:

- [ ] node.js (minimum supported v8.0.0 & npm 2.14.12 and up)

- [ ] Server with open port 7001

- [ ] Sign up for Webex Teams (logged in with your web browser)
----

## Steps to get the bot working

1. Create a new [bot](https://developer.webex.com/my-apps/new/bot/)

2. Clone application on server.

3. Set two environment variables, ```WEBHOOK_URL``` to be the servers http address, port 7001 and ```BOT_TOKEN``` to be the Bot Access Token that was given upon creation.

4. Turn on your bot server with ```npm start```

5. Add the bot (by its username @BDB-Alerts) to a space in Webex Teams

6. Navigate to Graylog -> Alerts -> Notifications and click "Add Notification"

7. Select HTTP Notification and enter http://server-name:7001/graylog as the  address

8. While creating a new event under "Event Definitions" add the bot to the notifcation step

### Credits
Initial template was created from [webex-bot-starter](https://github.com/WebexSamples/webex-bot-starter).

API's refrenced for further expansion of the bot can be found here:
 - [js-sdk API](https://webex.github.io/webex-js-sdk/api/)
 - [webex-node-bot-framework](https://github.com/webex/webex-node-bot-framework)
 