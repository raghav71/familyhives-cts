const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const addFeed = (feeds, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.feeds.create(feeds, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const editFeed = (query,feeds, transaction = null) => {

      return new Promise(function(resolve, reject){
          models.feeds.update(feeds, { where: query, transaction })
              .then(resolve).catch(reject);
      })
    }


    const fetch = (id,withOtherData=false,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : { id },
                attributes: {
                    exclude: ["updatedAt"]
                },
                transaction
            };
            if(withOtherData) {
              query.include = [{
                  model: models.users,
                  as: "created_by"
              },{
                  model: models.comments,
                  as: "Comments"
              },{
                  model: models.likes,
                  as: "Likes"
              }];
          }


            let orm = models.feeds.scope(scope).findOne(query)
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
                as: "created_by"
            }]


            let orm = models.feeds.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const countFeed = (filters,transaction) => {
      console.log("FeedService=>countFeed");
      console.log(filters);
      return new Promise(function(resolve, reject){
        let page = parseInt(filters.page || 1);
        let limit = parseInt(filters.limit || 10);
        let offset = (page - 1) * limit;
        console.log('filters');
        console.log(filters);
        let where ={family_tree:filters.family_tree};
        if(filters.userId) where.userId=filters.userId;
        if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};
        let orm = {
            limit,
            offset,
            where: where
        }


        models.feeds.count(orm)
            .then(resolve).catch(reject);
      })
    }

    const feedList = (filters, transaction = null) => {
        return new Promise(function(resolve, reject){
          let page = parseInt(filters.page || 1);
          let limit = parseInt(filters.limit || 10);
          let offset = (page - 1) * limit;
          console.log('filters');
          console.log(filters);
          let order_by = [ ['lastCommentAt', 'DESC']];

          let where ={family_tree:filters.family_tree};
          if(filters.userId) where.userId=filters.userId;
          if(filters.feed_type) where.feed_type=filters.feed_type;
          //if(filters.feed_type=="memory") order_by = [ ['updatedAt', 'DESC'] ];
          if(filters.search) where.title={[Op.like]:'%'+filters.search+'%'};
          let orm = {
              limit,
              offset,
              where: where,
              order: order_by
          }
          orm.include = [{
              model: models.users,
              as: "created_by"
          }]
          models.feeds.findAndCountAll(orm)
              .then(resolve).catch(reject);
        })
    }

    const deleteFeed = (query, transaction = null) => {

      return new Promise(function(resolve, reject){

        models.feeds.destroy({ where: query, transaction })
            .then(resolve).catch(reject);
        })
    }

    const fetchAllByQuery = (where_query,transaction = null, scope = "defaultScope") => {
        return new Promise(function(resolve, reject){
            let query = {
                where : where_query,
                order: [
                    ['lastCommentAt', 'DESC']
                ],
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            query.include = [{
                model: models.users,
                as: "created_by"
            }]


            let orm = models.feeds.scope(scope).findAll(query)
            orm.then(resolve).catch(reject);
        })
    }


    return {
        addFeed,
        fetch,
        fetchByQuery,
        fetchAllByQuery,
        editFeed,
        feedList,
        countFeed,
        deleteFeed
    }
}
