const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const mobileValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
            language:validations.general.required,
            mobile: validations.mobile,
            countryCode: validations.countryCode,
            device_type:validations.device_type
        });

        validate(v, res, next, req);
    }

    const resendOtpMobileValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
            language:validations.general.required,
            mobile: validations.existsMobile,
            countryCode: validations.countryCode
        });

        validate(v, res, next, req);
    }

    const loginValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
            language:validations.general.required,
            mobile: validations.mobile,
            countryCode: validations.countryCode,
            password: validations.password,
            device_type:validations.device_type,
        });

        validate(v, res, next, req);
    }



    const otpValidator = async (req, res, next) => {
        const v = new Validator(req.query, {
          language:validations.general.required,
          mobile: validations.existsMobile,
          countryCode: validations.countryCode,
          code: validations.otpCode
        });

        validate(v, res, next, req);
    }

    const profileValidator = async (req, res, next) => {
        if(!req.body.aniversary || req.body.aniversary=='')
         req.body.aniversary=null;
        const v = new Validator(req.body, {
          name: validations.name,
          email: validations.uniqueEmail,
          dob: validations.dob,
          aniversary: validations.aniversary,
          gender: validations.gender,
          password: validations.password,
          device_type:validations.device_type
        });

        validate(v, res, next, req);
    }

    const editProfileValidator = async (req, res, next) => {
      console.log("AuthValidator=>editProfileValidator");
      console.log(req.body);
        if(!req.body.aniversary || req.body.aniversary=='')
         req.body.aniversary=null;
        const v = new Validator(req.body, {
          name: validations.name,
          countryCode: validations.countryCode,
          mobile: validations.mobile,
          email: validations.check_email,
          dob: validations.dob,
          aniversary: validations.aniversary,
          gender: validations.gender
        });

        validate(v, res, next, req);
    }

    const passwordValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            language:validations.general.required,
            password: validations.password
        });

        validate(v, res, next, req);
    }

    const changePasswordValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
          new_password: validations.new_password,
          current_password: validations.current_password
        });

        validate(v, res, next, req);
    }

    const socialLoginValidator = async (req, res, next) => {
        console.log("AuthValidator => socialLoginValidator");

        const v = new Validator(req.body, {
            language:validations.general.required,
            facebookId: validations.social.facebookId,
            googleId: validations.social.googleId,
            appleId: validations.social.appleId,
            email: validations.social.email,
            name: validations.social.name,
            device_type:validations.device_type
        });

        validate(v, res, next, req);
    }

    const languageValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
          language: validations.general.required
        });

        validate(v, res, next, req);
    }



    return {
        mobileValidator,
        otpValidator,
        profileValidator,
        editProfileValidator,
        passwordValidator,
        changePasswordValidator,
        socialLoginValidator,
        loginValidator,
        resendOtpMobileValidator,
        languageValidator
    }
}
