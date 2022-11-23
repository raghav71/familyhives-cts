const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Admin = sequelize.define('admin', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: ""
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: ""
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: ""
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }
        }
      }
      );

    return Admin;
};
