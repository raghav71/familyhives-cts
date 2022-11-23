const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Language = sequelize.define('languages',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    language: {
        type: Sequelize.STRING(300),
    },
    code: {
        type: Sequelize.STRING(10),
    },
    logo: {
        type: Sequelize.INTEGER,
        allowNull:true,
        defaultValue:null
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['createdAt', 'updatedAt']
          }
      }
    });

    /*Language.associate = function(models) {

       Language.hasMany(models.about, {
         foreignKey: 'code',
         as: 'about_us'
       });

       Language.hasMany(models.privacyAndPolicies, {
         foreignKey: 'code',
         as: 'privacyAndPolicy'
       });

       Language.hasMany(models.termAndCondition, {
         foreignKey: 'code',
         as: 'termAndCondition'
       });

     }*/
    return Language;
}
