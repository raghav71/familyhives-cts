const { Op } = require("sequelize");
const UserService = require("../services/UserService");
const FamilyService = require("../services/FamilyService");
const TwilioService = require("../services/TwilioService");
const AdminController = require("../controllers/AdminController");
const UserController = require("../controllers/UserController");
const FamilyController = require("../controllers/FamilyController");
const OtpController = require("../controllers/OtpController");
const helpers = require("../util/helpers");
const colors = require("colors");
const config = require('../../config/twilio_config.js');

module.exports = () => {
    const signup = async (req, res, next, transaction) => {

        let { mobile, countryCode,profile_stage,device_type,language } = req.query;
        req.authUser={};
        req.authUser.language=language;
        if(!profile_stage){
          let user = { mobile , countryCode,device_type,language};

          let user_mobile = countryCode+""+mobile;
          user.profile_stage='0';
          user = await UserService().add(user, transaction);
          let userId = user.id;
          let otp = helpers().generateOTP();
          let sms_result = await sendSMS(countryCode,mobile,otp, transaction);
          req.rData = { otp }
          req.msg = 'otp_sent';
          next();
        }else {
          req.rCode = 0;
          req.rData = { profile_stage }
          req.msg = 'mobile_exist';
          next();
        }

      }

    const completeProfile = async (req, res, next, transaction) => {
        console.log("AuthController => register");
        if(req.body.aniversary=='')
         req.body.aniversary=null;
        let { name, email,  password, aniversary,  dob, gender,device_type,device_token,notification_permission,userId } = req.body;
        let user = { name, email, password, aniversary,  dob, gender ,device_type,device_token,notification_permission};
        if(email){
          let subject = "Verify your email";
          let token = await helpers().createJWT({ userId });
          let html = name+", Please confirm your email address by clicking this link : http://50.18.227.95:4044/api/user/activateEmail?key="+token;
          //let email_result = await helpers().sendEmail(email,subject,html);
          //console.log("email_result");
          //console.log(email_result);

        }
        if(password) user.password = await helpers().hashPassword(password);
        user.profile_stage='2';
        console.log(user);

        user = await UserService().updateProfile(userId,user, transaction);

        user = await UserService().fetch(userId, transaction);

        let fetch_users_tree_result = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
        let member_data = await FamilyService().fetchMemberByQuery({countryCode:req.authUser.countryCode ,mobile:req.authUser.mobile}, transaction);
        let family_tree_1 = null;
        let family_tree_2 = null;

        if(member_data.length>0){
          let tree_result = await FamilyService().fetchFamilyTree({id:member_data[0].family_tree}, transaction);
          if(member_data.length==1){
            let family_tree_result = await FamilyService().addFamilyTree({userId,name:"Family Tree 2"}, transaction);
            family_tree_1 = tree_result.id;
            family_tree_2 = family_tree_result.id;

            let member = { userId,family_tree:family_tree_2,registered_id:userId, name:user.name,countryCode:user.countryCode ,mobile:user.mobile ,image:user.image,added_by:"default"};
            let member_result = await FamilyService().addFamilyMember(member, transaction);
            let chat_result = await FamilyController().addMemberInDefaultChatGroup(member_data[0].userId,userId,family_tree_1,config.TWILIO_USER_ROLE_SID,transaction);

          }else {
            family_tree_1 = member_data[0].family_tree;
            family_tree_2 = member_data[1].family_tree;
            let chat_result = await FamilyController().addMemberInDefaultChatGroup(member_data[0].userId,userId,family_tree_1,config.TWILIO_USER_ROLE_SID,transaction);
            let chat_result2 = await FamilyController().addMemberInDefaultChatGroup(member_data[1].userId,userId,family_tree_2,config.TWILIO_USER_ROLE_SID,transaction);


          }
          let tree = {family_tree_1,family_tree_2,active_tree:family_tree_1,userId}

          if(fetch_users_tree_result) update_result = await FamilyService().updateUsersFamilyTree({id:fetch_users_tree_result.id},tree, transaction);
          else user_family_tree_result = await FamilyService().addUsersFamilyTree(tree, transaction);
        }else {
          let family_tree_result1 = await FamilyService().addFamilyTree({userId,name:"Family Tree 1"}, transaction);
          let family_tree_result2 = await FamilyService().addFamilyTree({userId,name:"Family Tree 2"}, transaction);
          family_tree_1 = family_tree_result1.id;
          family_tree_2 = family_tree_result2.id;
          let member = { userId,family_tree:family_tree_1,registered_id:userId, name:user.name,countryCode:user.countryCode ,mobile:user.mobile ,image:user.image,added_by:"default"};
          let member_result = await FamilyService().addFamilyMember(member, transaction);
          let member2 = { userId,family_tree:family_tree_2,registered_id:userId, name:user.name,countryCode:user.countryCode ,mobile:user.mobile ,image:user.image,added_by:"default"};
          let member_result2 = await FamilyService().addFamilyMember(member2, transaction);
          let chat_result = await FamilyController().addMemberInDefaultChatGroup(userId,userId,family_tree_1,config.TWILIO_ADMIN_ROLE_SID,transaction);
          let chat_result2 = await FamilyController().addMemberInDefaultChatGroup(userId,userId,family_tree_2,config.TWILIO_ADMIN_ROLE_SID,transaction);

          let tree = {userId,family_tree_1,family_tree_2,active_tree:family_tree_1}
          let user_family_tree_result = await FamilyService().addUsersFamilyTree(tree, transaction);

        }
       let members_id = member_data.length>0?member_data.map(a=>a.id):[];
       if(members_id.length>0){
         let update_result = await FamilyService().updateFamilyMemberProfile({id:{[Op.in]:members_id}},{registered_id:userId}, transaction);
       }
        token = await helpers().createJWT({ userId });
        let profile_stage=user.profile_stage;
        req.rData = { user,profile_stage, token };
        req.msg = 'complete_profile';
        next();


    }

    const forgotpassword = async (req, res, next, transaction) => {

        let otp = helpers().generateOTP();
        let {profile_stage} = req.rData;
        let {countryCode,mobile} = req.query;
        //let otp_reult = OtpController().sendOtp(otp,mobile,transaction);
        let sms_result = await sendSMS(countryCode,mobile,otp, transaction);
        req.rData = { profile_stage,otp }
        req.msg = 'otp_sent';
        next();


      }

    const resetPassword = async (req, res, next, transaction) => {
      console.log("AuthController => resetPassword");
      let { password,language } = req.body;
      let user = { password };
      req.authUser.language=language;
      user.password = await helpers().hashPassword(password);

      user = await UserService().updateProfile(req.body.userId,user, transaction);

      req.msg = 'password_changed';
      next();


  }

    const socialLogin = async (req, res, next, transaction) => {
      console.log("AuthController => socialLogin");
      let { facebookId,googleId,appleId,email,name,device_type} = req.body;
      let query = {};
      let exists =null;
      if(facebookId && exists ==null ){
        query = {facebookId};
        exists = await UserService().fetchByQuery(query);
      }

      if(googleId && exists ==null){
        query = {googleId};
        exists = await UserService().fetchByQuery(query);
      }
      if(appleId && exists ==null){
        query = {appleId};
        exists = await UserService().fetchByQuery(query);
      }
      if(email && exists ==null){
        query = {email};
        exists = await UserService().fetchByQuery(query);
      }

      console.log(exists);
      if(exists){
        let data = {facebookId,googleId,appleId};
        if(!exists.name && name) data.name = name;
        if(!exists.email && email) data.email = email;
        if(!exists.device_type && device_type)
          data.device_type = device_type;
        let user = await UserService().updateProfile(exists.id,data, transaction);
        user = await UserService().fetch(exists.id, transaction);
        let token = await helpers().createJWT({ userId: exists.id });
        let profile_stage=user.profile_stage;
        req.rData = { user,profile_stage, token }
        req.rCode=1;
        req.msg = "profile_changed"
      }else {
        let user = { facebookId,googleId,appleId,email,name,device_type,profile_stage:'1' };
        //user.profile_stage='1';
        let add_result = await UserService().add(user, transaction);
        let token = await helpers().createJWT({ userId: add_result.id });
        user = await UserService().fetch(add_result.id, transaction);
        let profile_stage=user.profile_stage;
        req.msg = "signup"
        req.rData = { user,profile_stage, token };
      }

      next();
  }

    const login = async (req, res, next, transaction) => {
      console.log("AuthController => login");
      let { mobile, countryCode , password } = req.query;
      //countryCode = countryCode.replace("+", "").replace(/ /g,'');

      let query = { mobile, countryCode };
      let token = "";
      let user = await UserService().fetchByQueryForLogin(query, transaction);
      console.log("user");
      console.log(user);
      if(user && user.password!='' && user.password!=null){
        let passwordVerify = await UserService().verifyPassword(user.id, password, transaction);

      if(!passwordVerify) {
        req.rCode = 0;
        req.msg = "incorrect_password";
        req.rData = { token };
      } else {

          user = await UserService().fetch(user.id, transaction);
          token = await helpers().createJWT({ userId: user.id });
          let profile_stage=user.profile_stage;
          req.rData = { user,profile_stage, token };
      }
    }else {
      req.rCode = 0;
      if(user.profile_stage!="2") req.msg = "profile_not_complete";
      else req.msg = "password_empty";
      req.rData = { token };
    }

      next();
  }

  const logout = async (req, res, next, transaction) => {
    let { userId} = req.body;

    let user = { device_token:null } ;
    let update_result = await UserService().updateProfile(userId,user, transaction);
    let update_result2 = await UserService().updateOTPAndToken({countryCode:req.authUser.countryCode,mobile:req.authUser.mobile},{token:null}, transaction);
    req.msg = 'user_logout';
    next();

  }

  const changePassword = async (req, res, next, transaction) => {
    console.log('req.body');
    console.log(req.body);
    if(req.body.userId) UserController().changePassword(req, res, next);

    if(req.body.adminId) AdminController().changePassword(req, res, next);

  }


  const sendSMS = async (countryCode,mobile,otp, transaction)=>{
    let user_mobile = countryCode+""+mobile;
    let exist = await UserService().getOTPAndToken({countryCode,mobile}, transaction);
    if(exist){
      let update_result = await UserService().updateOTPAndToken({id:exist.id},{countryCode,mobile,otp}, transaction);
    }else {
      let add_result = await UserService().addOTPAndToken({countryCode,mobile,otp}, transaction);
    }
    let sms_result = await TwilioService().sendSMS(user_mobile,otp, transaction);
    
    console.log("sms_result")
    console.log(sms_result)
  }


return {
        signup,
        completeProfile,
        forgotpassword,
        changePassword,
        resetPassword,
        socialLogin,
        login,
        logout
    }
}
