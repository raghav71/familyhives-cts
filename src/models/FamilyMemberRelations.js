const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const FamilyMemberRelations = sequelize.define('family_members_relationships', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        member_1: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "family_members",
                key: 'id'
            }
        },
        member_2: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "family_members",
                key: 'id'
            }
        },
        member_1_relation_with_member_2: {
            type: Sequelize.STRING(150),
            allowNull: true,
            defaultValue: null
        },
        member_2_relation_with_member_1: {
            type: Sequelize.STRING(150),
            allowNull: true,
            defaultValue: null
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

    return FamilyMemberRelations;
};
