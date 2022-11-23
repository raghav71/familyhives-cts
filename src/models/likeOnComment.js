const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const likeOnComment = sequelize.define('likeoncomment',{
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
    commentId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "comments",
            key: 'id'
        }
    },
    like_type: {
      type: Sequelize.ENUM,
      values: ["like","laugh","blessing","namaste","love"],
      allowNull:true,
      defaultValue: null
    },
    isLiked: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      allowNull:true,
      defaultValue: null
    }
  },{
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['createdAt', 'updatedAt','deletedAt']
          }
      }
    });

    likeOnComment.associate = function(models) {


       likeOnComment.belongsTo(models.users, {
         foreignKey: 'userId',
         as: 'userDetails'
       });

       likeOnComment.belongsTo(models.comments, {
         foreignKey: 'commentId',
         as: 'commentDetails'
       });
    };
  return likeOnComment;
}
