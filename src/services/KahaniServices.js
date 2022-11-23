const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const addKahani = (kahani, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.kahani.create(kahani, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editKahani = (id,kahani, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.kahani.update(kahani, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }

    const changeKahaniPrivacy = (id,kahani, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.kahani.update(kahani, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }


    const fetch = (id, withOtherData=false,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };
            if(withOtherData) {
            query.include = [{
                model: models.users,
                as: "userDetails"
            },{
                model: models.kahanicomments,
                as: "kahaniComments"
            },{
                model: models.kahanilikes,
                as: "kahaniLikes"
            }];
          }

            let orm = models.kahani.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserKahani = (userId,id,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { userId,id },
                attributes: {
                    exclude: ["createdAt","updatedAt","deletedAt"]
                },
                transaction
            };


            let orm = models.kahani.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }


    const kahaniList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          where ={family_tree:filters.family_tree};
          if(filters.userId) where.userId=filters.userId;
          if(filters.search)
            where.title={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: where,
              order: [
                  ['id', 'DESC']
              ]
          }

          orm.include = [{
              model: models.users,
              as: "userDetails"
          },{
              model: models.kahanicomments,
              as: "kahaniComments"
          },{
              model: models.kahanilikes,
              as: "kahaniLikes"
          }];


          models.kahani.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const countKahani = (filters, transaction = null) => {
      console.log("KahaniService=>countKahani");
      console.log(filters);
        return new Promise(function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          where ={family_tree:filters.family_tree};
          if(filters.userId) where.userId=filters.userId;
          if(filters.search)
            where.title={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: where,
              order: [
                  ['id', 'DESC']
              ]
          }


          models.kahani.count(orm)
              .then(resolve).catch(reject);
        })
    }

    const deleteKahani = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        models.kahani.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }
    const kahaniCommentList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let kahaniId = filters.kahaniId;
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          where ={kahaniId};
          if(filters.search)
            where.message={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: where,
              order: [
                  ['id', 'DESC']
              ]
          }

          orm.include = [{
              model: models.users,
              as: "userDetails"
          },{
              model: models.likes_on_kahani_comments,
              as: "likeDetails"
          }];


          models.kahanicomments.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const addKahaniComments = (kahaniComments, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.kahanicomments.create(kahaniComments, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateKahaniComments = (kahaniComments,id, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.kahanicomments.update(kahaniComments, { where: {id}, transaction })
            .then(resolve).catch(reject);
        })
    }

    const deleteKahaniComments = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        console.log('query');
        console.log(query);
        models.kahanicomments.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const fetchComments = (id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["deletedAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "userDetails"
            },{
                model: models.likes_on_kahani_comments,
                as: "likeDetails"
            },
          ];
            let orm = models.kahanicomments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeKahani = (kahanilike, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.kahanilikes.create(kahanilike, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateKahaniLike = (id,kahanilike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.kahanilikes.update(kahanilike, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }
    const fetchLike = (id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.kahanilikes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }


    const fetchUserLikeOnKahani = (kahaniId,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.kahanilikes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserCommentsOnKahani = (kahaniId,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.kahanicomments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserLikeOnKahaniComment = (commentId,userId,withCommentDetails=false, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            if(withCommentDetails){
              query.include = [{
                  model: models.kahanicomments,
                  as: "commentDetails"
              }
            ];
            }


            let orm = models.likes_on_kahani_comments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeOnComment = (likeOnComment, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likes_on_kahani_comments.create(likeOnComment, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateCommentLike = (id,commentLike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likes_on_kahani_comments.update(commentLike, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }

    const getAllLikesOnKahani = (kahaniId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId,isLiked:"1" },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "userDetails"
            }];
            let orm = models.kahanilikes.scope(scope).findAndCountAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLikesOnKahani = (kahaniId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.kahanilikes.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnKahani = (kahaniId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.kahanilikes.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countCommentsOnKahani = (kahaniId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { kahaniId },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.kahanicomments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLikesOnKahaniComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_kahani_comments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnKahaniComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_kahani_comments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllLikesOnKahaniComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_kahani_comments.findAll(query)
            orm.then(resolve).catch(reject);
        })
    }


    return {
        addKahani,
        fetch,
        fetchUserKahani,
        editKahani,
        kahaniList,
        countKahani,
        deleteKahani,
        changeKahaniPrivacy,
        addKahaniComments,
        updateKahaniComments,
        deleteKahaniComments,
        fetchComments,
        likeKahani,
        updateKahaniLike,
        fetchLike,
        fetchUserLikeOnKahani,
        fetchUserCommentsOnKahani,
        kahaniCommentList,
        fetchUserLikeOnKahaniComment,
        likeOnComment,
        updateCommentLike,
        getAllLikesOnKahani,
        countLikesOnKahani,
        countUnLikesOnKahani,
        countCommentsOnKahani,
        countLikesOnKahaniComments,
        countUnLikesOnKahaniComments,
        getAllLikesOnKahaniComments
    }
}
