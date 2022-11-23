const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const FAQ = sequelize.define('FAQs', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        language: {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: ""
        },
        question: {
            type: Sequelize.TEXT
        },
        answer: {
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }

    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        }
      });

    return FAQ;
};
