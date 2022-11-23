const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateRecipe = async (req, res, next) => {

        const v = new Validator(req.body, {
            title: validations.general.requiredString,
            privacy: validations.general.requiredString,
            file: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateRecipePrivacy = async (req, res, next) => {

        const v = new Validator(req.body, {
            privacy: validations.general.requiredString

        });

        validate(v, res, next, req);
    }


    const validateRecipeComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            recipeId: validations.recipe.recipeId,
            commentType: validations.general.requiredString


        });

        validate(v, res, next, req);
    }

    const validateEditRecipeComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.recipe.commentId,
            commentType: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateDeleteRecipeComment = async (req, res, next) => {

        const v = new Validator(req.body, {
            commentId: validations.recipe.commentId,
        });

        validate(v, res, next, req);
    }

    const validateRecipeLike = async (req, res, next) => {

        const v = new Validator(req.body, {
            recipeId: validations.recipe.recipeId,
            userId: validations.recipe.userId,
            like_type: validations.general.requiredString,
            isLiked: validations.general.requiredString

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
    const validateDeleteRecipe = async (req, res, next) => {

        const v = new Validator(req.body, {
            recipeId: validations.feed.id


        });

        validate(v, res, next, req);
    }

    return {
        validateRecipe,
        validateRecipeComment,
        validateEditRecipeComment,
        validateDeleteRecipeComment,
        validateRecipeLike,
        validateRecipePrivacy,
        validateLikeOnComment,
        validateDeleteRecipe
    }
}
