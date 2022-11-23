const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
  const loginValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
          email: validations.admin.email,
          password: validations.admin.password
      });

      validate(v, res, next, req);
  }

  const forgotPasswordValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
          email: validations.admin.email
      });

      validate(v, res, next, req);
  }

  const otpValidator = async (req, res, next) => {
      const v = new Validator(req.query, {
        code: validations.otpCode,
        email: validations.admin.email
      });

      validate(v, res, next, req);
  }

  const passwordValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          password: validations.password
      });

      validate(v, res, next, req);
  }

  const changeUserStatusValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          userId: validations.admin.userId,
          status: validations.admin.status
      });

      validate(v, res, next, req);
  }

  const deleteUserValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
          userId: validations.admin.userId
      });

      validate(v, res, next, req);
  }

  const aboutUsValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          about: validations.admin.about_us
      });

      validate(v, res, next, req);
  }

  const privacyPolicyValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          privacy_policy: validations.admin.privacy_policy
      });

      validate(v, res, next, req);
  }

  const termAndConditionValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          term_and_condition: validations.admin.term_and_conditions
      });

      validate(v, res, next, req);
  }

  const FAQsValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          question: validations.general.required
      });

      validate(v, res, next, req);
  }
  const FAQsIdValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          faq_id: validations.faq.id
      });

      validate(v, res, next, req);
  }

  const userDetailsValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
          userId: validations.admin.userId
      });

      validate(v, res, next, req);
  }

  const albumDetailsValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
          albumId: validations.admin.albumId
      });

      validate(v, res, next, req);
  }

  const languageValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        language: validations.language.code
      });

      validate(v, res, next, req);
  }

  const statusValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        status: validations.general.required
      });

      validate(v, res, next, req);
  }

    return {
        loginValidator,
        forgotPasswordValidator,
        otpValidator,
        passwordValidator,
        changeUserStatusValidator,
        deleteUserValidator,
        aboutUsValidator,
        privacyPolicyValidator,
        termAndConditionValidator,
        FAQsValidator,
        FAQsIdValidator,
        userDetailsValidator,
        albumDetailsValidator,
        languageValidator,
        statusValidator
    }
}
