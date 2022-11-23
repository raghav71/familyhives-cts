const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
  const add = (wish, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.wishes.create(wish, { transaction })
              .then(resolve).catch(reject);
      })
  }

  const update = (id, data, transaction = null) => {
      console.log("WishService => update")
      return new Promise(function(resolve, reject){
          models.wishes.update(data, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
  }

  const deleteWish = (query, transaction = null) => {
      console.log("WishService => delete")
      return new Promise(function(resolve, reject){
          models.wishes.destroy({ where: query, transaction })
              .then(resolve).catch(reject);
      })
  }


  const fetch = (id, transaction = null) => {
      console.log("WishService => fetch")
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
            as: "userDetails"
        },{
            model: models.users,
            as: "wish_by"
        }];

          let orm = models.wishes.findOne(query);

          orm.then(resolve).catch(reject);
      })
  }

  const getList = (filters, transaction = null) => {
      return new Promise(function(resolve, reject){
        let page = parseInt(filters.page || 1);
        let limit = parseInt(filters.limit || 10);
        let offset = (page - 1) * limit;
        query ={};
        if(filters.userId)
          query.userId=filters.userId;
        if(filters.partnerId)
          query.partnerId=filters.partnerId;
        if(filters.type)
          query.type=filters.type;
        let orm = {
            limit,
            offset,
            where: query,
            order: [
                ['id', 'DESC']
            ]
        }


        orm.include = [{
            model: models.users,
            as: "userDetails"
        },{
            model: models.users,
            as: "wish_by"
        }];




        models.wishes.findAndCountAll(orm)
            .then(resolve).catch(reject);
      })
  }

  const getAllBirthdayUser = (day,month,user_ids, transaction = null) => {
    console.log("WishService=>getAllBirthdayUser");
      return new Promise(function(resolve, reject){

        let orm = {
            where:{id:{[Op.in]:user_ids},$and:models.sequelize.where(models.sequelize.fn('date_format', models.sequelize.col('dob'), '%m-%d'), month+'-'+day)},
            attributes: ["id","name","email","mobile","countryCode","gender","dob","aniversary","image",
            //[models.sequelize.literal("'1'"), 'type'], //custom column name
        ],
            order: [
                ['id', 'DESC']
            ]
        }






        models.users.findAll(orm)
            .then(resolve).catch(reject);
      })
  }

  const getAllAniversaryUser = (day,month,user_ids, transaction = null) => {
    console.log("WishService=>getAllAniversaryUser");
      return new Promise(function(resolve, reject){

        let orm = {
            where:{id:{[Op.in]:user_ids},$and:models.sequelize.where(models.sequelize.fn('date_format', models.sequelize.col('aniversary'), '%m-%d'), month+'-'+day)},
            attributes: ["id","name","email","mobile","countryCode","gender","dob","aniversary","image",
            //[models.sequelize.literal("'2'"), 'type'], //custom column name
        ],
            order: [
                ['id', 'DESC']
            ]
        }

      models.users.findAll(orm)
            .then(resolve).catch(reject);
      })
  }


  const checkWishedUser = (userId,partnerId,year,type, transaction = null) => {
    return new Promise(function(resolve, reject){

        let orm = {
            where: {userId,partnerId,type,
            where: models.sequelize.and(
              models.sequelize.where(models.sequelize.fn('YEAR', models.sequelize.col('createdAt')), year)
            )
          },
            order: [
                ['id', 'DESC']
            ]
        }
        models.wishes.findAll(orm)
            .then(resolve).catch(reject);
    })
  }

  const getAllWishedData = (user_ids,year,filters, transaction = null) => {
    return new Promise(function(resolve, reject){
      let page = parseInt(filters.page || 1);
      let limit = parseInt(filters.limit || 10);
      let offset = (page - 1) * limit;
      let where_query = {userId:{[Op.in]:user_ids},
      where: models.sequelize.and(
        models.sequelize.where(models.sequelize.fn('YEAR', models.sequelize.col('wishes.createdAt')), year)
      )
    }
      if(filters.search) where_query.message={[Op.like]:'%'+filters.search+'%'};
        let orm = {
            limit,
            offset,
            where: where_query,
            include:[{
              model: models.users,
              as: "wish_by"
            }],
            order: [
                ['id', 'DESC']
            ]
        }
        models.wishes.findAll(orm)
            .then(resolve).catch(reject);
    })
  }


  return {
    add,
    update,
    deleteWish,
    fetch,
    getList,
    getAllBirthdayUser,
    getAllAniversaryUser,
    checkWishedUser,
    getAllWishedData
  }
}
