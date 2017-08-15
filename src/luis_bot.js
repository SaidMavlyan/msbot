require('dotenv-extended').load();
var builder = require('botbuilder');
var restify = require('restify');
var SearchDialogs = require('./dialog');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('SearchPizza', SearchDialogs.dialog)
    .triggerAction({ matches: 'SearchPizza' });

bot.dialog('Help', function (session) {
    var msg = 'Try asking me things like \'Do you have vegetarian cheese pizza?\', ';
    session.endDialog(msg);
}).triggerAction({ matches: 'Help' });

