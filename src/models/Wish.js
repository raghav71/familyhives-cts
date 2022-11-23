const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');
//const user = require('./User')
module.exports = function (sequelize) {
  const Wish = sequelize.define('wishes',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    partnerId: {
        type: Sequelize.INTEGER,
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
    message: {
        type: Sequelize.TEXT
    },
    image: {
        type: Sequelize.TEXT,
        allowNull:true,
        defaultValue: null
    },
    type: {
      type: Sequelize.ENUM,
      values: ["1", "2"],
      allowNull:true,
      defaultValue: null
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
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['updatedAt']
          }
      }
    });


  Wish.associate = function(models) {

     Wish.belongsTo(models.users, {
       foreignKey: 'partnerId',
       as: 'userDetails'
     });

     Wish.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'wish_by'
     });



  };



  return Wish;
}
