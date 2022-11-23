const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
  const validateNotification = async (req, res, next) => {

      const v = new Validator(req.body, {
        subject: validations.general.requiredString,
        sentTo: validations.general.requiredString
      });

      validate(v, res, next, req);
  }
    const validateGetNotification = async (req, res, next) => {

        const v = new Validator(req.query, {
            user_type: validations.general.requiredString
        });
        req.body.user_type = req.query.user_type;
        validate(v, res, next, req);
    }
    const validateNotificationPermission = async (req, res, next) => {

        const v = new Validator(req.body, {
          notification_permission: validations.general.requiredString
        });

        validate(v, res, next, req);
    }

    const validateUpdateNotification = async (req, res, next) => {

        const v = new Validator(req.body, {
          user_type: validations.general.requiredString,
          isRead: validations.general.requiredString,
          message_id: validations.general.requiredString
        });

        validate(v, res, next, req);
    }


    const validateDeleteNotification = async (req, res, next) => {

        const v = new Validator(req.body, {
          notification_id: validations.general.requiredString
        });

        validate(v, res, next, req);
    }

    return {
        validateNotification,
        validateGetNotification,
        validateNotificationPermission,
        validateUpdateNotification,
        validateDeleteNotification
    }
}
