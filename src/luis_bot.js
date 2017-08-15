require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./store');

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

bot.dialog('SuggestPizza', [
    function (session, args, next) {
        session.send('We are analyzing your message: \'%s\'', session.message.text);
        Store
            .suggestPizza()
            .then(function (pizzas) {
                session.send('I can suggest to taste one of these:');

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(pizzas.map(pizzaAsAttachment));

                session.send(message);
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'SuggestPizza'
});

bot.dialog('SearchPizza', [
    function (session, args, next) {
        session.send('We are analyzing your message: \'%s\'', session.message.text);

        var pizzaEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'pizzaType');
        if (pizzaEntity) {
            next({ response: pizzaEntity.entity });
        } else {
            builder.Prompts.text(session, 'Please enter pizza type you are looking for.');
        }
    },
    function (session, results) {
        var pizza = results.response;
        var message = 'Looking for ' + pizza;
        session.send(message);

        Store
            .searchPizzas(pizza)
            .then(function (pizzas) {
                session.send('I found %d pizzas:', pizzas.length);

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(pizzas.map(pizzaAsAttachment));

                session.send(message);
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'SearchPizza'
});

bot.dialog('ShowPizzaDesc', [
    function (session, args, next) {
        var pizzaEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'pizzaType');
        if (pizzaEntity) {
            next({ response: pizzaEntity.entity });
        } else {
            builder.Prompts.text(session, 'Please enter pizza type you want to view.');
        }
    },
    function (session, results) {
        var pizza = results.response;
        var message = 'Looking for ' + pizza + '...';
        session.send(message);

        // Async search
        Store.searchPizzaDesc(pizza)
            .then(function (descriptions) {
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(descriptions.map(describeAsAttachement));
                session.endDialog(message);
            });
    }
]).triggerAction({
    matches: 'ShowPizzaDesc'
});

bot.dialog('Help', function (session) {
    session.endDialog('Try asking me things like \'Do you have chicken pizza?\', \'Show description of margherita\' or \'List special offers\'');
}).triggerAction({
    matches: 'Help'
});

// Helpers
function pizzaAsAttachment(pizza) {
    return new builder.HeroCard()
        .title(pizza.name)
        .subtitle('%s\n\rIngredients: %s\n\rPrice: %d btc', pizza.name, pizza.ingredients, pizza.price)
        .images([new builder.CardImage().url(pizza.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=' + encodeURIComponent(pizza.name))
        ]);
}

function describeAsAttachement(description) {
    return new builder.ThumbnailCard()
        .title(description.title)
        .text(description.text)
        .images([new builder.CardImage().url(description.image)]);
}
