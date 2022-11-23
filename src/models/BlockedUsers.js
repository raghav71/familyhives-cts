const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const BlockedUser = sequelize.define('blocked_users',{
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
    blockedBy: {
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
              exclude: ['createdAt', 'updatedAt']
          }
      }
    });


  BlockedUser.associate = function(models) {

     BlockedUser.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'blockedUserDetails'
     });

     BlockedUser.belongsTo(models.family_trees, {
       foreignKey: 'family_tree',
       as: 'family_tree_details'
     });

   };
   return BlockedUser;
}
