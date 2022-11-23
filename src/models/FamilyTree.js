const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const FamilyTree = sequelize.define('family_trees',{
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
    name: {
        type: Sequelize.STRING,
    },
    parent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
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


  FamilyTree.associate = function(models) {

     FamilyTree.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });

     FamilyTree.hasMany(models.users_family_trees, {
       foreignKey: 'family_tree_1',
       as: 'family_tree_1_details'
     });

     FamilyTree.hasMany(models.users_family_trees, {
       foreignKey: 'family_tree_2',
       as: 'family_tree_2_details'
     });

     /*FamilyTree.hasMany(models.recipe, {
       foreignKey: 'family_tree',
       as: 'recipe_list'
     });

     FamilyTree.hasMany(models.kahani, {
       foreignKey: 'family_tree',
       as: 'kahani_list'
     });

     FamilyTree.hasMany(models.album_memories, {
       foreignKey: 'family_tree',
       as: 'memory_list'
     });*/




  };



  return FamilyTree;
}
