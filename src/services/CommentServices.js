const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const comment = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.comments.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editComment = (query,comments, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.comments.update(comments, { where: query, transaction })
              .then(resolve).catch(reject);
      })
    }


    const fetch = (id,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["updatedAt"]
                },
                transaction
            };
            query.include = [{
                model: models.users,
                as: "commented_by"
            },{
                model: models.likeoncomment,
                as: "likeDetails"
            }];

            let orm = models.comments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchByQuery = (where_query,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where :  where_query ,
                attributes: {
                    exclude: ["updatedAt"]
                },
                transaction
            };
            query.include = [{
                model: models.users,
                as: "commented_by"
            },{
                model: models.likeoncomment,
                as: "likeDetails"
            }];

            let orm = models.comments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countComment = (filters,transaction) => {
      console.log("CommentService=>countComment");

      return new Promise(function(resolve, reject){

        let where ={};
        if(filters.feed_id) where.feed_id=filters.feed_id;
        if(filters.wish_id) where.wish_id=filters.wish_id;
        if(filters.userId) where.userId=filters.userId;
        if(filters.search) where.message={[Op.like]:'%'+filters.search+'%'};
        let orm = {
            where: where,
            order: [
                ['id', 'DESC']
            ],
            transaction
        }


        models.comments.count(orm)
            .then(resolve).catch(reject);
      })
    }


    const deleteComment = (query, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.comments.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const commentList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          let where ={};
          if(filters.feed_id) where.feed_id=filters.feed_id;
          if(filters.wish_id) where.wish_id=filters.wish_id;
          if(filters.search)
            where.message={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: where,
              order: [
                  ['id', 'DESC']
              ],
              transaction
          }

          orm.include = [{
              model: models.users,
              as: "commented_by"
          },{
              model: models.likeoncomment,
              as: "likeDetails"
          }];


          models.comments.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const fetchLikeOnComment = (where_query,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where :  where_query ,
                attributes: {
                    exclude: ["updatedAt"]
                },
                transaction
            };

            let orm = models.likeoncomment.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const addLikeOncomment = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likeoncomment.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editLikeOnComment = (query,data, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likeoncomment.update(data, { where: query, transaction })
              .then(resolve).catch(reject);
      })
    }

    const countLikesOnComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likeoncomment.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likeoncomment.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllLikesOnComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likeoncomment.findAll(query)
            orm.then(resolve).catch(reject);
        })
    }


    return {
        comment,
        fetch,
        fetchByQuery,
        editComment,
        countComment,
        deleteComment,
        commentList,
        fetchLikeOnComment,
        addLikeOncomment,
        editLikeOnComment,
        countLikesOnComments,
        countUnLikesOnComments,
        getAllLikesOnComments
    }
}
