const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const createNewAlbum = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.album.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }


        const updateAlbum = (album_id, data, transaction = null) => {
          console.log("AlbumService => updateAlbum")

            return new Promise(function(resolve, reject){
                models.album.update(data, { where: { id: album_id }, transaction })
                    .then(resolve).catch(reject);
            })
        }

    const addMemory = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.album_memories.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const addAlbumFiles = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.album_files.bulkCreate(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateAlbumFiles = (id, data, transaction = null) => {
      console.log("AlbumService => updateAlbumFiles")

        return new Promise(function(resolve, reject){
            models.album_files.update(data, { where: { id }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const tagUser = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.tag_users.bulkCreate(data, { transaction })
                .then(resolve).catch(reject);
        })
    }


    const getAlbum = (id, transaction = null) => {
        console.log("AlbumService => getAlbum")
        return new Promise(function(resolve, reject){

          let query = {
              where : {id},
              attributes: {
                  exclude: ["deletedAt","updatedAt"]

              },
              transaction
          }
          query.include = [{
              model: models.users,
              as: "created_by"
          }];

            let orm = models.album.findOne(query);

            orm.then(resolve).catch(reject);
        })
    }

    const getAlbumName = (id, transaction = null) => {
        console.log("AlbumService => getAlbumName")
        return new Promise(function(resolve, reject){

          let query = {
              where : {id},
              attributes: {
                  exclude: ["updatedAt"]

              },
              transaction
          }


            let orm = models.album.findOne(query);

            orm.then(resolve).catch(reject);
        })
    }

    const albumList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let offset = null;
          let limit = null;
          if(filters.page!=null && !filters.limit!=null &&  filters.page!='' && !filters.limit!=''){
            let page = parseInt(filters.page);
            limit = parseInt(filters.limit);
            offset = (page - 1) * limit;
          }

          query ={family_tree:filters.family_tree};
          if(filters.userId)
            query.userId=filters.userId;
          if(filters.album_id)
            query.id=filters.album_id;
          if(filters.search)
            query.album_name={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: query,
              order: [
                  ['updatedAt', 'DESC']
              ]
          }


          orm.include = [{
              model: models.users,
              as: "created_by"
          }];



          models.album.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const getTagedUser = (memory_id, transaction = null) => {
        console.log("AlbumService => getTagedUser")
        return new Promise(function(resolve, reject){

          let query = {
              where : {memory_id},
              transaction
          }
          query.include = [{
              model: models.users,
              as: "userDetails"
          }];

            let orm = models.tag_users.findAndCountAll(query);

            orm.then(resolve).catch(reject);
        })
    }

    const getFiles = (query, transaction = null) => {
        console.log("AlbumService => getFiles")
        return new Promise(function(resolve, reject){
          let where = {
              where : query,
              order: [
                  ['id', 'DESC']
              ],
              transaction
          }
          let orm = models.album_files.findAndCountAll(where);
          orm.then(resolve).catch(reject);
        })
    }

    /*const getFilesByAlbumId = (albumId, transaction = null) => {
        console.log("AlbumService => getFilesByAlbumId")
        return new Promise(function(resolve, reject){

          let query = {
              where : memory_id: {
                [Op.in]: 'SELECT id from album_memories where albumId='+albumId
              },
              transaction
          }


            let orm = models.album_files.findAndCountAll(query);

            orm.then(resolve).catch(reject);
        })
    }*/

    const getAllMemories = (filters, transaction = null) => {
        console.log("AlbumService => getAllMemories")
        return new Promise(function(resolve, reject){
          let offset = null;
          let limit = null;
          if(filters.page!=null && filters.limit!=null &&  filters.page!='' && filters.limit!=''){
            let page = parseInt(filters.page);
            limit = parseInt(filters.limit);
            offset = (page - 1) * limit;
          }
          let where ={family_tree:filters.family_tree};
          if(filters.albumId) where.albumId=filters.albumId;
          if(filters.type) where.type=filters.type;
          if(filters.userId) where.userId=filters.userId;
          if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};

          let query = {
              limit,
              offset,
              where : where,
              order: [
                  ['updatedAt', 'DESC']
              ],
              transaction
          }

          query.include = [{
              model: models.users,
              as: "created_by"
          }];

            let orm = models.album_memories.findAndCountAll(query);

            orm.then(resolve).catch(reject);
        })
    }

    const countMemories = (filters, transaction = null) => {
        console.log("AlbumService => countMemories")
        console.log(filters);
        return new Promise(function(resolve, reject){
          let offset = null;
          let limit = null;
          if(filters.page!=null && filters.limit!=null &&  filters.page!='' && filters.limit!=''){
            let page = parseInt(filters.page);
            limit = parseInt(filters.limit);
            offset = (page - 1) * limit;
          }
          let where ={family_tree:filters.family_tree};
          if(filters.albumId) where.albumId=filters.albumId;
          if(filters.type) where.type=filters.type;
          if(filters.userId) where.userId=filters.userId;
          if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};

          let query = {
              limit,
              offset,
              where : where,
              order: [
                  ['updatedAt', 'DESC']
              ],
              transaction
          }

            let orm = models.album_memories.count(query);

            orm.then(resolve).catch(reject);
        })
    }

    const updateMemory = (memory_id, data, transaction = null) => {
      console.log("AlbumService => updateMemory")

        return new Promise(function(resolve, reject){
          console.log('data');
          console.log(data);
          console.log(memory_id);
            models.album_memories.update(data, { where: { id: memory_id }, transaction })
                .then(resolve).catch(reject);
        })
    }


    const fetchMemory = (query, transaction = null) => {
        console.log("AlbumService => fetchMemory")
        return new Promise(function(resolve, reject){

          let where = {
              where : query,
              transaction
          }

            let orm = models.album_memories.findAll(where);

            orm.then(resolve).catch(reject);
        })
    }


    const getMemory = (id, transaction = null) => {
        console.log("AlbumService => getMemory")
        return new Promise(function(resolve, reject){

          let query = {
              where : {id},
              attributes: {
                  exclude: ["deletedAt","updatedAt"]

              },
              transaction
          }

          query.include = [{
              model: models.users,
              as: "created_by"
          }];
            let orm = models.album_memories.findAll(query);

            orm.then(resolve).catch(reject);
        })
    }

    const deleteAlbum = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        models.album.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const deleteAlbumMemories = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        models.album_memories.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const addMemoryComments = (memoryComments, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.comments_on_memories.create(memoryComments, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateMemoryComments = (memoryComments,id, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.comments_on_memories.update(memoryComments, { where: {id}, transaction })
            .then(resolve).catch(reject);
        })
    }

    const deleteMemoryComments = (query, transaction = null) => {

      return new Promise(function(resolve, reject){
        console.log('query');
        console.log(query);
        models.comments_on_memories.destroy({ where: query, transaction })
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
            },
          ];
            let orm = models.comments_on_memories.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeMemory = (memorylike, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likes_on_memories.create(memorylike, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateMemoryLike = (id,memorylike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likes_on_memories.update(memorylike, { where: { id }, transaction })
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


            let orm = models.likes_on_memories.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }


    const fetchUserLikeOnMemory = (memory_id,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.likes_on_memories.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserCommentsOnMemory = (memory_id,userId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id,userId },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };


            let orm = models.comments_on_memories.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllLikesOnMemory = (memory_id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id,isLiked:"1" },
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "userDetails"
            }];
            let orm = models.likes_on_memories.scope(scope).findAndCountAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countLikesOnMemory = (memory_id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_memories.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnMemory = (memory_id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_memories.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countCommentsOnMemory = (memory_id, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { memory_id },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.comments_on_memories.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchUserLikeOnMemoryComment = (commentId,userId,withCommentDetails=false, transaction = null, scope = "defaultScope") => {
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
                  model: models.comments_on_memories,
                  as: "commentDetails"
              }
            ];
            }


            let orm = models.likes_on_memory_comments.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }


    const memoryCommentList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let memory_id = filters.memory_id;
          let offset = null;
          let limit = null;
          if(filters.page!=null && filters.limit!=null &&  filters.page!='' && filters.limit!=''){
            let page = parseInt(filters.page);
            limit = parseInt(filters.limit);
            offset = (page - 1) * limit;
          }
          let orm = {
              limit,
              offset,
              where: {memory_id}
          }

          orm.include = [{
              model: models.users,
              as: "userDetails"
          }];


          models.comments_on_memories.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const countLikesOnMemoryComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_memory_comments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countUnLikesOnMemoryComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"0" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_memory_comments.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllLikesOnMemoryComments = (commentId, transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { commentId,isLiked:"1" },
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.likes_on_memory_comments.findAll(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeOnComment = (likeOnComment, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.likes_on_memory_comments.create(likeOnComment, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateCommentLike = (id,commentLike, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.likes_on_memory_comments.update(commentLike, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
    }


    return {
        createNewAlbum,
        updateAlbum,
        getAlbum,
        addMemory,
        getAlbumName,
        addAlbumFiles,
        updateAlbumFiles,
        tagUser,
        albumList,
        getTagedUser,
        getFiles,
        getAllMemories,
        countMemories,
        updateMemory,
        getMemory,
        fetchMemory,
        deleteAlbum,
        deleteAlbumMemories,
        likeMemory,
        updateMemoryLike,
        fetchLike,
        fetchUserLikeOnMemory,
        fetchUserCommentsOnMemory,
        getAllLikesOnMemory,
        countLikesOnMemory,
        countUnLikesOnMemory,
        countCommentsOnMemory,
        addMemoryComments,
        updateMemoryComments,
        deleteMemoryComments,
        fetchComments,
        likeOnComment,
        updateCommentLike,
        memoryCommentList,
        countLikesOnMemoryComments,
        countUnLikesOnMemoryComments,
        getAllLikesOnMemoryComments,
        fetchUserLikeOnMemoryComment
    }
}
