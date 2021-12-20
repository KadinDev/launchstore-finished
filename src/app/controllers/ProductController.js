const { unlinkSync } = require('fs');

const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')
const LoadProductService = require('../services/LoadProductService');

module.exports = {
    async create(req, res){

        try {

            const categories = await Category.findAll()
            return res.render('products/create', { categories } )

        }  catch (err) {
            console.error(err)
        }

        // Pegar Categorias

        // then = então  // results = retornar com os resultados da busca dentro do Category.all
        // then faz parte do Promises = promessas

        // array de categorias que buscou no banco de dados       
    },

    // para cada função que usar o await coloca o async no começo
    async post(req, res){

        try {

            let { category_id, name, description, old_price, price, quantity, status } = req.body 

            price = price.replace(/\D/g,"")

            const product_id = await Product.create( {
                category_id, 
                user_id: req.session.userId,
                name, 
                description, 
                old_price: old_price || price, //se tiver e caso não tenha
                price, 
                quantity, 
                status: status || 1 //se tiver, caso nao tenha coloca 1
            } )

            // criando array de promessas
            // o map vai retornar um array              // aqui esta retornando uma promisse
            const filesPromise = req.files.map( file => File.create({ name: file.filename, path: file.path, product_id }) )

            // e passo o array de promises pro Promise.all
            // ele espera todas as promises serem executadas
            await Promise.all( filesPromise )

            return res.redirect(`/products/${product_id}/edit`)

            } catch (err) {
                console.error(err)
            }

            // Lógica de Salvar
            // async await é a ideia de trabalhar com promisse sem fazer cadeia do .then
    },

    async show(req, res){

        try {

            const product = await LoadProductService.load('product', {
                where: {
                    id: req.params.id
                }
            } ) 
        

            return res.render('products/show', { product } )

        } catch (err) {
            console.error(err)
        }
        
        
    },

    async edit(req, res){


        try {

            const product = await LoadProductService.load('product', {
                where: {
                    id: req.params.id
                }
            } )

            // pegando categorias
            const categories = await Category.findAll()

            return res.render('products/edit', { product, categories })

        } catch (err) {
            console.error(err)
        }

        

    },

    async put(req, res){

        try {
            
            // lógica para pegar as novas fotos no momento da edição
            if ( req.files.length != 0 ) {
                const newFilesPromise = req.files.map(file => 
                    File.create( { ...file, product_id: req.body.id } ))

                await Promise.all(newFilesPromise)
            }

            if ( req.body.removed_files ) {
                // 1,2,3,
                const removedFiles = req.body.removed_files.split(",") // separar por , // aqui vai devolver um array [1,2,3, ]
                
                //remove end position do Array
                const lastIndex = removedFiles.length - 1

                // tira uma posição do lastIndex
                removedFiles.splice(lastIndex, 1) // [1,2,3]

                const removedFilesPromisse = removedFiles.map(id => File.delete(id))

                // await Promise.all, await ele espera. 
                //eu espero pelo removedFilesPromisse 
                await Promise.all(removedFilesPromisse)
            }

            req.body.price = req.body.price.replace(/\D/g, '' )
            // atualizando preço
            if ( req.body.old_price != req.body.price){
                // coloca const, e vou buscar(await) no Product.find o req.body.id
                const oldProduct = await Product.find(req.body.id)
                req.body.old_price = oldProduct.price
            }

            await Product.update( req.body.id, {
                category_id: req.body.category_id,
                name: req.body.name,
                description: req.body.description,
                old_price: req.body.old_price,
                price: req.body.price,
                quantity: req.body.quantity,
                status: req.body.status,
            })

            return res.redirect(`/products/${req.body.id}`)

        } catch (err) {
            console.error(err)
        }

    },

    async delete(req, res){

        const files = await Product.files(req.body.id)

        await Product.delete(req.body.id)

        files.map(file => {
            try {
                unlinkSync(file.path)
            } catch (err) {
                console.error(err)
            }
        })

        return res.redirect('/products/create')
    }
}