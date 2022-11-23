const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateAlarm = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          alarm_type: validations.general.requiredString,
          file: validations.general.requiredString,
          time: validations.general.requiredString,
          is_repeat: validations.general.requiredString,
          days: validations.general.requiredText
        });

        validate(v, res, next, req);
    }

    const validateAlarmId = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          alarmId: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateDate = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.query, {
          date: validations.general.nullableDate

        });

        validate(v, res, next, req);
    }

    const validateAlarmStatus = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          alarmId: validations.general.requiredString,
          status: validations.general.requiredString,

        });

        validate(v, res, next, req);
    }

    return {
        validateAlarm,
        validateAlarmId,
        validateDate,
        validateAlarmStatus
    }
}
