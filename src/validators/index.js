const validator = require("node-input-validator")
const ResponseMiddleware = require("../middlewares/ResponseMiddleware.js");
const helpers = require("../util/helpers.js");
const { models } = require("../models");
validator.extend("unique", async function({value, args}){
    console.log("ValidatorsIndex => unique", args);

    let result = null;

    if(args.length > 2) {
        result = await models[args[0]]
            .findOne({
                where : {
                    [args[1]]: value,
                    [args[2]]: { $not: args[3] }
                }
            })
    } else {
        result = await models[args[0]]
            .findOne({
                where : {
                    [args[1]]: value
                }
            })
    }
    return !result ? true : false;
})


/**
 * to check given id exists in given table
 * additional column checks can be passed in pairs
 * e.g exists:table_name,primary_id,col1,value1,col2,value2 and so on
 * col-value must be in pairs
 */
validator.extend("exists", async function({value, args}){
    console.log("ValidatorsIndex => exists");

    let result = await models[args[0]]
        .findOne({
            where: {
                [args[1]]: value
            }
        })

    return result ? true : false
})

validator.extend("allowedValues", ({value, args}) => {
    return args.indexOf(value) > -1 ? true : false
})

module.exports = {
    //common function to send validation response
    validate : (v, res, next, req = null) => {
        console.log("ValidatorsIndex => validate");

        if(v.check().then(function(matched){
            if(!matched){
                req.rCode = 0;
                let message = helpers().getErrorMessage(v.errors)

                ResponseMiddleware(req, res, next, message);
            }else{
                next()
            }
        }));
    },

    validations: {
        general: {
            requiredNumeric: "required|numeric",
            required: "required",
            nullable: "nullable",
            requiredInt: "required|integer",
            requiredString: "required|string|maxLength:255",
            nullableString: "nullable|string|maxLength:255",
            requiredText: "required|string|maxLength:5000",
            requiredTodayOrAfterDate: "required|dateAfterToday:today,.|date",
            requiredDate: "required|date",
            nullableDate: "nullable|date"
        },

        userIdExists: "required|exists:users,id",
        otpCode: "required|string|maxLength:6",
        countryCode: "required|string|maxLength:20",
        mobile: "required|string|maxLength:15|minLength:8",
        nullablemobile: "string|maxLength:15|minLength:8",
        name: "required|string|maxLength:50",
        email: "string|unique:users,email|maxLength:50",
        check_email: "string|email|maxLength:50",
        password: "required|string",
        new_password: "required|string",
        current_password: "required|string",
        gender: "required|string",
        device_type: "required|string",
        dob: "required|date",
        aniversary: "nullable|date",
        image: "nullable|string|maxLength:300",
        uniqueMobile: "required|string|unique:users,mobile|maxLength:15|minLength:8",
        existsMobile: "required|string|exists:users,mobile|maxLength:15|minLength:8",

        uniqueEmail: "email|unique:users,email|maxLength:50",
        uniqueNullableEmail: "nullable|email|unique:users,email|maxLength:50",
        existsEmail: "email|exists:users,email|maxLength:50",
        social:{
          email: "string",
          name: "string",
          facebookId: "string|maxLength:150",
          googleId: "string|maxLength:150",
          appleId: "string|maxLength:150",
        },
        recipe:{
          recipeId: "required|integer|exists:feeds,id",
          userId: "required|integer|exists:users,id",
          commentId: "required|integer|exists:comments,id"
        },
        kahani:{
          kahaniId: "required|integer|exists:feeds,id",
          userId: "required|integer|exists:users,id",
          commentId: "required|integer|exists:comments,id"
        },
        album:{
          file: "required"
        },
        admin:{
          email: "required|string",
          password: "required|string",
          albumId: "required|integer",
          userId: "required|integer",
          status: "required|integer",
          about_us: "required|string",
          privacy_policy: "required|string",
          term_and_conditions: "required|string",
          FAQs: "required|string"
        },
        family:{
          mobile: "required|string|unique:family_members,mobile|maxLength:50",
          id: "required|string|exists:family_members,id",

        },
        family_tree:{
          id: "required|exists:family_trees,id",

        },
        friend:{
          request: "required|exists:friend_requests,id"

        },
        twilio:{
          group_name: "required|unique:twilio_groups,group_name",
          group_id: "required|exists:twilio_groups,id",
          group_sid: "required|exists:twilio_groups,group_sid",

        },
        twilio_group_members:{
          id: "required|exists:twilio_group_members,id",
          member_sid: "required|exists:twilio_group_members,member_sid",
          member_id: "required|exists:twilio_group_members,member_id",

        },
        twilio_individual_members:{
          id: "required|exists:twilio_individual_members,id",

        },
        wish:{
          id: "exists:wishes,id",

        },
        feed:{
          id: "required|exists:feeds,id"
        },
        language:{
          id: "required|exists:languages,id",
          code: "required|exists:languages,code",

        },
        faq:{
          id: "required|exists:FAQs,id"

        }

    }
}
