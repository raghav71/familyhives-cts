const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Like = sequelize.define('likes',{
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
    feed_id: {
        type: Sequelize.INTEGER,
        allowNull:true,
        defaultValue: null
    },
    wish_id: {
        type: Sequelize.INTEGER,
        allowNull:true,
        defaultValue: null
    },
    like_type: {
        type: Sequelize.ENUM,
        values: ["like","laugh","blessing","namaste","love"],
        allowNull:true,
        defaultValue: null
    },
    isLiked: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  },{
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['createdAt', 'updatedAt']
          }
      }
    });

    Like.associate = function(models) {

       Like.belongsTo(models.users, {
         foreignKey: 'userId',
         as: 'userDetails'
       });
    };
  return Like;
}
