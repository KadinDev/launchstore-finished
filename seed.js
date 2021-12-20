// Seeds de Usuários com Faker
// arquivo com dados e users fakes, para testar nossa aplicação

// npm install faker
const faker = require('faker')
const { hash } = require('bcryptjs')

const User = require('./src/app/models/User')
const Product = require('./src/app/models/Product')
const File = require('./src/app/models/File')

let usersIds = []
let totalProducts = [10]
let totalUsers = 3

async function createUsers() {
    const users = []
    const password = await hash('1111', 8) // create password fixed for alls

    while (users.length < totalProducts) {

        users.push({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password,
            cpf_cnpj: faker.random.number(99999999),
            cep: faker.random.number(9999999999),
            address: faker.address.streetName(),
        })
    }

    const usersPromisse = users.map(user => User.create(user))

    usersIds = await Promise.all(usersPromisse)

}

async function createProducts () {
    let products = []
    
    while (products.length < totalProducts ) {
        products.push({
            category_id:  Math.ceil(Math.random() * 3), // Math.ceil arredonda o numero para cima
            user_id: usersIds[ Math.floor(Math.random() * totalUsers) ], // Math.floor arredonda sempre para baixo
            name: faker.name.title(Math.random() * 2),
            description: faker.lorem.paragraph( Math.ceil(Math.random() * 10 )), //coloca parágrafo, e digo quantos quero,
            //no caso aqui usei random * 10 (no máximo de 1 a 10 paragrafos)

            old_price: faker.random.number(9999),
            price: faker.random.number(9999),
            quantity: faker.random.number(99),
            status: Math.round(Math.random()) // random vai do 0 a 1, o round vai arredondar
            //para o mais próximo
        })

    }

    const productsPromise = products.map(product => Product.create(product) )
    productsIds = await Promise.all(productsPromise)

    let files = []

    while(files.length < 50) {
        files.push({
            name: faker.image.image(),//coloca uma url de imagem
            path: `public/images/placeholder.png`,
            product_id: productsIds[Math.floor(Math.random() * totalProducts )]
        })
    }

    const filesPromisse = files.map( file => File.create(file) )

    await Promise.all(filesPromisse)
}

// função para executar da forma correta, na sequencia correta
async function init() {
    await createUsers() // await espera pelo createUsers
    await createProducts() // espera pelo createProducts
}

init()

// para rodar o seed.js = node seed.js