const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateFriendId = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            friendId: validations.userIdExists,
        });

        validate(v, res, next, req);
    }

    const validateAcceptRejectRequest = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            request_id: validations.friend.request,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }
    const validateGetFriendList = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
            mobile: validations.general.required
        });

        validate(v, res, next, req);
    }

    const validateBlockFriend = async (req, res, next) => {
        console.log(req.body);
        const v = new Validator(req.body, {
          friendId: validations.general.required,
          isBlocked: validations.general.required,
        });

        validate(v, res, next, req);
    }


    return {
        validateFriendId,
        validateAcceptRejectRequest,
        validateGetFriendList,
        validateBlockFriend
    }
}
