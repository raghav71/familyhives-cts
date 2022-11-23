const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const TwilioGroupMembers = sequelize.define('twilio_group_members',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    group_id: {
        type: Sequelize.STRING(100)
    },
    member_sid: {
        type: Sequelize.STRING(100)
    },
    member_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "users",
            key: 'id'
        }
    },
    status: {
      type: Sequelize.ENUM,
      values: ["active", "block"],
      defaultValue: "active"
    },
    role: {
      type: Sequelize.ENUM,
      values: ["admin", "member"],
      defaultValue: "member"
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



  return TwilioGroupMembers;
}
