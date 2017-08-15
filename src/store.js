var Promise = require('bluebird');

module.exports = {
    searchPizzas: function (pizza) {
        return new Promise(function (resolve) {
            var pizzas = [];
            // Filling the results manually just for demo purposes
            for (var i = 1; i <= 2; i++) {
                pizzas.push({
                    name: pizza + ' pizza ' + i,
                    price: Math.ceil(Math.random() * 50) + 150,
                    ingredients: 'Flour, olives, onion...',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=' + pizza + i + '&w=500&h=260'
                });
            }

            pizzas.sort(function (a, b) { return a.price - b.price; });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(pizzas); }, 1000);
        });
    },
};
