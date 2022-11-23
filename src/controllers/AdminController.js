const AdminService = require("../services/AdminService");
const SettingService = require("../services/SettingService");
const UserService = require("../services/UserService");
const AlbumService = require("../services/AlbumService");
const helpers = require("../util/helpers");

module.exports = () => {
  const login = async (req, res, next, transaction) => {
    console.log("AdminController => login");
    let { email , password } = req.query;

    let token = "";
    let admin = await AdminService().fetchByEmail(email, transaction);
    if(admin){
      let passwordVerify = await AdminService().verifyPassword(admin.id, password, transaction);

    if(!passwordVerify) {
      req.rCode = 0;
      req.msg = "incorrect_password";
      req.rData = { token };
    } else {
      let adminId = admin.id;
      let name = admin.name;
      email = admin.email;
      token = await helpers().createJWT({ adminId: admin.id,isAdmin:true });
      req.rData = { adminId,name,email,token };
    }
  }else {
    req.rCode = 0;
    req.msg = "wrong_email";
    req.rData = { token };
  }

    next();
}

  const forgotpassword = async (req, res, next, transaction) => {
    let { email } = req.query;

    let token = "";
    let admin = await AdminService().fetchByEmail(email, transaction);
    if(admin){
      let otp = helpers().generateOTP();
      req.rData = { otp }
      req.msg = 'otp_sent_email';
    }else {
      req.rCode = 0;
      req.msg = "wrong_email";
      req.rData = { token };
    }
    next();
  }

  const resetPassword = async (req, res, next, transaction) => {
    console.log("AdminController => resetPassword");
    let { password,adminId } = req.body;
    let admin = { password };

    admin.password = await helpers().hashPassword(password);

    admin = await AdminService().updatePassword(adminId,admin, transaction);

    req.msg = 'password_changed';
    next();


  }

  const changePassword = async (req, res, next, transaction) => {
    console.log("AdminController => changePassword");
    let { current_password,new_password,adminId } = req.body;


    let passwordVerify = await AdminService().verifyPassword(adminId, current_password, transaction);

    if(!passwordVerify) {
      req.rCode = 0;
      req.msg = "incorrect_current_password";

    } else {
      let admin = {};
      new_password = await helpers().hashPassword(new_password);
      admin.password = new_password;
      admin = await AdminService().updatePassword(adminId,admin, transaction);
      req.msg = 'password_changed';
    }
    next();
  }

  const verifyOtp = async (req, res, next, transaction) => {
    console.log("AdminController => verifyOtp");
    let { email,code } = req.query;

    var verify = code=='123456'?true:false;

    let token = "";
    if(verify){
      let admin = await AdminService().fetchByEmail(email, transaction);
      if(admin){
        token = await helpers().createJWT({ adminId: admin.id,isAdmin:true });
        req.rData = { token };
        req.msg = 'otp_verified';
      }else {
        req.rCode = 0;
        req.msg = "wrong_email";
        req.rData = { token };
      }
    }else {
      req.rCode = 0;
      req.msg = "incorrect_otp";
    }
    next();
  }

  const changeUserStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeUserStatus");
    let { userId,status,adminId } = req.body;
    status = {active:status};
    console.log(status);
    result = await AdminService().changeUserStatus(userId,status, transaction);

    req.msg = 'status_changed';
    next();
  }

  const deleteUser = async (req, res, next, transaction) => {
    console.log("AdminController => deleteUser");
    let { userId,adminId } = req.query;

    result = await AdminService().deleteUser(userId, transaction);

    req.msg = 'user_deleted';
    next();
  }

  const changeAboutUs = async (req, res, next, transaction) => {
    console.log("AdminController => changeAboutUs");

    let { about,image,adminId,language,status } = req.body;

    let exist = await SettingService().getAbout({language},transaction);
    if(exist){
      let result = await SettingService().updateAbout({id:exist.id},{about,image,language,status}, transaction);
    }else {
      let result = await SettingService().addAboutUs({about,image,language,status}, transaction);
    }

    let data = await SettingService().getAbout({language},transaction);

    req.rData = {data};
    req.msg = 'about_changed';
    next();
  }

  const changePrivacyPolicy = async (req, res, next, transaction) => {
    console.log("AdminController => changePrivacyPolicy");
    let { privacy_policy,image,language,status,adminId } = req.body;
    let setting = {privacyAndPolicy:privacy_policy,image,language,status};
    let exist = await SettingService().getPrivacyAndPolicies({language},transaction);
    if(exist){
      let result = await SettingService().updatePrivacyAndPolicy({id:exist.id},setting, transaction);
    }else {
      let result = await SettingService().addPrivacyAndPolicy(setting, transaction);
    }
    let data = await SettingService().getPrivacyAndPolicies({language},transaction);

    req.rData = {data};
    req.msg = 'privacy_policy_changed';
    next();
  }

  const changeTermAndCondition = async (req, res, next, transaction) => {
    console.log("AdminController => changeTermAndCondition");
    let { term_and_condition,image,adminId,language,status } = req.body;
    let setting = {termAndCondition:term_and_condition,image,language,status};
    let exist = await SettingService().getTermAndCondition({language},transaction);
    if(exist){
      let result = await SettingService().updateTermAndCondition({id:exist.id},setting, transaction);
    }else {
      let result = await SettingService().addTermAndCondition(setting, transaction);
    }
    let data = await SettingService().getTermAndCondition({language},transaction);
    req.rData = {data};
    req.msg = 'term_and_conditions_changed';
    next();
  }

  const addFAQs = async (req, res, next, transaction) => {
    console.log("AdminController => addFAQs");
    let { question,answer,language,image,question_id,adminId } = req.body;
    try {
      if(question) question = JSON.parse(question.replace(/\\/g,""))
      if(answer) answer = JSON.parse(answer.replace(/\\/g,""))
      if(question_id) question_id = JSON.parse(question_id.replace(/\\/g,""))
    } catch (e) {

    }
    for (var i = 0; i < question.length; i++) {
      let data = {question:question[i],answer:answer[i],language};
      if(question_id[i]){
        let update_result = await SettingService().updateFAQs({id:question_id[i]},data, transaction);
      }else {
        let question_result = await SettingService().addFAQs(data, transaction);
      }
    }
    if(image){
      let FAQ_image = {FAQs_image:image}
      let question_result = await SettingService().updateSetting(FAQ_image, transaction);
    }
    req.msg = 'FAQs_added';
    next();
  }

  const deleteFAQs = async (req, res, next, transaction) => {
    console.log("AdminController => deleteFAQs");
    let { faq_id } = req.body;
    let result = await SettingService().deleteFAQs({id:faq_id}, transaction);
    console.log("result");
    console.log(result);
    req.msg = 'FAQs_deleted';
    next();
  }

  const deleteAllFAQs = async (req, res, next, transaction) => {
    console.log("AdminController => deleteAllFAQs");
    let { language } = req.body;

    let result = await SettingService().deleteFAQs({language}, transaction);

    req.msg = 'FAQs_deleted';
    next();
  }

  const updateFAQStatus = async (req, res, next, transaction) => {
    console.log("AdminController => updateFAQStatus");
    let { faq_id,status,language } = req.body;
    let query ={};
    if(faq_id) query.id= faq_id;
    if(language) query.language= language;
    if(faq_id || language){
      let update_result = await SettingService().updateFAQs(query,{status}, transaction);
      req.msg = 'FAQs_status_changed';
    }else {
      req.msg = 'enter_either_id_or_language';

    }
    next();
  }

  const getAllContentList = async (req, res, next, transaction) => {
      console.log("AdminController => getAllContentList");
      let {language} = req.query
      let about = await SettingService().getAbout({language},transaction);
      let privacyAndPolicy = await SettingService().getPrivacyAndPolicies({language},transaction);
      let termAndCondition = await SettingService().getTermAndCondition({language},transaction);
      let FAQ = await SettingService().getAllFAQs({language},transaction);
      let active_FAQ = await SettingService().getAllFAQs({language,status:1},transaction);
      let faq_status = active_FAQ.count>0?true:false;
      let setting = await SettingService().getSetting(transaction);
      let FAQs_image= setting.FAQs_image;
      let total_question= FAQ.count;
      let question = FAQ.rows;
      req.rData = {about,privacyAndPolicy,termAndCondition,FAQ:question,FAQs_image,faq_status};
      req.msg = 'content_list';
      next();
    }

  const getUserDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getUserDetails");
    let { userId,adminId } = req.query;
    let user = await UserService().getUserDetails(userId, transaction);

    req.rData = {user};
    req.msg = 'user_details';
    next();
  }

  const getAlbumDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getAlbumDetails");
    let { albumId,adminId } = req.query;
    let album = await AlbumService().getAlbum(albumId, transaction);
    let tagged_user = await AlbumService().getTagedUser(albumId, transaction);

    req.rData = {album,tagged_user};
    req.msg = 'album_details';
    next();
  }

  const getAllLanguages = async (req, res, next, transaction) => {
      console.log("AdminController => getAllLanguages");

      let query = {};
      let languages = await SettingService().getAllLanguages(query,transaction);

      req.rData = {languages};
      req.msg = 'language_list';
      next();
    }



    return {
      login,
      forgotpassword,
      resetPassword,
      changePassword,
      verifyOtp,
      changeUserStatus,
      deleteUser,
      changeAboutUs,
      changePrivacyPolicy,
      changeTermAndCondition,
      addFAQs,
      deleteFAQs,
      deleteAllFAQs,
      updateFAQStatus,
      getUserDetails,
      getAlbumDetails,
      getAllContentList,
      getAllLanguages
    }
}
