const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const sendFriendRequest = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.friend_requests.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetch = (id, transaction = null, scope = "defaultScope") => {
        console.log("FriendService => fetch")
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.friend_requests.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchByQuery = (query,page=null,limit=null, transaction = null) => {
        console.log("FriendService => fetch")

        return new Promise(function(resolve, reject){
          page = parseInt(page || 1);
          limit = parseInt(limit || 10);
          let offset = (page - 1) * limit;
          let where_query = {
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
            where_query.include = [{
                model: models.users,
                as: "userDetails"
            },{
                model: models.users,
                as: "friendDetails"
            }];


            let orm = models.friend_requests.findAll(where_query)

            orm.then(resolve).catch(reject);
        })
    }

    const checkStatus = (query, transaction = null) => {
        console.log("FriendService => checkStatus")

        return new Promise(function(resolve, reject){
          let where_query = {
              where : query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
          }

            let orm = models.friend_requests.findOne(where_query)

            orm.then(resolve).catch(reject);
        })
    }

    const updateRequest = (query, data, transaction = null) => {
        console.log("FriendService => update")
        return new Promise(function(resolve, reject){
            models.friend_requests.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const countRequest = (where_query,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.friend_requests.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    return {
        sendFriendRequest,
        fetch,
        fetchByQuery,
        updateRequest,
        countRequest,
        checkStatus
    }
}
