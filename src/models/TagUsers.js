const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const TagUsers = sequelize.define('tag_users',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    memory_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "feeds",
            key: 'id'
        }
    },
    userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "users",
            key: 'id'
        }
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['id','userId','memory_id','createdAt', 'updatedAt']
          }
      }
    });


  TagUsers.associate = function(models) {

     /*TagUsers.belongsTo(models.album_memories, {
       foreignKey: 'memory_id',
       as: 'memoryDetails'
     });*/

     TagUsers.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });



  };



  return TagUsers;
}
