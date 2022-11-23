const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const PrivacyAndPolicy = sequelize.define('privacyAndPolicies', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        privacyAndPolicy: {
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
          type: Sequelize.ENUM,
          values: ["0", "1",],
          defaultValue: "1"
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

      /*PrivacyAndPolicy.associate = function(models) {

         PrivacyAndPolicy.belongsTo(models.languages, {
           foreignKey: 'language',
           as: 'language_details'
         });
       }*/

    return PrivacyAndPolicy;
};
