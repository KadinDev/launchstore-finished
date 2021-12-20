// ideia para juntar as repetições de código, para não ter que ficar repetindo o mesmo código
// para os arquivos.
// em HomeController, SearchController, e ProductController tinha muitos códigos iguais

const Product = require('../models/Product');
const { formatPrice, date } = require('../../lib/utils');

async function getImages(productId) {
    let files = await Product.files(productId)
    
    files = files.map
        (file => ({
            ...file,
            src: `${file.path.replace('public', '') }`
        }))
            
    return files
};


async function format(product){
    // aguardo o carregamento de todas as imgagens
    const files = await getImages(product.id)
    product.img = files[0].src
    product.files = files
    product.formattedOldPrice = formatPrice(product.old_price)
    product.formattedPrice = formatPrice(product.price)

    const { day, hour, minutes, month } = date(product.updated_at) // updated_at pega a hora atual

    product.published = { // data de publicação do produto
        day: `${day}/${month}`, // se deixar ${day - 1}, vai pegar da forma correta.
        hour: `${hour}h${minutes}`,
    }

    return product
}

const LoadService = {
    // service = o que irá carregar
    // filtro = o que irá usar
    load(service, filter) {

        this.filter = filter

        return this[service]()
    },

    // irá ler um produto, ou,
    async product(){
        try {
            
            const product = await Product.findOne(this.filter)
            return format(product) // esse format é da async function format(product)
        
        } catch (error) {
            console.log(error);
        }
    }, 
    
    // irá ler vários produtos
    async products(){
        try {
            const products = await Product.findAll(this.filter)
            const productsPromise = products.map( format ) //basta passar a função que ele vai entender
            // que tem que passar o produtc, e vai retornar um array de promessas, para o prodductsPromisse

            return Promise.all(productsPromise)

        } catch (error) {
            console.log(error);
        }
    },

    async productWithDeleted() {
        try {
            let product = await Product.findOneWithDeleted(this.filter)
            return format(product)      
        } catch (error) {
            console.log(error);
        }
    },

    format, // deixa aqui caso precise usar lá para todos
}

module.exports = LoadService;