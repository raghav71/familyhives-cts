const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {

  const fetch = (id, withProfessionalData = false, transaction = null, scope = "defaultScope") => {
      console.log("AdminService => fetch")
      return new Promise(function(resolve, reject){
          let query = {
              where : { id },
              attributes: {
                  exclude: ["password","createdAt","updatedAt"]
              },
              transaction
          };


          let orm = models.admin.scope(scope).findOne(query)
          orm.then(resolve).catch(reject);
      })
  }

    const fetchByEmail = (email, transaction = null) => {
        console.log("AdminService => fetchByEmail")
        return new Promise(function(resolve, reject){
            let orm = models.admin.findOne({
                where : {
                    email
                },
                attributes: {
                    exclude: ["password","createdAt","updatedAt","deletedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const verifyPassword = (id, password, transaction = null) => {
        console.log("AdminService => verifyPassword")
        return new Promise(async function(resolve, reject){
            let admin = await models.admin.findOne({
                where : { id },
                attributes: {
                    include: ["password"]
                },
                transaction
            })

            if(!admin) resolve(false);
            let v = await helpers().checkPassword(password, admin.password)

            return resolve(v);
        })
    }

    const updatePassword = (adminId, password, transaction = null) => {
        console.log("AdminService => update")
        return new Promise(function(resolve, reject){
            models.admin.update(password, { where: { id: adminId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const changeUserStatus = (userId,status, transaction = null) => {
        console.log("AdminService => changeUserStatus")
        return new Promise(function(resolve, reject){
            models.users.update(status, { where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteUser = (userId, transaction = null) => {
        console.log("AdminService => deleteUser")
        return new Promise(function(resolve, reject){
            models.users.destroy({ where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }
    
    return {
      fetch,
      fetchByEmail,
      verifyPassword,
      updatePassword,
      changeUserStatus,
      deleteUser
    }
}
