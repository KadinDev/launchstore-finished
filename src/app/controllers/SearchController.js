const Product = require('../models/Product')
const LoadProductService = require('../services/LoadProductService');

module.exports = {

    async index( req, res ) {
        
        try {

            let { filter, category } = req.query

            // quando não vier filtro vou fazer para ser null
            // ou se vier 'toda a loja', será null tbm o resultado
            if ( !filter || filter.toLowerCase() == 'toda a loja' ) filter = null

            let products = await Product.search({ filter, category })

            const productsPromise = products.map( LoadProductService.format )

            products = await Promise.all(productsPromise)

            const search = {
                term: filter || 'Toda a loja', 
                total: products.length
            }


            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name

            })).reduce( (categoriesFiltered, category) => {
                /*reduce, fazendo ideia para não ficar repetindo
                o mesmo nome da categoria quando filtrarmos, se já tiver produtos da 
                mesma categoria, ele deixa o nome da categoria apenas uma vez */

                // procurar
                const found = categoriesFiltered.some(cat => cat.id == category.id)

                // se não tiver
                if (!found) categoriesFiltered.push(category)  

                return categoriesFiltered

            }, [] )

            return res.render('search/index', { products, search, categories } )
        }

        catch (err) {
            console.error(err)
        }


    }

}