const express = require('express');
const routes = express.Router();

const CartController = require('../app/controllers/CartController');
const { onlyUsers } = require('../app/middlewares/session');

routes.get('/', onlyUsers, CartController.index )
      .post('/:id/add-one', onlyUsers, CartController.addOne )
      .post('/:id/remove-one', CartController.removeOne )
      .post('/:id/delete', CartController.delete ) ;


module.exports = routes;