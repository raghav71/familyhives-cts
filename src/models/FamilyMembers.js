const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const FamilyMembers = sequelize.define('family_members', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        registered_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
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
            type: Sequelize.STRING,
            values: ["1", "2"]
        },
        name: {
            type: Sequelize.STRING(100)
        },
        countryCode: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        mobile: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        image: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: ""
        },
        parent: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        isMarried: {
            type: Sequelize.BOOLEAN
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        spouseId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
          onDelete: 'CASCADE',
          references: {
              model: "family_members",
              key: 'id'
          }
        },
        added_by: {
            type: Sequelize.STRING,
            values: ["default", "manual"],
            defaultValue: "manual"
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
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        }
      });

      FamilyMembers.associate = function(models) {

         FamilyMembers.belongsTo(models.users, {
           foreignKey: 'registered_id',
           as: 'registered_user_details'
         });



      };

    return FamilyMembers;
};
