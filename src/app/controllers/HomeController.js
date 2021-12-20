const LoadProductService = require('../services/LoadProductService');

module.exports = {

    async index( req, res ) {
        try {
            //aqui pego no LoadProductService, o load. e quero a parte de products
            const allProducts = await LoadProductService.load('products')
            const products = allProducts
            .filter((product, index) => index > 2 ? false : true ) // pega o product e o index

            return res.render('home/index', { products } )
        }
        catch (err) {
            console.error(err)
        }

    }

}