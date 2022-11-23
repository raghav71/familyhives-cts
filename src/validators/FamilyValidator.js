const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const familyMemberValidator = async (req, res, next) => {
        console.log(req.body);
        if(req.body.parent==0){
        const v = new Validator(req.body, {
            name: validations.general.required,
            isMarried:validations.general.required,
            mobile:validations.general.required,
            countryCode:validations.general.required,
        });
        validate(v, res, next, req);
        }else {
          const v = new Validator(req.body, {
              name: validations.general.required,
              isMarried:validations.general.required,
              mobile:validations.general.required,
              countryCode:validations.general.required,
              parent:validations.family.id,
          });
          validate(v, res, next, req);
        }

    }

    const familyMemberIdValidator = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            memberId: validations.family.id
        });

        validate(v, res, next, req);
    }

    const validateMobile = async (req, res, next) => {
        const v = new Validator(req.query, {
            mobile:validations.general.required,
            countryCode:validations.general.required,
        });

        validate(v, res, next, req);
    }

    const validateDeviceToken = async (req, res, next) => {
        const v = new Validator(req.body, {
            device_token:validations.general.required,
            device_type:validations.general.required
        });

        validate(v, res, next, req);
    }

    const familyTreeValidator = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            active_tree: validations.general.required
        });

        validate(v, res, next, req);
    }

    const updateRelationValidator = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
          memberId: validations.family.id,
          relationship_name: validations.general.required
        });

        validate(v, res, next, req);
    }

    const updateFamilyTreeValidator = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
          family_tree_id: validations.family_tree.id,
          family_tree_name: validations.general.required
        });

        validate(v, res, next, req);
    }



    const familyTreeIdValidator = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            family_tree_id: validations.family_tree.id
        });

        validate(v, res, next, req);
    }
    return {
        familyMemberValidator,
        familyMemberIdValidator,
        validateMobile,
        validateDeviceToken,
        familyTreeValidator,
        updateRelationValidator,
        updateFamilyTreeValidator,
        familyTreeIdValidator
    }
}
