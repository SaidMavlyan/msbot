var builder = require('botbuilder');
var Store = require('./store');

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

module.exports = {
    dialog: [
        function (session, args, next) {
            session.send('We are analyzing your message: \'%s\'', session.message.text);

            var pizzaEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'pizzaType');
            if (pizzaEntity) {
                session.dialogData.pizza = pizzaEntity.entity;
            }

            var vegTypeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'vegType');
            if (vegTypeEntity) {
                next({ response: vegTypeEntity.entity });
            } else {
                builder.Prompts.text(session, 'Please enter pizza type you are looking for? (vegetarian, normal):');
            }
        },
        function (session, results, next) {
            session.dialogData.vegType = results.response;

            if (session.dialogData.pizza) {
                next({ response: session.dialogData.pizza });
            } else {
                builder.Prompts.text(session, 'Please enter pizza name you are looking for?:');
            }
        },
        function (session, results) {
            var pizza = '';
            session.dialogData.pizza = results.response;
            if (session.dialogData.vegType === 'normal') {
                pizza = session.dialogData.pizza;
            } else {
                pizza = session.dialogData.vegType + ' ' + session.dialogData.pizza;
            }
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
    ]
}