const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Album = sequelize.define('album',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "users",
            key: 'id'
        }
    },
    family_tree: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "family_trees",
            key: 'id'
        }
    },
    album_name: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: null

    }
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['createdAt', 'updatedAt','deletedAt']
          }
      }
    });


  Album.associate = function(models) {

     Album.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'created_by'
     });


   };



  return Album;
}
