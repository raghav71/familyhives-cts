const Sequelize = require('sequelize');
const { Op,QueryTypes  } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const add = (user, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.users.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetch = (id, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetch")
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"],
                    include:[['id','user_id']]
                },
                transaction
            };


            let orm = models.users.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchByMobile = (countryCode, mobile, transaction = null) => {
        console.log("UserService => fetch")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : {
                    countryCode:  countryCode,
                    mobile
                },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"],
                    include:[['id','user_id']]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const updateProfile = (userId, user, transaction = null) => {
        console.log("UserService => update")
        return new Promise(function(resolve, reject){
            models.users.update(user, { where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchByCol = (col, val, transaction = null) => {
        console.log("UserService => fetchByCol")
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : {
                    [col]: val
                },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"],
                    include:[['id','user_id']]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const verifyPassword = (id, password, transaction = null) => {
        console.log("UserService => verifyPassword")
        return new Promise(async function(resolve, reject){
            let user = await models.users.findOne({
                where : { id },
                attributes: {
                    include: ["password"]
                },
                transaction
            })

            if(!user) resolve(false);
            let v = await helpers().checkPassword(password, user.password)

            return resolve(v);
        })
    }

    const fetchByQuery = (query, transaction = null) => {
        console.log("UserService => fetchByQuery")
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : query,
                attributes: {
                    exclude: ["password","createdAt","updatedAt","socialProviderUid",'socialProviderType'],
                    include:[['id','user_id']]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchByQueryForLogin = (query, transaction = null) => {
        console.log("UserService => fetchByQueryForLogin")
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : query,
                attributes: {
                    exclude: ["createdAt","updatedAt"],
                    include:[['id','user_id'],"password"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchByMobileToEdit = (countryCode, mobile,userId, transaction = null) => {
        console.log("UserService => fetchByMobileToEdit")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : {
                    countryCode: countryCode,
                    mobile,
                    id: {
                          [Op.not]: userId
                    }
                },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchByEmailToEdit = (email,userId, transaction = null) => {
        console.log("UserService => fetchByEmailToEdit")
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({

                where : {
                    email,
                    id: {
                          [Op.not]: userId
                    }
                },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }


    const getPrivacyAndPermission = (userId, transaction = null) => {
        console.log("UserService => getPrivacyAndPermission")
        return new Promise(function(resolve, reject){
            let orm = models.user_privacy_permission_management.findOne({
                where : {
                    userId
                },
                attributes: {
                    exclude: ["deletedAt","createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addPrivacyAndPermission = (privacyAndPermission, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.user_privacy_permission_management.create(privacyAndPermission, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updatePrivacyAndPermission = (id, data, transaction = null) => {
        console.log("UserService => updatePrivacyAndPermission")
        return new Promise(function(resolve, reject){
            models.user_privacy_permission_management.update(data, { where: { id }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const userList = (filters, transaction = null) => {
        console.log("UserService => userList")
        console.log(filters);
        console.log(filters.user_ids);
        console.log(filters.user_ids.length);
        return new Promise(async function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          where ={};
          if(filters.user_ids.length>0) where.id=await {[Op.in]:filters.user_ids};
          //if(filters.userId) where.id=await {[Op.not]: filters.userId};
          if(filters.is_completed_profile_users=="1") where.profile_stage="2";
          if(filters.search) where.name=await  {[Op.like]:'%'+filters.search+'%'};
          console.log("where")
          console.log(where);
          let query = {
              limit,
              offset,
              where: where,
              order: [
                  ['id', 'DESC']
              ],
              attributes: {
                  exclude: ["password","createdAt","updatedAt"],
                  include:[['id','user_id']]
              }
          }
          query.include = [{
            model: models.users_family_trees,
            as: "family_tree_details"
          }]
            let orm = models.users.findAndCountAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countActiveUser = (transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { active:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.users.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countDeactiveUser = (transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { active:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.users.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getUserDetails = (id, withMemoryData = false, transaction = null, scope = "defaultScope") => {
        console.log("UserService => getUserDetails")
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["password","createdAt","updatedAt"],
                    include:[['id','user_id']]
                },
                transaction
            };

            if(withMemoryData) {
            query.include = [{
                model: models.album,
                as: "albumList"
            }];
          }


            let orm = models.users.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const addFamilyMember = (member, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.family_members.create(member, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const addSpouse = (spouse, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.spouse_details.create(spouse, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchSpouse = (user_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchFamilyMember")
        return new Promise(function(resolve, reject){
            let query = {
                where : user_query,
                attributes: {
                    exclude: ["spouseId","createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.spouse_details.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchFamilyMember = (id, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchFamilyMember")
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

    const fetchFamilyMemberByQuery = (query, transaction = null) => {
        console.log("UserService => fetchFamilyMemberByQuery")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.family_members.findAndCountAll({
                where : query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const updateFamilyMemberProfile = (id, data, transaction = null) => {
        console.log("UserService => updateFamilyMemberProfile")
        return new Promise(function(resolve, reject){
            models.family_members.update(data, { where: { id }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateSpouse = (id, data, transaction = null) => {
        console.log("UserService => updateFamilyMemberProfile")
        return new Promise(function(resolve, reject){
            models.spouse_details.update(data, { where: { id }, transaction })
                .then(resolve).catch(reject);
        })
    }
    const getLogs = (query,page=null,limit=null, transaction = null) => {
        console.log("UserService => getLogs")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){

            page = parseInt(page || 1);
            limit = parseInt(limit || 10);
            let offset = (page - 1) * limit;
            let orm = models.user_logs.findAndCountAll({
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
            })

            orm.then(resolve).catch(reject);
        })
    }

    const countLogs = (query, transaction = null) => {
        console.log("UserService => countLogs")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.user_logs.count({
                where : query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchByMobileForFriendList = (mobile, transaction = null) => {
        console.log("UserService => fetchByMobileForFriendList")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : Sequelize.where(Sequelize.fn("concat", Sequelize.col("countryCode"), Sequelize.col("mobile")),mobile),
                attributes: {
                    exclude: ["password","createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchByOnlyMobile = (mobile, transaction = null) => {
        console.log("UserService => fetchByOnlyMobile")
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        return new Promise(function(resolve, reject){
            let orm = models.users.findOne({
                where : {mobile},
                attributes: {
                    exclude: ["password","createdAt","updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    /*const getAllFeeds = (filters, transaction = null) => {
        console.log("UserService => getAllFeeds")
        return new Promise(async function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;

          let where =" recipe.family_tree = "+filters.family_tree;
          //if(filters.userId) where.userId=filters.userId;
          //if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};
          let sql_query = "SELECT recipe.* as recipe_list,kahani.* as kahani_list,memory.* as memory_list FROM recipes recipe LEFT JOIN kahanis kahani on kahani.family_tree = recipe.family_tree LEFT JOIN album_memories memory on memory.family_tree = recipe.family_tree Where "+where+" LIMIT "+offset+","+limit;


            let orm = await models.sequelize.query(sql_query, { type: QueryTypes.SELECT }).then(resolve).catch(reject);
        })
    }*/

    const addOTPAndToken = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.user_OTP_and_token.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getOTPAndToken = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetch")
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.user_OTP_and_token.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateOTPAndToken = (query, data, transaction = null) => {
        console.log("UserService => updateFamilyMemberProfile")
        return new Promise(function(resolve, reject){
            models.user_OTP_and_token.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }


    return {
        add,
        fetch,
        fetchByMobile,
        updateProfile,
        fetchByCol,
        verifyPassword,
        fetchByQuery,
        fetchByQueryForLogin,
        fetchByEmailToEdit,
        fetchByMobileToEdit,
        getPrivacyAndPermission,
        addPrivacyAndPermission,
        updatePrivacyAndPermission,
        userList,
        countActiveUser,
        countDeactiveUser,
        getUserDetails,
        getLogs,
        countLogs,
        fetchByMobileForFriendList,
        fetchByOnlyMobile,
        //getAllFeeds,
        addOTPAndToken,
        getOTPAndToken,
        updateOTPAndToken
    }
}
