const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
module.exports = function (sequelize) {
    const Notification = sequelize.define('notification', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        userId: {
            type: Sequelize.INTEGER
        },
        title: {type: Sequelize.STRING(100)},
        device_token: {type: Sequelize.STRING},
        device_type: {type: Sequelize.STRING},
        body: {type: Sequelize.STRING},
        data: {type: Sequelize.TEXT,allowNull:true},
        feed_id: {type: Sequelize.STRING,allowNull:true,defaultValue:null},
        notification_type: {type: Sequelize.STRING,allowNull:true,defaultValue:null},
        isRead: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['updatedAt']
            }
        }
      }
      );

    return Notification;
};
