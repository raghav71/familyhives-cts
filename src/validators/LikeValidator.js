const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateType = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.query, {
          type: validations.general.requiredString

        });

        validate(v, res, next, req);
    }


    return {
        validateType
    }
}
