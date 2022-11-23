const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const addRecipe = (recipe, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.recipe.create(recipe, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editRecipe = (id,recipe, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.recipe.update(recipe, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }

    const changeRecipePrivacy = (id,recipe, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.recipe.update(recipe, { where: { id }, transaction })
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
                model: models.recipecomments,
                as: "recipeComments"
            },{
                model: models.recipelikes,
                as: "recipeLikes"
            }];
          }

            let orm = models.recipe.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserRecipe = (userId,id,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { userId,id },
                attributes: {
                    exclude: ["createdAt","updatedAt","deletedAt"]
                },
                transaction
            };


            let orm = models.recipe.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countRecipe = (filters,transaction) => {
      console.log("RecipeService=>countRecipe");
      console.log(filters);
      return new Promise(function(resolve, reject){
        let page = parseInt(filters.page || 1);
        let limit = parseInt(filters.limit || 10);
        let offset = (page - 1) * limit;
        console.log('filters');
        console.log(filters);
        let where ={family_tree:filters.family_tree};
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


        models.recipe.count(orm)
            .then(resolve).catch(reject);
      })
    }

    const recipeList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          console.log('filters');
          console.log(filters);
          let where ={family_tree:filters.family_tree};
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
              model: models.recipecomments,
              as: "recipeComments"
          },{
              model: models.recipelikes,
              as: "recipeLikes"
          }];


          models.recipe.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const deleteRecipe = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        console.log('query');
        console.log(query);
        models.recipe.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const recipeCommentList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let recipeId = filters.recipeId;
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          where ={recipeId};
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
              model: models.likeoncomment,
              as: "likeDetails"
          }];


          models.recipecomments.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const addRecipeComments = (recipeComments, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.recipecomments.create(recipeComments, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateRecipeComments = (recipeComments,id, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.recipecomments.update(recipeComments, { where: {id}, transaction })
            .then(resolve).catch(reject);
        })
    }

    const deleteRecipeComments = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        console.log('query');
        console.log(query);
        models.recipecomments.destroy({ where: query, transaction })
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
                model: models.likeoncomment,
                as: "likeDetails"
            },
          ];
            let orm = models.recipecomments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeRecipe = (recipelike, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.recipelikes.create(recipelike, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateRecipeLike = (id,recipelike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.recipelikes.update(recipelike, { where: { id }, transaction })
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


            let orm = models.recipelikes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }


    const fetchUserLikeOnRecipe = (recipeId,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.recipelikes.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserCommentsOnRecipe = (recipeId,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.recipecomments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserLikeOnRecipeComment = (commentId,userId,withCommentDetails=false, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt","deletedAt"]
                },
                transaction
            };

            if(withCommentDetails){
              query.include = [{
                  model: models.recipecomments,
                  as: "commentDetails"
              }
            ];
            }


            let orm = models.likeoncomment.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeOnComment = (likeOnComment, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likeoncomment.create(likeOnComment, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateCommentLike = (id,commentLike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likeoncomment.update(commentLike, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }

    const getAllLikesOnRecipe = (recipeId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId,isLiked:"1" },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "userDetails"
            }];
            let orm = models.recipelikes.scope(scope).findAndCountAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLikesOnRecipe = (recipeId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.recipelikes.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnRecipe = (recipeId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.recipelikes.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countCommentsOnRecipe = (recipeId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { recipeId },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.recipecomments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLikesOnRecipeComments = (commentId, transaction = null, scope = "defaultScope") => {
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

    const countUnLikesOnRecipeComments = (commentId, transaction = null, scope = "defaultScope") => {
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

    const getAllLikesOnRecipeComments = (commentId, transaction = null, scope = "defaultScope") => {
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
        addRecipe,
        fetch,
        fetchUserRecipe,
        editRecipe,
        recipeList,
        countRecipe,
        deleteRecipe,
        changeRecipePrivacy,
        addRecipeComments,
        updateRecipeComments,
        deleteRecipeComments,
        fetchComments,
        likeRecipe,
        updateRecipeLike,
        fetchLike,
        fetchUserLikeOnRecipe,
        fetchUserCommentsOnRecipe,
        recipeCommentList,
        fetchUserLikeOnRecipeComment,
        likeOnComment,
        updateCommentLike,
        getAllLikesOnRecipe,
        countLikesOnRecipe,
        countUnLikesOnRecipe,
        countCommentsOnRecipe,
        countLikesOnRecipeComments,
        countUnLikesOnRecipeComments,
        getAllLikesOnRecipeComments
    }
}
