const Base = require('./Base');

Base.init({ table: 'orders' }) //iniciando ele aqui

module.exports = {

    ...Base,
}