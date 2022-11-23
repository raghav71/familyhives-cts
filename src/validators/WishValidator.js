const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateWish = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          partnerId: validations.general.requiredString,
          message: validations.general.requiredString,
          type: validations.general.requiredString,
          wishId: validations.wish.id

        });

        validate(v, res, next, req);
    }

    const validateWishId = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          wishId: validations.general.requiredString

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
    const validateWishLike = async (req, res, next) => {

        const v = new Validator(req.body, {
            wish_id: validations.wish.id,
            like_type: validations.general.requiredString,
            isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }
    const validateWishComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            wish_id: validations.wish.id,
            commentType: validations.general.requiredString


        });

        validate(v, res, next, req);
    }

    const validateDeleteWishComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.general.requiredString
        });

        validate(v, res, next, req);
    }

    const validateLikeOnComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.recipe.commentId,
            userId: validations.recipe.userId,
            like_type: validations.general.requiredString,
            isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    return {
        validateWish,
        validateWishId,
        validateDate,
        validateWishLike,
        validateWishComment,
        validateDeleteWishComment,
        validateLikeOnComment
    }
}
