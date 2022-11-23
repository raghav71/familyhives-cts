const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const FriendRequest = sequelize.define('friend_requests',{
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
    friendId: {
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
    status: {
        type: Sequelize.ENUM,
        values: ["0","1","2","3"], // 0=pending,1=accepted,2=rejected,3=blocked
        defaultValue: "0"
    },
    isBlocked: {
      type: Sequelize.BOOLEAN,
      allowNull:true,
      defaultValue: false
    },
    blockedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      onDelete: 'CASCADE',
      references: {
          model: "users",
          key: 'id'
      }
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

    FriendRequest.associate = function(models) {
       FriendRequest.belongsTo(models.users, {
         foreignKey: 'friendId',
         as: 'friendDetails'
       });

       FriendRequest.belongsTo(models.users, {
         foreignKey: 'userId',
         as: 'userDetails'
       });
    };
  return FriendRequest;
}
