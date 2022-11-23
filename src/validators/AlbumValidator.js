const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const validateAlbum = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          album_name: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateMemory = async (req, res, next) => {

        const v = new Validator(req.body, {
          title: validations.general.requiredString,
          content_type: validations.general.requiredString,
          feed_type: validations.general.requiredString,

        });

        validate(v, res, next, req);
    }

    const validateDeleteAlbum = async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          album_id: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateMemoryId= async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          memory_id: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateGetAlbumId= async (req, res, next) => {
      console.log(req.query);
        const v = new Validator(req.query, {
          album_id: validations.general.requiredString,
          data_type: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateGetMemoryId= async (req, res, next) => {
      console.log(req.query);
        const v = new Validator(req.query, {
          memory_id: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateLikeMemory= async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          memory_id: validations.general.requiredString,
          like_type: validations.general.requiredString,
          isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateMemoryComment= async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          memory_id: validations.general.requiredString,
          commentType: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateEditMemoryComment= async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          commentId: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    const validateLikeOnComment= async (req, res, next) => {
      console.log(req.body);
        const v = new Validator(req.body, {
          commentId: validations.general.requiredString,
          like_type: validations.general.requiredString,
          isLiked: validations.general.requiredString

        });

        validate(v, res, next, req);
    }

    return {
        validateAlbum,
        validateMemory,
        validateDeleteAlbum,
        validateMemoryId,
        validateGetMemoryId,
        validateGetAlbumId,
        validateLikeMemory,
        validateMemoryComment,
        validateEditMemoryComment,
        validateLikeOnComment
    }
}
