const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const TwilioIndividualMembers = sequelize.define('twilio_individual_members',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER
    },
    chat_sid: {
        type: Sequelize.STRING(255)
    },
    partner_id: {
      type: Sequelize.INTEGER
    },
    isFamilyMember: {
        type: Sequelize.BOOLEAN
    },
    family_tree: {
        type: Sequelize.INTEGER,
        allowNull:true,
        defaultValue: false
    },
    isBlocked: {
        type: Sequelize.BOOLEAN,
        allowNull:true,
        defaultValue: false
    },
    blockedBy:{
      type: Sequelize.INTEGER,
      allowNull:true,
      defaultValue:null
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



  return TwilioIndividualMembers;
}
