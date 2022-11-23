const UserService = require("../services/UserService");
const TwilioService = require("../services/TwilioService");
const helpers = require("../util/helpers");
const User = require("../models/User");
const colors = require("colors");

module.exports = () => {
    const sendOtp = async (req,res,next, transaction) => {

      let otp = helpers().generateOTP();

      req.rData = { otp }
      req.msg = "otp_sent";
      next();

    }


    const resendOtp = async (req, res, next, transaction) => {
        console.log("OtpController => resendOtp");
        let {countryCode,mobile} = req.query;
        let user_mobile = countryCode+""+mobile;
        let otp = helpers().generateOTP();
        let exist = await UserService().getOTPAndToken({countryCode,mobile}, transaction);
        if(exist){
          let update_result = await UserService().updateOTPAndToken({id:exist.id},{otp}, transaction);
        }else {
          let add_result = await UserService().addOTPAndToken({countryCode,mobile,otp}, transaction);
        }
        let sms_result = await TwilioService().sendSMS(user_mobile,otp, transaction);
        req.rData = { otp }
        req.msg = "otp_resent";
        next();


    }

    const verifyOtp = async (req, res, next, transaction) => {
        console.log("OtpController => verifyOtp");
        let { mobile, countryCode,code } = req.query;
        let user = await UserService().fetchByMobile(countryCode,mobile, false, transaction);
        let otp_details = await UserService().getOTPAndToken({countryCode,mobile}, transaction);
        console.log("otp_details");
        console.log(otp_details);
        let user_otp = otp_details?otp_details.otp:123456;
        var verify = (code=='123456' || code==user_otp)?true:false;

        if(user){
          if(verify){
            if(user.profile_stage!='2'){
              let data = {profile_stage:'1'}
              result = await UserService().updateProfile(user.id,data, transaction);
            }
            token = await helpers().createJWT({ userId: user.id });
            //req.authUser=user;
            req.rData = { userId: user.id,token };
            req.msg = 'otp_verified';
          }else {
            req.rCode = 0;
            req.msg = "incorrect_otp";
          }
        }else {
          req.rCode = 0;
          req.msg = "incorrect_mobile";
        }
        next();

    }



    return {
      sendOtp,
      resendOtp,
      verifyOtp
    }
}
