const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {


      const getSetting = ( transaction = null, scope = "defaultScope") => {
          console.log("SettingService => getSetting")
          return new Promise(function(resolve, reject){
              let query = {
                  attributes: {
                      exclude: ["deletedAt","createdAt","updatedAt"]
                  },
                  transaction
              };


              let orm = models.setting.scope(scope).findOne(query)
              orm.then(resolve).catch(reject);
          })
      }

      const updateSetting = ( setting,transaction = null, scope = "defaultScope") => {
          console.log("SettingService => updateSetting")
          return new Promise(function(resolve, reject){
              models.setting.update(setting, { where: { }, transaction })
                  .then(resolve).catch(reject);
          })
      }

      const addAboutUs = (data, transaction = null) => {
          return new Promise(function(resolve, reject){
              models.about.create(data, { transaction })
                  .then(resolve).catch(reject);
          })
      }

      const updateAbout = ( query,data,transaction = null, scope = "defaultScope") => {
          console.log("SettingService => updateAbout")
          return new Promise(function(resolve, reject){
              models.about.update(data, { where: query, transaction })
                  .then(resolve).catch(reject);
          })
      }
      const getAbout = (query, transaction = null, scope = "defaultScope") => {
          console.log("SettingService => getSetting")
          return new Promise(function(resolve, reject){
            let where_query = {
              where: query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
            }
            let orm = models.about.scope(scope).findOne(where_query)
              orm.then(resolve).catch(reject);
          })
      }
      const addTermAndCondition = (data, transaction = null) => {
          return new Promise(function(resolve, reject){
              models.termAndCondition.create(data, { transaction })
                  .then(resolve).catch(reject);
          })
      }
      const updateTermAndCondition = (query, data,transaction = null, scope = "defaultScope") => {
          console.log("SettingService => updateTermAndCondition")
          return new Promise(function(resolve, reject){
              models.termAndCondition.update(data, { where: query, transaction })
                  .then(resolve).catch(reject);
          })
      }
      const getTermAndCondition = (query, transaction = null, scope = "defaultScope") => {
          console.log("SettingService => getTermAndCondition")
          return new Promise(function(resolve, reject){
            let where_query = {
              where: query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
            }
            let orm = models.termAndCondition.scope(scope).findOne(where_query)
              orm.then(resolve).catch(reject);
          })
      }

      const addPrivacyAndPolicy = (data, transaction = null) => {
          return new Promise(function(resolve, reject){
              models.privacyAndPolicies.create(data, { transaction })
                  .then(resolve).catch(reject);
          })
      }
      const updatePrivacyAndPolicy = (query, data,transaction = null, scope = "defaultScope") => {
          console.log("SettingService => updatePrivacyAndPolicy")
          return new Promise(function(resolve, reject){
              models.privacyAndPolicies.update(data, { where: query, transaction })
                  .then(resolve).catch(reject);
          })
      }

      const getPrivacyAndPolicies = (query, transaction = null, scope = "defaultScope") => {
          console.log("SettingService => getTermAndCondition")
          return new Promise(function(resolve, reject){
            let where_query = {
              where: query,
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
            }
            let orm = models.privacyAndPolicies.scope(scope).findOne(where_query)
              orm.then(resolve).catch(reject);
          })
      }

      const addFAQs = (data, transaction = null) => {
          return new Promise(function(resolve, reject){
              models.FAQs.create(data, { transaction })
                  .then(resolve).catch(reject);
          })
      }

      const updateFAQs = ( query,data,transaction = null, scope = "defaultScope") => {
          console.log("SettingService => updateFAQs")
          return new Promise(function(resolve, reject){
              models.FAQs.update(data, { where: query, transaction })
                  .then(resolve).catch(reject);
          })
      }

      const deleteFAQs = (query, transaction = null) => {
          console.log("SettingService => deleteFAQs")
          return new Promise(function(resolve, reject){
              models.FAQs.destroy({ where: query, transaction })
                  .then(resolve).catch(reject);
          })
      }

      const getAllFAQs = (filters, transaction = null, scope = "defaultScope") => {
          console.log("SettingService => getAllFAQs")
          return new Promise(function(resolve, reject){
            let page = parseInt(filters.page || 1);
            let limit = parseInt(filters.limit || 10);
            let offset = (page - 1) * limit;
            where ={language:filters.language};
            if(filters.search) where.question={[Op.like]:'%'+filters.search+'%'};
            if(filters.status) where.status=filters.status;

            let query = {
                limit,
                offset,
                where: where,
                attributes: {
                    exclude: ["createdAt","updatedAt"]
                },
                transaction
            };

            let orm = models.FAQs.findAndCountAll(query);
              orm.then(resolve).catch(reject);
          })
      }



      const getAllLanguages = (query, transaction = null) => {
          console.log("SettingService => getAllFAQAnswers")
          return new Promise(function(resolve, reject){
            let orm = models.languages.findAll(query);
              orm.then(resolve).catch(reject);
          })
      }


    return {
        getSetting,
        updateSetting,
        addAboutUs,
        updateAbout,
        getAbout,
        addTermAndCondition,
        updateTermAndCondition,
        getTermAndCondition,
        addPrivacyAndPolicy,
        updatePrivacyAndPolicy,
        getPrivacyAndPolicies,
        addFAQs,
        updateFAQs,
        deleteFAQs,
        getAllFAQs,
        getAllLanguages
    }
}
