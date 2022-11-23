const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Setting = sequelize.define('setting', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        FAQs_image: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: ""
        },
        helpline_mobile	: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: ""
        },
        helpline_email: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: ""
        }

    });

    return Setting;
};
