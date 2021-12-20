const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

//configuração para redirecionar caso o user não esteja logado
//não terá permissão para criar produto
const { onlyUsers } = require('../app/middlewares/session');

// validação do fomulário que criei em um js separado
const Validator = require('../app/validators/product');

// Search - coloca antes dos de baixo para poder funcionar corretamente
routes.get('/search', SearchController.index );

// Products
routes.get('/create', onlyUsers, ProductController.create );
routes.get('/:id', ProductController.show );
routes.get('/:id/edit',  onlyUsers, ProductController.edit );

routes.post('/', onlyUsers, multer.array('photos', 6), Validator.post, ProductController.post );
routes.put('/', onlyUsers, multer.array('photos', 6), Validator.put, ProductController.put );
routes.delete('/', onlyUsers, ProductController.delete );

module.exports = routes;