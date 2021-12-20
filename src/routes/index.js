const express = require('express');
const routes = express.Router();

const HomeController = require('../app/controllers/HomeController');

const products = require('./products');
const users = require('./users');

const cart = require('./cart'); //carrinho de compras
const orders = require('./orders'); 


routes.get('/', HomeController.index );

// mesma ideia dos users abaixo
routes.use('/products', products);

// aqui exporto o users, ele vai exportar adicionando /users na frente
routes.use('/users', users)
// vai adicionar em todos as rotas exportadas em users

routes.use('/cart', cart) //carrinho de compras
routes.use('/orders', orders)

// Alias = significa atalhos
routes.get('/ads/create', function( req, res ){
    return res.redirect('/products/create')
});

routes.get('/accounts', function(req, res) {
    return res.redirect('/users/login')
})

module.exports = routes;