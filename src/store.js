var Promise = require('bluebird');

var pizzaTypes = ['Cheese pizza', 'Margherita', 'Mexican pizza', 'Fantastico pizza', 'Chicago pizza'];

module.exports = {
    searchPizzas: function (pizza) {
        return new Promise(function (resolve) {
            var pizzas = [];
            // Filling the results manually just for demo purposes
            for (var i = 1; i <= 5; i++) {
                pizzas.push({
                    name: pizza + ' pizza ' + i,
                    price: Math.ceil(Math.random() * 50) + 150,
                    ingredients: 'Flour, olives, chicken, onion...',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=' + pizza + i + '&w=500&h=260'
                });
            }

            pizzas.sort(function (a, b) { return a.price - b.price; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(pizzas); }, 1000);
        });
    },

    suggestPizza: function () {
        return new Promise(function (resolve) {
            var pizzas = [];
            // Filling the results manually just for demo purposes
            for (var i = 1; i <= 3; i++) {
                pizzas.push({
                    name: pizzaTypes[i],
                    price: Math.ceil(Math.random() * 50) + 150,
                    ingredients: 'Flour, olives, chicken, onion...',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=' + pizzaTypes[i] + '&w=500&h=260'
                });
            }

            pizzas.sort(function (a, b) { return a.price - b.price; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(pizzas); }, 700);
        });
    },

    searchPizzaDesc: function (pizzaName) {
        return new Promise(function (resolve) {
            // Filling the results manually just for demo purposes
            var description = {
                title: pizzaName,
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris odio magna, sodales vel ligula sit amet, vulputate vehicula velit. Nulla quis consectetur neque, sed commodo metus.',
                image: 'https://placeholdit.imgix.net/~text?txtsize=45&txt=' + pizzaName + '&w=500&h=500'
            };

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve([description]); }, 500);
        });
    },
};
