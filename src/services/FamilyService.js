const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {

  const addFamilyTree = (data, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.family_trees.create(data, { transaction })
              .then(resolve).catch(reject);
      })
  }

  const addUsersFamilyTree = (data, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.users_family_trees.create(data, { transaction })
              .then(resolve).catch(reject);
      })
  }

    const addFamilyMember = (member, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.family_members.create(member, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchSpouse = (user_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchSpouse")
        return new Promise(function(resolve, reject){
            let query = {
                where : user_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "registered_user_details"
            }];


            let orm = models.family_members.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchMemberByQuery = (user_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchMemberByQuery")
        return new Promise(function(resolve, reject){
            let query = {
                where : user_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.family_members.scope(scope).findAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchFamilyMember = (id, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchFamilyMember")
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.family_members.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchFamilyMemberByQuery = (query,page=null,limit=null, transaction = null) => {
        console.log("FamilyService => fetchFamilyMemberByQuery2")

        return new Promise(function(resolve, reject){
          page = parseInt(page || 1);
          limit = parseInt(limit || 10);
          let offset = (page - 1) * limit;
            let where = {
                  limit,
                  offset,
                  where : query,
                  order: [
                      ['id', 'DESC']
                  ],
                  attributes: {
                      exclude: ["createdAt","updatedAt"]
                  },
                  transaction
                }
                where.include = [{
                    model: models.users,
                    as: "registered_user_details"
                }];
            let orm = models.family_members.findAndCountAll(where);

            orm.then(resolve).catch(reject);
        })
    }

    const updateFamilyMemberProfile = (query, data, transaction = null) => {
        console.log("FamilyService => updateFamilyMemberProfile")
        return new Promise(function(resolve, reject){
            models.family_members.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateSpouse = (id, data, transaction = null) => {
        console.log("FamilyService => updateSpouse")
        return new Promise(function(resolve, reject){
            models.family_members.update(data, { where: { id }, transaction })
                .then(resolve).catch(reject);
        })
    }
    const removeMember = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        models.family_members.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const addUserActivity = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.user_logs.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchFamilyTree = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchFamilyMember")
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.family_trees.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }
    const updateFamilyTree = (query, data, transaction = null) => {
        console.log("FamilyService => updateFamilyTree")
        return new Promise(function(resolve, reject){
            models.family_trees.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const removeFamilyTree = (query, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.family_trees.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }
    const fetchUsersFamilyTree = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchFamilyMember")
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.family_trees,
                as: "family_tree_1_details"
            },{
                model: models.family_trees,
                as: "family_tree_2_details"
            }];


            let orm = models.users_family_trees.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }
    const updateUsersFamilyTree = (query, data, transaction = null) => {
        console.log("FamilyService => updateFamilyTree")
        return new Promise(function(resolve, reject){
            models.users_family_trees.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }


    const addFamilyRelation = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.family_members_relationships.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const updateFamilyRelation = (query, data, transaction = null) => {
        console.log("FamilyService => updateFamilyRelation")
        return new Promise(function(resolve, reject){
            models.family_members_relationships.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchFamilyRelation = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchFamilyRelation")
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.family_members_relationships.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const addBlockedUser = (data, transaction = null) => {
      console.log("FamilyService => addBlockedUser")
        return new Promise(function(resolve, reject){
            models.blocked_users.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const updateBlockedUser = (query, data, transaction = null) => {
        console.log("FamilyService => updateBlockedUser")
        return new Promise(function(resolve, reject){
            models.blocked_users.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const checkBlockedUser = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => checkBlockedUser")
        return new Promise(function(resolve, reject){
            let query = {
              where : where_query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
            };
            let orm = models.blocked_users.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchBlockedUser = (where_query,page=null,limit=null, transaction = null, scope = "defaultScope") => {
        console.log("FamilyService => fetchBlockedUser")
        return new Promise(function(resolve, reject){

            page = parseInt(page || 1);
            limit = parseInt(limit || 10);
            let offset = (page - 1) * limit;
            let query = {
              limit,
              offset,
              where : where_query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
            };

            query.include = [{
                model: models.users,
                as: "blockedUserDetails"
            }];


            let orm = models.blocked_users.scope(scope).findAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const removeBlockedUser = (query, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.blocked_users.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }
    return {
        addFamilyTree,
        addUsersFamilyTree,
        addFamilyMember,
        fetchSpouse,
        fetchMemberByQuery,
        updateSpouse,
        fetchFamilyMember,
        fetchFamilyMemberByQuery,
        updateFamilyMemberProfile,
        removeMember,
        addUserActivity,
        fetchFamilyTree,
        updateFamilyTree,
        removeFamilyTree,
        fetchUsersFamilyTree,
        updateUsersFamilyTree,
        addFamilyRelation,
        updateFamilyRelation,
        fetchFamilyRelation,
        addBlockedUser,
        updateBlockedUser,
        fetchBlockedUser,
        removeBlockedUser,
        checkBlockedUser
    }
}
