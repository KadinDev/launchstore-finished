// ECMAScript 6
// const, let
// template literals `string`
// spread operators { ...objeto } - [ ...array ]

// shorthand { a() } ex: 
    // const UserController = {
        // index () {} <- modo shorthand
    //}

    // arrow function () => {}


// class é tipo um molde do objeto, class é um contrutor de objeto
//class UserController {
//    registerForm(req, res) {
//        return res.redirect('/products')
//    }
//}

//module.exports = new UserController();


//================================================================
const { unlinkSync } = require('fs');
const { hash } = require('bcryptjs')

const User = require('../models/User')
const Product = require('../models/Product')

const { formatCep, formatCpfCnpj } = require('../../lib/utils')

const LoadProductService = require('../services/LoadProductService');

module.exports = {
    registerForm(req, res) {

        return res.render('user/register')
    },

    async show(req, res) {

        try {

            //pegando no req, após ter mandado no show do user.js
            const { user } = req

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)


            return res.render('user/index', {user})


        } catch (err) {
            console.error(err)
        }
        
        
    },

    async post(req, res) {
        
        try {

            let { name, email, password, cpf_cnpj, cep, address } = req.body

            password = await hash(password, 8)
            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")

            const userId = await User.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address 
            })

            /* depois de configurada a session e colocada no server.js, agora temos disponível
            ela no req. o userId será uma chave
            */
            req.session.userId = userId

            return res.redirect('/users')

        } catch (err) {
            console.error(err)
        }
        
    },

    async update (req, res) {
        try {
            const { user } = req;

            let { name, email, cpf_cnpj, cep, address } = req.body;

            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })

            return res.render('user/index', {
                user: req.body,
                success: 'Conta atualizada com sucesso!'
            })

        } catch (err) {
            console.error(err)
            return res.render('user/index', {
                error: "Algo deu errado!"
            } )
        }
    },

    async delete (req, res) {
        try {

            const products = await Product.findAll({ where: { user_id: req.body.id } })

            const allFilesPromises = products.map(product => 
            Product.files(product.id ))

            let promisseResults = await Promise.all(allFilesPromises)

            await User.delete(req.body.id)
            req.session.destroy()//tirando da sessão
            
            // remover as imagens da pasta public
            promisseResults.map(files => {
                files.map(file => {
                    try {
                        unlinkSync(file.path)
                    } catch (err) {
                        console.log(err)
                    }
                })
            })
            
            return res.render('session/login', {
                success: 'Conta deletada com sucesso!'
            })

        } catch(err) {
            console.error(err)
            return res.send('user/index', {
                user: req.body,
                error: "Erro ao tentar deletar sua conta!"
            })
        }
    },

    async ads ( req, res ) {
        const products = await LoadProductService.load('products', {
            // pegando somente os produtos do usuário logado
            where: { user_id: req.session.userId }

        } )

        return res.render("user/ads",{products} )

    }
}











