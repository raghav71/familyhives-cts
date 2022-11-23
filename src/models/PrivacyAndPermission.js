const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const PrivacyAndPermission = sequelize.define('user_privacy_permission_management',{
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
    feeds: {
      type: Sequelize.ENUM,
      values: ["family", "friends", "only me"],
      defaultValue: null
    },
    dadi_ki_rasoi: {
      type: Sequelize.ENUM,
      values: ["family", "friends", "only me"],
      defaultValue: null
    },
    family_memories: {
      type: Sequelize.ENUM,
      values: ["family", "friends", "only me"],
      defaultValue: null
    },
    friend_request: {
      type: Sequelize.ENUM,
      values: ["everyone", "no one"],
      defaultValue: null
    },
    mobile_number: {
      type: Sequelize.ENUM,
      values: ["family", "friends", "only me"],
      defaultValue: null
    },
    email: {
      type: Sequelize.ENUM,
      values: ["family", "friends", "only me"],
      defaultValue: null
    }
  },{
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['userId','createdAt', 'updatedAt','deletedAt']
          }
      }
    });

    PrivacyAndPermission.associate = function(models) {
       PrivacyAndPermission.belongsTo(models.users, {
         foreignKey: 'userId',
         as: 'userDetails'
       });
    };
  return PrivacyAndPermission;
}
