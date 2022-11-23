const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const User = sequelize.define('users', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: ""
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: ""
        },
        mobile: {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: ""
        },
        countryCode: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: ""
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: ""
        },
        gender: {
            type: Sequelize.ENUM,
            values: ["Male", "Female", "Other"],
            defaultValue: null
        },
        dob: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        aniversary: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        image: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        facebookId: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        googleId: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        appleId: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        device_type: {
          type: Sequelize.ENUM,
          values: ["ios", "android"],
          allowNull: true,
          defaultValue: null
        },
        device_token: {
          type: Sequelize.STRING,
          allowNull:true,
          defaultValue: ""
        },
        profile_stage: {
            type: Sequelize.ENUM,
            allowNull: true,
            values: ["0","1","2"],
            defaultValue: null
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        notification_permission: {
            type: Sequelize.ENUM,
            values: ["allow","deny"],
            defaultValue: "allow"
        },
        language: {
          type: Sequelize.STRING,
          allowNull:true,
          defaultValue: "en"
        },
        isEmailVerified: {
          type: Sequelize.BOOLEAN,
          allowNull:true,
          defaultValue: false
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt', 'facebookId', 'googleId','appleId','device_type']
            }
        }
      }
      );

      User.associate = function(models) {
         /*User.hasMany(models.recipe, {
           foreignKey: 'userId',
           as: 'userDetails'
         });*/
         User.hasMany(models.comments, {
           foreignKey: 'userId',
           as: 'commented_by'
         });
         /*User.hasMany(models.recipelikes, {
           foreignKey: 'userId',
           as: 'likeUserDetails'
         });*/
         User.hasMany(models.likeoncomment, {
           foreignKey: 'userId',
           as: 'likeoncommentUserDetails'
         });

         User.hasMany(models.tag_users, {
           foreignKey: 'userId',
           as: 'tagged_user'
         });

         User.hasMany(models.album, {
           foreignKey: 'userId',
           as: 'albumList'
         });

         User.hasMany(models.friend_requests, {
           foreignKey: 'friendId',
           as: 'friendDetails'
         });

         User.hasMany(models.family_members, {
           foreignKey: 'registered_id',
           as: 'registered_user_details'
         });

         User.hasMany(models.feeds, {
           foreignKey: 'userId',
           as: 'created_by'
         });
         User.hasMany(models.blocked_users, {
           foreignKey: 'userId',
           as: 'blockedUserDetails'
         });
         User.hasOne(models.users_family_trees, {
           foreignKey: 'userId',
           as: 'family_tree_details'
         });
       };

    return User;
};
