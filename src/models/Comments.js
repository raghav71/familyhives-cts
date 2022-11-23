const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Comments = sequelize.define('comments',{
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
    commentType: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    image: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    video: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    total_like: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    total_unlike: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    like_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: ""
    }
  },{
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['updatedAt','deletedAt']
          }
      }
    });
    Comments.associate = function(models) {


       Comments.belongsTo(models.users, {
         foreignKey: 'userId',
         as: 'commented_by'
       });
       Comments.hasMany(models.likeoncomment, {
         foreignKey: 'commentId',
         as: 'likeDetails'
       });
    };
  return Comments;
}
