const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const UserFamilyTree = sequelize.define('users_family_trees',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
            model: "users",
            key: 'id'
        }
    },
    family_tree_1: {
        type: Sequelize.INTEGER
    },
    family_tree_2: {
        type: Sequelize.INTEGER
    },
    active_tree: {
        type: Sequelize.INTEGER
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['userId','createdAt', 'updatedAt']
          }
      }
    });


  UserFamilyTree.associate = function(models) {

     UserFamilyTree.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });

     UserFamilyTree.belongsTo(models.family_trees, {
       foreignKey: 'family_tree_1',
       as: 'family_tree_1_details'
     });

     UserFamilyTree.belongsTo(models.family_trees, {
       foreignKey: 'family_tree_2',
       as: 'family_tree_2_details'
     });




  };



  return UserFamilyTree;
}
