const Base = require('./Base');

Base.init({ table: 'users' }) //iniciando ele aqui

module.exports = {
    ...Base, 
}


