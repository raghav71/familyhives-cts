const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Feeds = sequelize.define('feeds',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    albumId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
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
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "family_trees",
            key: 'id'
        }
    },
    title: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    file: {
        type: Sequelize.STRING(300),
        allowNull: true,
        defaultValue: ""
    },
    file_width: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
    },
    file_height: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
    },
    feed_type: {
        type: Sequelize.ENUM,
        values: ["recipe", "memory","kahani","home memory"],
        defaultValue: null
    },
    content_type: {
        type: Sequelize.ENUM,
        values: ["text", "image","video", "audio"],
        defaultValue: null
    },
    privacy: {
        type: Sequelize.ENUM,
        values: ["family", "friends", "only me"],
        defaultValue: "family"
    },
    total_like: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    total_unlike: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    total_comment: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    like_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
    },
    lastCommentAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW')
    }
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: [ 'updatedAt']
          }
      }
    });


  Feeds.associate = function(models) {

     Feeds.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'created_by'
     });

     Feeds.hasMany(models.comments, {
       foreignKey: 'feed_id',
       as: 'Comments'
     });

     Feeds.hasMany(models.likes, {
       foreignKey: 'feed_id',
       as: 'Likes'
     });

     Feeds.belongsTo(models.family_trees, {
       foreignKey: 'family_tree',
       as: 'family_tree_details'
     });

  };



  return Feeds;
}
