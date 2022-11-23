const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateCreateGroup = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
          group_name: validations.general.required,
          members_data: validations.general.required
        });

        validate(v, res, next, req);
    }

    const validateGroupId = async (req, res, next) => {
        const v = new Validator(req.query, {
          group_id: validations.twilio.group_id
        });

        validate(v, res, next, req);
    }

    const validateGroupImage = async (req, res, next) => {
        const v = new Validator(req.body, {
          group_id: validations.twilio.group_id,
          image: validations.general.required
        });

        validate(v, res, next, req);
    }

    const validateGenerateToken = async (req, res, next) => {
        const v = new Validator(req.query, {
          token_type: validations.general.required
        });

        validate(v, res, next, req);
    }



    const validateIndividualMember = async (req, res, next) => {

        const user_v = new Validator(req.body, {
            isFamilyMember: validations.general.required,
            partner_id: validations.userIdExists
          });

          validate(user_v, res, next, req);

    }

    const validateGetIndividualChat = async (req, res, next) => {
        console.log(req.query);
        const v = new Validator(req.query, {
          type: validations.general.required
        });

        validate(v, res, next, req);
    }

    const validateRemoveParticipants = async (req, res, next) => {

        const v = new Validator(req.body, {
          group_sid: validations.twilio.group_sid,
          member_sid: validations.twilio_group_members.member_sid,
          member_id: validations.twilio_group_members.member_id
        });

        validate(v, res, next, req);
    }

    const validateParticipantsId = async (req, res, next) => {
        const v = new Validator(req.body, {
          member_id: validations.twilio_group_members.id
        });

        validate(v, res, next, req);
    }

    const validateChatHistory = async (req, res, next) => {
        const v = new Validator(req.body, {
          group_sid: validations.twilio.group_sid,
          messages_sid: validations.general.required

        });

        validate(v, res, next, req);
    }

    const validateChatId = async (req, res, next) => {
        const v = new Validator(req.body, {
          partner_id: validations.userIdExists,
          isBlocked: validations.general.required
        });

        validate(v, res, next, req);
    }

    const validateGenerateVirgilToken = async (req, res, next) => {
        const v = new Validator(req.query, {
          user_id: validations.general.required

        });

        validate(v, res, next, req);
    }

    return {
        validateCreateGroup,
        validateGroupId,
        validateGroupImage,
        validateGenerateToken,
        validateIndividualMember,
        validateGetIndividualChat,
        validateRemoveParticipants,
        validateParticipantsId,
        validateChatHistory,
        validateChatId,
        validateGenerateVirgilToken
    }
}
