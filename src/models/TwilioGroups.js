const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const TwilioGroups = sequelize.define('twilio_groups',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    group_sid: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: ""
    },
    group_name: {
        type: Sequelize.STRING(100)
    },
    image: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    family_tree: {
        type: Sequelize.STRING,
        values: ["1", "2"],
        allowNull: true,
        defaultValue: ""
    },
    userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "users",
            key: 'id'
        }
    },
    isDefaultGroup: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0
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


  TwilioGroups.associate = function(models) {


     TwilioGroups.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });
};



  return TwilioGroups;
}
