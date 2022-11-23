const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const Alarm = sequelize.define('alarm',{
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
    file: {
        type: Sequelize.STRING(200)
    },
    time : {
        type: Sequelize.STRING(200)
    },
    days : {
        type: Sequelize.TEXT
    },
    alarm_type : {
      type: Sequelize.ENUM,
      allowNull:true,
      values: ["audio", "video"],
      defaultValue: null
    },
    is_repeat  : {
      type: Sequelize.ENUM,
      allowNull:true,
      values: ["1", "0"],
      defaultValue: null
    },
    status  : {
      type: Sequelize.ENUM,
      values: ["1", "0"],
      defaultValue: "0"
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


  Alarm.associate = function(models) {


     Alarm.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });



  };



  return Alarm;
}
