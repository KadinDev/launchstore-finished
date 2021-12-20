// Base terá uns padrões, onde os outros arquivos dessa pasta models irá herdar, ou seja,
// será uma "base" para eles

const db = require('../../config/db');

function find(filters, table) {
    try {
      let query = `SELECT * FROM ${table}`
  
      if (filters) {
        Object.keys(filters).map(key => {
          query += ` ${key}` //manter esse espaço para funcionar ` ${key}
  
          Object.keys(filters[key]).map(field => {
            query += ` ${field} = '${filters[key][field]}'`
          })
        })
      }
  
      return db.query(query)
    } catch (err) {
      console.error(err)
    }
};

const Base = {
    init({ table }) {
        if(!table) throw new Error('Invalid Params')

        // o this significa que estou falando desse objeto base
        this.table = table

        return this
    },

    async find(id){
        //esse find vem de fora
        const results = await find({ where: {id}}, this.table)
        return results.rows[0] 
    },

    async findOne(filters){
        //esse find vem de fora
        const results = await find(filters, this.table)
        return results.rows[0] // 0 por que estou procurando um só
    },

    async findAll(filters){
        //esse find vem de fora
        const results = await find(filters, this.table)
        return results.rows
    },

    // buscar produtos deletados
    async findOneWithDeleted(filters) {
        const results = await find(filters, `${this.table}_with_deleted` )
        return results.rows[0]
    },

    // essa é a ideia de create para todos
    async create(fields) { // User.create({ name: 'Nome' })
        try {

            let keys = [],
            values = []


            Object.keys(fields).map( key => {
                // keys
                // name, age, address
                // index + 1, os primeiros elementos receberão virgúlas
                /*if( (index + 1) < array.length ) {
                    keys += `${key},`
                    values += `${fields[key]},`
                } else {
                    // se não, é a mesma ideia porém sem vírgula no final
                    keys += `${key}`
                    values += `${fields[key]}`

                }*/

                //somente essas duas linhas já substitui todo o if acima
                keys.push(key)
                values.push(`'${fields[key]}'`)

            } )

            const query = `INSERT INTO ${this.table} (${keys.join( ',' )})
                VALUES (${values.join(',')})
                RETURNING id
            `

            const results = await db.query(query)
            return results.rows[0].id

        } catch (err) {
            console.error(err);
        }
    },

    update(id, fields) {

        try {

            let update = []

            Object.keys(fields).map( key => {
                
                // category_id=($1)
                const line = `${key} = '${fields[key]}'`
                update.push(line) //colocando line dentro do array de update acima
                
            })

            let query = `UPDATE ${this.table} SET
            ${update.join(',')} WHERE id = ${id}
            `
            
            return db.query(query)
             

        } catch (err){
            console.error(err);
        }
    },

    delete(id) {
        return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id] )
    }
}

module.exports = Base