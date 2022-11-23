const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
  const add = (alarm, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.alarm.create(alarm, { transaction })
              .then(resolve).catch(reject);
      })
  }

  const update = (id, data, transaction = null) => {
      console.log("AlarmService => update")
      return new Promise(function(resolve, reject){
          models.alarm.update(data, { where: { id }, transaction })
              .then(resolve).catch(reject);
      })
  }

  const deleteAlarm = (query, transaction = null) => {
      console.log("AlarmService => delete")
      return new Promise(function(resolve, reject){
          models.alarm.destroy({ where: query, transaction })
              .then(resolve).catch(reject);
      })
  }


  const fetch = (id, transaction = null) => {
      console.log("AlarmService => fetch")
      return new Promise(function(resolve, reject){

        let query = {
            where : {id},
            attributes: {
                exclude: ["deletedAt","updatedAt"]

            },
            transaction
        }

          let orm = models.alarm.findOne(query);

          orm.then(resolve).catch(reject);
      })
  }

  const getList = (query, transaction = null) => {
      return new Promise(function(resolve, reject){
        let orm = {
            where: query,
            order: [
                ['id', 'DESC']
            ]
        }





        models.alarm.findAndCountAll(orm)
            .then(resolve).catch(reject);
      })
  }



  return {
    add,
    update,
    deleteAlarm,
    fetch,
    getList
  }
}
