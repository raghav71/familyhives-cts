const { models } = require("../models");
module.exports = () => {
    const addNotification = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.notification.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getNotification = (query,page,limit, transaction=null) => {
      return new Promise(function(resolve, reject){
        page = parseInt(page || 1);
        limit = parseInt(limit || 10);
        let offset = (page - 1) * limit;
        let orm = {
            limit,
            offset,
            where: query,
            order: [
                ['id', 'DESC']
            ]
        }
          models.notification.findAll(orm)
          .then(resolve).catch(reject);
      })
    }

    const fetch = (_id) => {
      return new Promise(function(resolve, reject){
          let query = {_id };


          let orm = models.notification.findOne(query)
          orm.then(resolve).catch(reject);
      })
    }

    const updateNotification = (id, data, transaction=null) => {
        console.log("NotificationService => updateNotification")
        return new Promise(async function(resolve, reject){
          let notification = await models.notification.findByIdAndUpdate({_id:id},data).then(resolve).catch(reject);
        })
    }

    const countNotification = (query, transaction=null) => {
        console.log("NotificationService => countNotification")
        return new Promise(async function(resolve, reject){
          let notification = await models.notification.count(query).then(resolve).catch(reject);
        })
    }

    const updateMultipleNotification = (query, data, transaction=null) => {
        console.log("NotificationService => updateMultipleNotification")
        return new Promise(async function(resolve, reject){
          let notification = await models.notification.update(data,{where:query, transaction}).then(resolve).catch(reject);
        })
    }




    return {
      addNotification,
      fetch,
      getNotification,
      updateNotification,
      countNotification,
      updateMultipleNotification,
    }

  }
  //session.endSession();
