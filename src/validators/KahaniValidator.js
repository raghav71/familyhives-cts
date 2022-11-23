const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateKahani = async (req, res, next) => {

        const v = new Validator(req.body, {
            title: validations.general.requiredString,
            privacy: validations.general.requiredString,
            file: validations.general.requiredString,
            content_type: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateKahaniPrivacy = async (req, res, next) => {

        const v = new Validator(req.body, {
            privacy: validations.general.requiredString

        });

        validate(v, res, next, req);
    }


    const validateKahaniComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            kahaniId: validations.kahani.kahaniId,
            commentType: validations.general.requiredString


        });

        validate(v, res, next, req);
    }

    const validateEditKahaniComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.kahani.commentId,
            commentType: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateDeleteKahaniComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.kahani.commentId,
        });

        validate(v, res, next, req);
    }

    const validateKahaniLike = async (req, res, next) => {

        const v = new Validator(req.body, {
            kahaniId: validations.kahani.kahaniId,
            userId: validations.kahani.userId,
            like_type: validations.general.requiredString,
            isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateLikeOnComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.kahani.commentId,
            userId: validations.kahani.userId,
            like_type: validations.general.requiredString,
            isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateKahaniId = async (req, res, next) => {

        const v = new Validator(req.body, {
            kahaniId: validations.kahani.kahaniId
        });

        validate(v, res, next, req);
    }

    return {
        validateKahaniId,
        validateKahani,
        validateKahaniComment,
        validateEditKahaniComment,
        validateDeleteKahaniComment,
        validateKahaniLike,
        validateKahaniPrivacy,
        validateLikeOnComment
    }
}
