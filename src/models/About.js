const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const About = sequelize.define('about', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        about: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: ""
        },
        image	: {
            type: Sequelize.STRING(150),
            allowNull: true,
            defaultValue: ""
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true
        },
        language: {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: ""
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
      });

      /*About.associate = function(models) {

         About.belongsTo(models.languages, {
           foreignKey: 'language',
           as: 'language_details'
         });
       }*/

    return About;
};
