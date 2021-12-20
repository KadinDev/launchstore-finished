const db = require('../../config/db')
const Base = require('./Base');

Base.init({ table: 'products' }) //iniciando ele aqui

module.exports = {

    ...Base,

    async files(id) {
        const results = await db.query(`
            SELECT * FROM files WHERE product_id = $1
        `, [id])

        return results.rows
    },

    async search( { filter, category } ) {

        let query = `
            SELECT products.*,
                categories.name AS category_name
            FROM products
            LEFT JOIN categories ON (categories.id = products.category_id)
            WHERE 1 = 1
        `

        if (category) {
            // se tiver categoria
            query += `AND products.category_id = ${category}`
        }

        if (filter) {
            query += `AND (products.name ilike '%${filter}%'
                      OR products.description ilike '%${filter}%')`
        }
        
        query += ` AND status != 0 `

        const results = await db.query(query)
        return results.rows
    }
}

