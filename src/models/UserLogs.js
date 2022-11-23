const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const UserLogs = sequelize.define('user_logs',{
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
    activity: {
        type: Sequelize.STRING
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['userId','createdAt', 'updatedAt']
          }
      }
    });


  UserLogs.associate = function(models) {

     UserLogs.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });



  };



  return UserLogs;
}
