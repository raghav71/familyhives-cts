const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const like = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likes.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editLike = (query,likes, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likes.update(likes, { where: query, transaction })
              .then(resolve).catch(reject);
      })
    }


    const fetch = (id,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };
            query.include = [{
                model: models.users,
                as: "userDetails"
            }];

            let orm = models.likes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchByQuery = (where_query,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };
            query.include = [{
                model: models.users,
                as: "userDetails"
            }];

            let orm = models.likes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLike = (filters,transaction) => {
      console.log("LikeService=>countLike");
      console.log(filters);
      return new Promise(function(resolve, reject){

        let where ={isLiked:{[Op.eq]:1}};
        if(filters.feed_id) where.feed_id =filters.feed_id;
        if(filters.wish_id) where.wish_id =filters.wish_id;
        if(filters.userId) where.userId=filters.userId;
        if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};
        let orm = {
            where: where,
            order: [
                ['id', 'DESC']
            ],
            transaction
        }


        models.likes.count(orm)
            .then(resolve).catch(reject);
      })
    }

    const countDisLike = (filters,transaction) => {
      console.log("LikeService=>countDisLike");
      console.log(filters);
      return new Promise(function(resolve, reject){

        let where ={isLiked:{[Op.eq]:0}};
        if(filters.feed_id) where.feed_id =filters.feed_id;
        if(filters.wish_id) where.wish_id =filters.wish_id;
        if(filters.userId) where.userId=filters.userId;
        if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};
        let orm = {
            where: where,
            order: [
                ['id', 'DESC']
            ],
            transaction
        }


        models.likes.count(orm)
            .then(resolve).catch(reject);
      })
    }


    const deleteLike = (query, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.likes.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const getAllLikes = (filters, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
          let where ={isLiked:1 };
          if(filters.feed_id) where.feed_id =filters.feed_id;
          if(filters.wish_id) where.wish_id =filters.wish_id;
            let query = {
                where : where,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "userDetails"
            }];
            let orm = models.likes.scope(scope).findAndCountAll(query)
            orm.then(resolve).catch(reject);
        })
    }


    return {
        like,
        fetch,
        fetchByQuery,
        editLike,
        countLike,
        countDisLike,
        deleteLike,
        getAllLikes
    }
}
