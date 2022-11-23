const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const ResponseMiddleware = require('./ResponseMiddleware');
const serverConfig = require("../../config/server.json");
const UserService = require('../services/UserService');
const FamilyService = require('../services/FamilyService');
const FeedServices = require('../services/FeedServices');
const KahaniServices = require('../services/KahaniServices');
const TwilioService = require('../services/TwilioService');
const AdminService = require('../services/AdminService');
const helpers = require("../util/helpers");

module.exports = () => {
  const verifyToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyToken");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        let user = await UserService().fetch(payload.userId, false);

        if(user && !user.active){
          throw new Error("ac_deactivated");
        }

        //checking user must exist in our DB else throwing error
        if(user) {
          req.body.userId = user.id;
          req.authUser = user;
          let family_tree_data = await FamilyService().fetchUsersFamilyTree({userId:user.id}, false);
          let family_tree = await family_tree_data?family_tree_data.active_tree:null;
          req.body.family_tree = family_tree;
          let member_result = await FamilyService().fetchSpouse({registered_id:user.id,family_tree}, null);
          //console.log(member_result);
          req.authUser.member_id = member_result?member_result.id:null;


          console.log(`USER with ID ${user.id} entered.`);

          next()
        }else throw new Error("invalid_token");
      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;
      console.log(ex.message);
      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }


  const verifyEmailToken = async (req, res, next) => {
      console.log("AuthMiddleware => verifyEmailToken");
      console.log(req.query);
      let { key } = req.query;
      try{
        if(!key){
          throw new Error("invalid_token");
        }else{
          let payload = jwt.verify(key, serverConfig.jwtSecret);
          let user = await UserService().fetch(payload.userId, false);

          if(user && !user.active){
            throw new Error("ac_deactivated");
          }

          //checking user must exist in our DB else throwing error
          if(user) {
            req.body.userId = user.id;
            req.authUser = user;

            console.log(`USER with ID ${user.id} entered.`);

            next()
          }else throw new Error("invalid_token");
        }
      }catch(ex){
        req.msg = "invalid_token";
        if(ex.message == "ac_deactivated") req.msg = ex.message;
        console.log(ex.message);
        req.rCode = 0;
        ResponseMiddleware(req, res, next);
      }
    }


  const checkMobile = async (req, res, next) => {
    console.log("AuthMiddleware => checkMobile");
    try{
        let { mobile, countryCode } = req.query;

        let user = await UserService().fetchByMobile(countryCode,mobile, false);

        if(!user){
          req.query.profile_stage = null;
          next()
        }else {
          req.query.profile_stage = user.profile_stage;
          let profile_stage = user.profile_stage;
          let otp = helpers().generateOTP();
          req.rData={profile_stage,otp};

          if(user.profile_stage==0 ){
            let sms_result = await sendSMS(countryCode,mobile,otp);
            req.msg = "mobile_not_verified";
            ResponseMiddleware(req, res, next);
          } else if(user.profile_stage==1 ){
            token = await helpers().createJWT({ userId: user.id });
            otp = helpers().generateOTP();
            let sms_result = await sendSMS(countryCode,mobile,otp);
            req.rData={profile_stage,token,otp};
            req.msg = "profile_not_complete";
            ResponseMiddleware(req, res, next);
          } else{
            next()
          }

        }



    }catch(ex){
      console.log(ex);
    }
  }

  const sendSMS = async (countryCode,mobile,otp)=>{
    let user_mobile = countryCode+""+mobile;
    let exist = await UserService().getOTPAndToken({countryCode,mobile});
    if(exist){
      let update_result = await UserService().updateOTPAndToken({id:exist.id},{countryCode,mobile,otp});
    }else {
      let add_result = await UserService().addOTPAndToken({countryCode,mobile,otp});
    }
    let sms_result = await TwilioService().sendSMS(user_mobile,otp);
    console.log("sms_result")
    console.log(sms_result)
  }

  const checkLoginMobile = async (req, res, next) => {
    console.log("AuthMiddleware => checkLoginMobile");
    try{
        let { mobile, countryCode } = req.query;
        //countryCode = countryCode.replace("+", "").replace(/ /g,'');
        let user = await UserService().fetchByMobile(countryCode,mobile, false);

        if(!user){
          req.rCode=0;
          req.msg = "incorrect_mobile";
          ResponseMiddleware(req, res, next);
        }else {
          let profile_stage = user.profile_stage;
          req.rData={profile_stage};
          if(user.profile_stage==0 ){
            req.msg = "mobile_not_verified";
            ResponseMiddleware(req, res, next);
          } else if(user.profile_stage==1 ){
            token = await helpers().createJWT({ userId: user.id });
            req.rData={profile_stage,token};
            req.msg = "profile_not_complete";
            ResponseMiddleware(req, res, next);
          } else
            next()

        }



    }catch(ex){
      console.log(ex);
    }
  }


  const socialLoginValidator = async (req, res, next) => {
    console.log("AuthMiddleware => socialLoginValidator");
    try{
      let { facebookId,googleId,appleId,email,name} = req.body;
      let flag= false;
      if(facebookId)
        flag= true;
      if(googleId)
        flag= true;
      if(appleId)
        flag= true;

        if(!flag){
          req.rCode=0;
          req.msg = "social_id_missing";
          ResponseMiddleware(req, res, next);
        }else {
          next()
        }



    }catch(ex){
      console.log(ex);
    }
  }

  const validateUserForRecipe = async (req, res, next) => {
    console.log("AuthMiddleware => validateUserForRecipe");
    try{
      let { userId } = req.body;
      let { id } = req.params;

      let recipe = await FeedServices().fetchByQuery({userId,id});
        if(!recipe){
          req.rCode=0;
          req.msg = "unauthorized";
          ResponseMiddleware(req, res, next);
        }else {
          next()
        }



    }catch(ex){
      console.log(ex);
    }
  }

  const validateUserForKahani = async (req, res, next) => {
    console.log("AuthMiddleware => validateUserForKahani");
    try{
      let { userId } = req.body;
      let { id } = req.params;

      let kahani = await FeedServices().fetchByQuery({userId,id});
        if(!kahani){
          req.rCode=0;
          req.msg = "unauthorized";
          ResponseMiddleware(req, res, next);
        }else {
          next()
        }



    }catch(ex){
      console.log(ex);
    }
  }


  const checkEmailAndMobileToEditProfile = async (req, res, next) => {
    console.log("AuthMiddleware => checkEmailAndMobileToEditProfile");
    try{
        let { countryCode,mobile, email,userId } = req.body;
        console.log('userId');
        console.log(userId);
        let mobileExist = await UserService().fetchByMobileToEdit(countryCode,mobile,userId, false);

        if(mobileExist){
          req.rCode=0;
          req.msg = "mobile_exist";
          ResponseMiddleware(req, res, next);
        }else {
          if(email){
          let emailExist = await UserService().fetchByEmailToEdit(email,userId, false);
          if(emailExist){
            req.rCode=0;
            req.msg = "email_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }
        }else {
          next();
        }

        }

    }catch(ex){
      console.log(ex);
    }
  }


  const verifyAdminToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyAdminToken");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        console.log(payload);

        let admin = await AdminService().fetch(payload.adminId, false);
        console.log(admin);
        if(!admin){
          throw new Error("ac_deactivated");
        }

        //checking user must exist in our DB else throwing error
        if(admin) {
          console.log(`ADMIN with ID ${admin.id} entered.`);
          req.body.adminId = admin.id;
          req.authUser = admin;
          next()
        }else throw new Error("invalid_token");
      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }


  const verifyTokenForAll = async (req, res, next) => {
    console.log("AuthMiddleware => verifyTokenForAll");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);

        let user =null;
        if(payload.adminId)
           user = await AdminService().fetch(payload.adminId, false);
        if(payload.userId)
           user = await UserService().fetch(payload.userId, false);
        console.log(user);
        if(!user){
          throw new Error("ac_deactivated");
        }

        //checking user must exist in our DB else throwing error
        if(user) {
          if(payload.userId) req.body.userId = user.id;
          if(payload.adminId) req.body.adminId = user.id;
          req.authUser = user;
          let family_tree_data = await FamilyService().fetchUsersFamilyTree({userId:user.id}, false);
          let family_tree = await family_tree_data?family_tree_data.active_tree:null;
          req.body.family_tree = family_tree;
          let member_result = await FamilyService().fetchSpouse({registered_id:user.id,family_tree}, null);
          console.log(member_result);
          req.authUser.member_id = member_result?member_result.id:null;
          console.log(`USER with ID ${user.id} entered.`);

          next()
        }else throw new Error("invalid_token");
      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  const validateFamilyMember = async (req, res, next, transaction) => {
    console.log("AuthMiddleware => validateFamilyMember");
    //let token = await verifyToken(req, res, next);
    try{
        let { countryCode,mobile,spouse_countryCode,spouse_mobile,isMarried, memberId,spouse_id,userId,family_tree } = req.body;
        let member_query = {countryCode,mobile}
        let registered_member = await UserService().fetchByMobile(countryCode,mobile, transaction);
        let registered_id = registered_member?registered_member.id:null;
        console.log("registered_id");
        console.log(registered_id);
        console.log(userId);
        console.log(req.authUser.member_id);
        if(registered_id==userId) {
          memberId = req.authUser.member_id
          req.body.memberId = memberId;
        }
        if(memberId) member_query = {countryCode,mobile,id:{[Op.not]: memberId}};
        let memberExist = await FamilyService().fetchMemberByQuery(member_query, transaction);
        let spouseExist = [];
        if(isMarried==1 && spouse_mobile && spouse_countryCode){
          let spouse_registered_member = await UserService().fetchByMobile(spouse_countryCode,spouse_mobile, transaction);
          let spouse_registered_id = spouse_registered_member?spouse_registered_member.id:null;
          let spouse_query = {countryCode:spouse_countryCode,mobile:spouse_mobile}
          if(spouse_registered_id==userId){
            spouse_id = req.authUser.member_id;
            req.body.spouse_id = spouse_id;
          }
          if(spouse_id) spouse_query = await  {countryCode:spouse_countryCode,mobile:spouse_mobile,id:{[Op.not]: spouse_id}}
          spouseExist = await FamilyService().fetchMemberByQuery(spouse_query, transaction);
        }
        console.log("memberExist.length");
        console.log(memberExist.length);
        console.log(spouseExist.length);

        if(memberExist.length>=2 || spouseExist.length>=2){
          if(memberExist.length>=2){
            let family_tree_data = await getFamilyTreeToDeleteMember(memberExist,transaction);
            if(family_tree_data!='' && family_tree_data){
              let delete_tree_id = family_tree_data.family_tree;
              let delete_user_id = family_tree_data.userId;
              delete_tree_result = await deleteDefaultFamilyTree(family_tree,delete_tree_id,delete_user_id,"member_mobile_exist", next, transaction);
            }else {
              req.rCode=0;
              req.msg = "member_mobile_exist";
              ResponseMiddleware(req, res, next);
            }
          }
          if(spouseExist.length>=2){
            let spouse_family_tree_data = await getFamilyTreeToDeleteMember(spouseExist,transaction);
            if(spouse_family_tree_data!=null && spouse_family_tree_data){
              console.log("spouse_family_tree_data");
              console.log(spouse_family_tree_data);
              let spouse_delete_tree_id = spouse_family_tree_data.family_tree;
              let spouse_delete_user_id = spouse_family_tree_data.userId;
              spouse_delete_tree_result = await deleteDefaultFamilyTree(family_tree,spouse_delete_tree_id,spouse_delete_user_id,"spouse_mobile_exist", next, transaction);
            }
            else {
              req.rCode=0;
              req.msg = "spouse_mobile_exist";
              ResponseMiddleware(req, res, next);
            }
          }
          next();

        }else {
            next();

        }

    }catch(ex){
      console.log(ex);
    }
  }

  const deleteDefaultFamilyTree = async (new_family_tree,family_tree,userId,msg, next, transaction)=>{
    console.log('AuthMiddleware=>deleteDefaultFamilyTree');
    let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
  //  let family_tree_1_member = await FamilyService().fetchMemberByQuery({family_tree:user_family_tree.family_tree_1}, transaction);
    //let family_tree_2_member = await FamilyService().fetchMemberByQuery({family_tree:user_family_tree.family_tree_2}, transaction);
    //let is_deleted = false;
    if(user_family_tree.family_tree_1==family_tree){
      let update_data = {family_tree_1:new_family_tree,active_tree:user_family_tree.family_tree_2}
      let update_result = await FamilyService().updateUsersFamilyTree({id:user_family_tree.id},update_data, transaction);
      let remove_result = await FamilyService().removeFamilyTree({id:user_family_tree.family_tree_1}, transaction);
      let remove_member = await FamilyService().removeMember({family_tree:user_family_tree.family_tree_1,registered_id:userId}, transaction);
    }else if (user_family_tree.family_tree_2==family_tree) {
      let update_data = {family_tree_2:new_family_tree,active_tree:user_family_tree.family_tree_1}
      let update_result = await FamilyService().updateUsersFamilyTree({id:user_family_tree.id},update_data, transaction);
      let remove_result = await FamilyService().removeFamilyTree({id:user_family_tree.family_tree_2}, transaction);
      let remove_member = await FamilyService().removeMember({family_tree:user_family_tree.family_tree_2,registered_id:userId}, transaction);
    }else {
      req.rCode=0;
      req.msg = msg;
      ResponseMiddleware(req, res, next);
    }
  }

  const getFamilyTreeToDeleteMember = async (data,transaction)=>{
    let family_tree_data = null;
    return new Promise(async function(resolve, reject){
      for (var i = 0; i < data.length; i++) {
        let {registered_id,userId,family_tree} = data[i];
        let member_query = {family_tree}
        if(registered_id==userId) {
          let family_member = await FamilyService().fetchMemberByQuery(member_query, transaction);
          if(family_member.length==1) {
            family_tree_data = {family_tree:family_member[0].family_tree,userId};
            resolve(family_tree_data);
          }
        }

        if(i==data.length-1) resolve(family_tree_data);
      }
    })
  }

  const setLanguage = async (req, res, next) => {
    console.log("AuthMiddleware => setLanguage");
    let language = req.query.language?req.query.language:req.body.language;
    if(!req.authUser){
      req.authUser={};
      req.authUser.language=language;
    }else {
      req.authUser.language=language;

    }
    next();
  }

  const checkFamilyMember = async (req, res, next) => {
    console.log("AuthMiddleware => checkFamilyMember");
    try{
        let { countryCode,mobile,isMarried,spouse_name,spouse_countryCode,spouse_mobile, memberId,spouse_id,userId,family_tree } = req.body;
        console.log('userId');
        console.log(userId);
        let member_query = {family_tree,countryCode,mobile}
        if(memberId) member_query.id = {[Op.not]: memberId}
        let exist_member = await FamilyService().fetchSpouse(member_query);
        let exist_spouse = null;
        if(isMarried==1 && spouse_name!='') {
          let spouse_query = {family_tree,countryCode:spouse_countryCode,mobile:spouse_mobile}
          if(spouse_id) spouse_query.id = {[Op.not]: spouse_id}
          exist_spouse = await FamilyService().fetchSpouse(spouse_query);
        }
        console.log("exist_spouse");
        console.log(exist_member);
        console.log(exist_spouse);
        if(exist_member){
          req.rCode=0;
          req.msg = "main_member_already_added";
          ResponseMiddleware(req, res, next);
        }else {
          console.log("exist_spouse");
          console.log(exist_spouse);
          if(exist_spouse){
            req.rCode=0;
            req.msg = "spouse_member_already_added";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }


        }

    }catch(ex){
      console.log(ex);
    }
  }

  return {
    verifyToken,
    verifyEmailToken,
    checkMobile,
    checkLoginMobile,
    socialLoginValidator,
    validateUserForRecipe,
    validateUserForKahani,
    checkEmailAndMobileToEditProfile,
    verifyAdminToken,
    verifyTokenForAll,
    validateFamilyMember,
    setLanguage,
    checkFamilyMember
  }
}
