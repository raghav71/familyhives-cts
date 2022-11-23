const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const AlbumFiles = sequelize.define('album_files',{
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
    file: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['memory_id','createdAt', 'updatedAt','deletedAt']
          }
      }
    });


  AlbumFiles.associate = function(models) {

     AlbumFiles.belongsTo(models.feeds, {
       foreignKey: 'memory_id',
       as: 'memoryDetails'
     });



  };



  return AlbumFiles;
}
