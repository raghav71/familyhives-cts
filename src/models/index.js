const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const lodash = require("lodash");

const env = require("dotenv")
    .config({path: __dirname + "/../../config/.env"})
    .parsed

const db = {};
console.log("env");
console.log(env);
const dbOptions = {
    port: env.db_port,
    host: env.db_host_rds,
    dialect: env.db_dialect
    /*dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    }*/,
    pool: {
        max: 30,
        min: 0,
        acquire: 10000000,
        idle: 1000000
    }
};

const sequelize = new Sequelize(
    env.db_name_rds,
    env.db_user_rds,
    env.db_pass_rds,
    dbOptions
);

/**
 * Adding hook for getting distinct count otherwise
 * in one to many associations, count will not be correct
 */
sequelize.addHook('beforeCount', function (options) {
    console.log("Sequelize => hooks => beforeCount");

    if (this._scope.include && this._scope.include.length > 0) {
      options.distinct = true
      options.col = this._scope.col || options.col || `${this.options.name.plural}.id`
    }

    if (options.include && options.include.length > 0) {
      options.include = null
    }
})

fs.readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach((file) => {
        const sModel = require(path.join(__dirname, file))(sequelize); //eslint-disable-line
        const model = sModel;
        db[model.name] = model;
    });

Object.keys(db)
    .map(name => db[name])
    .filter(model => model.associate)
    .forEach(model => model.associate(db));

const models = lodash.extend({ sequelize, Sequelize }, db);

module.exports = (app) => {
    app.set('sequelize', models.sequelize);
    app.set('models', models.sequelize.models);
    models.sequelize.sync({ alter: true })
        .then(() => console.log("DB synced"))
        .catch((error) => {
            console.log(error);
        });
}
module.exports.models = models;
