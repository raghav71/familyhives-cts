const { Op } = require("sequelize");
const SettingService = require("../services/SettingService");
const RecipeService = require("../services/RecipeServices");
const UserService = require("../services/UserService");
const FamilyService = require("../services/FamilyService");
const AlbumService = require("../services/AlbumService");
const KahaniService = require("../services/KahaniServices");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const WishService = require("../services/WishService");
const helpers = require("../util/helpers");
const FamilyController = require("../controllers/FamilyController");
const RecipeController = require("../controllers/RecipeController");
const AlbumController = require("../controllers/AlbumController");
const KahaniController = require("../controllers/KahaniController");
const config = require('../../config/twilio_config.js');

module.exports = () => {
    const fetchPrivacyAndPolicy = async (req, res, next, transaction) => {
        let {language} = req.query
        let setting = await SettingService().getPrivacyAndPolicies({language,status:'1'},transaction);
        let {privacyAndPolicy,image} = setting?setting:{};
        req.rData = {privacyAndPolicy,image};
        next();

    }

    const fetchTermAndConditions = async (req, res, next, transaction) => {
        let {language} = req.query
        let setting = await SettingService().getTermAndCondition({language,status:'1'},transaction);
        let {termAndCondition,image} = setting?setting:{};
        req.rData = {termAndConditions:termAndCondition,image};
        next();
    }

    const getAboutApp = async (req, res, next, transaction) => {

      let {language} = req.query
      let setting = await SettingService().getAbout({language,status:'1'},transaction);
      let {about,image} = setting?setting:{};
      req.rData = {about,image};
      next();
    }


    const getHelplineDetails = async (req, res, next, transaction) => {

      let setting = await SettingService().getSetting(transaction);
      let {helpline_mobile,helpline_email} = setting;
      let email = helpline_email;
      let mobile = helpline_mobile;
      req.rData = {email,mobile};
      next();
    }

    const getFAQs = async (req, res, next, transaction) => {
      let filter = {search,page,limit,language} = req.query;
      let FAQ = await SettingService().getAllFAQs(filter,transaction);
      let setting = await SettingService().getSetting(transaction);
      let FAQ_image = setting.FAQs_image
      let total_question= FAQ.count;
      let question = FAQ.rows
      req.msg="FAQs_list";
      req.rData = {FAQ_image,total_question,question};
      next();
    }

    const changePassword = async (req, res, next, transaction) => {
      console.log("UserController => changePassword");
      let { current_password,new_password,userId } = req.body;


      let passwordVerify = await UserService().verifyPassword(userId, current_password, transaction);

      if(!passwordVerify) {
        req.rCode = 0;
        req.msg = "incorrect_current_password";

      } else {
        let user = {};
        new_password = await helpers().hashPassword(new_password);
        user.password = new_password;
        user = await UserService().updateProfile(userId,user, transaction);
        req.msg = 'password_changed';
      }
      next();

    }

    const updateProfile = async (req, res, next, transaction) => {
        console.log("UserController => updateProfile");
        console.log(req.body);
        let { name,countryCode,mobile, email, aniversary,  dob, gender,image,family_tree } = req.body;
        let user = { name,countryCode,mobile, email, aniversary,  dob, gender,image,profile_stage:'2' };
        user = await UserService().updateProfile(req.body.userId,user, transaction);

        user = await UserService().fetch(req.body.userId, transaction);
        if(!family_tree && family_tree==null){
          let tree_result = await addFamilyTree(user,transaction)
        }
        req.rData = { user };

        req.msg = 'profile_changed';
        next();


    }

    const changePrivacyAndPermission = async (req, res, next, transaction) => {
        console.log("UserController => changePrivacyAndPermission");

        let { userId,feeds,dadi_ki_rasoi, family_memories, friend_request,  mobile_number, email } = req.body;

        let exists = await UserService().getPrivacyAndPermission(userId,false, transaction);
        if(!exists){
          let privacyAndPermission = { userId,feeds,dadi_ki_rasoi, family_memories, friend_request,  mobile_number, email };
          let add_result = await UserService().addPrivacyAndPermission(privacyAndPermission,false, transaction);

        }else {
          let privacyAndPermission = { feeds,dadi_ki_rasoi, family_memories, friend_request,  mobile_number, email };
          let update_result = await UserService().updatePrivacyAndPermission(exists.id,privacyAndPermission,false, transaction);

        }


        let privacyAndPermission = await UserService().getPrivacyAndPermission(userId,false, transaction);
        privacyAndPermission = await getPrivacyAndPermissionWithDetails(req.authUser.language,privacyAndPermission);

        req.rData = {privacyAndPermission};


        req.msg = 'privacy_changed';
        next();


    }

    const getPrivacyAndPermission = async (req, res, next, transaction) => {
        console.log("UserController => getPrivacyAndPermission");

        let { userId } = req.body;

        let privacyAndPermission = await UserService().getPrivacyAndPermission(userId,false, transaction);
        privacyAndPermission = await getPrivacyAndPermissionWithDetails(req.authUser.language,privacyAndPermission);
        req.rData = { privacyAndPermission };

        req.msg = 'privacy_and_permission';
        next();


    }

    const getPrivacyAndPermissionWithDetails = (lang,data) => {
      let privacyAndPermission = [];
      let privacy = [{"0":"feeds"},{"0":"dadi_ki_rasoi"},{"0":"family_memories"},{"0":"friend_request"},{"0":"mobile_number"},{"0":"email"}];
      let privacy_title = [
        {
          "0":{
            "en":"Who can see your feeds",
            "hi":"आपका फ़ीड कौन देख सकता है",
            "sa":"Who can see your feeds",
            "ta":"உங்கள் ஊட்டங்களை யார் பார்க்க முடியும்",
            "gu":"તમારી ફીડ્સ કોણ જોઈ શકે છે",
          }
        },
        {
          "0":{
            "en":'Who can see your "Dadi ki rasoi" contents',
            "hi":'आपकी "दादी की रसोई" सामग्री को कौन देख सकता है',
            "sa":'Who can see your "Dadi ki rasoi" contents',
            "ta":'உங்கள் "தாடி கி ரசோய்" உள்ளடக்கங்களை யார் பார்க்க முடியும்',
            "gu":'તમારી "દાદી કી રાસોઈ" વિષયવસ્તુ કોણ જોઈ શકે છે',
          }
        },
        {
          "0":{
            "en":"Who can see your Family memories",
            "hi":"आपकी पारिवारिक यादें कौन देख सकता है",
            "sa":"Who can see your Family memories",
            "ta":"உங்கள் குடும்ப நினைவுகளை யார் பார்க்க முடியும்",
            "gu":"તમારી કૌટુંબિક યાદો કોણ જોઈ શકે છે",
          }
        },
        {
          "0":{
            "en":"Who can see your friend request",
            "hi":"कौन देख सकता है आपकी फ्रेंड रिक्वेस्ट",
            "sa":"Who can see your friend request",
            "ta":"உங்கள் நண்பர் கோரிக்கையை யார் பார்க்க முடியும்",
            "gu":"તમારી ફ્રેન્ડ રિક્વેસ્ટ કોણ જોઈ શકે છે",
          }
        },
        {
          "0":{
            "en":"Who can see your Mobile number",
            "hi":"आपका मोबाइल नंबर कौन देख सकता है",
            "sa":"Who can see your Mobile number",
            "ta":"உங்கள் மொபைல் எண்ணை யார் பார்க்க முடியும்",
            "gu":"તમારો મોબાઈલ નંબર કોણ જોઈ શકે છે",
          }
        },
        {
          "0":{
            "en":"Who can see your Email Address",
            "hi":"आपका ईमेल पता कौन देख सकता है",
            "sa":"Who can see your Email Address",
            "ta":"உங்கள் மின்னஞ்சல் முகவரியை யார் பார்க்க முடியும்",
            "gu":"તમારું ઇમેઇલ સરનામું કોણ જોઈ શકે છે",
          }
        }
      ];

      let privacyType = [{"0":"family"},{"0":"only me"}];
      let privacyType2 = [{"0":"everyone"},{"0":"no one"}];

      let privacyTypeTitle = [
        {
          "family":{
            "en":"Family",
            "hi":"परिवार",
            "sa":"गृहजनः",
            "ta":"குடும்பம்",
            "gu":"કુટુંબ",
          }
        },
        {
          "only me":{
            "en":"Only me",
            "hi":"केवल मैं",
            "sa":"Only me",
            "ta":"நான் மட்டும்",
            "gu":"માત્ર મને",
          }
        }
      ];
      let privacyType2Title = [
        {
          "everyone":{
            "en":"Everyone",
            "hi":"सब लोग",
            "sa":"Everyone",
            "ta":"அனைவரும்",
            "gu":"દરેક વ્યક્તિ",
          }
        },
        {
          "no one":{
            "en":"No one",
            "hi":"कोई नहीं",
            "sa":"No one",
            "ta":"யாரும் இல்லைં",
            "gu":"કોઈ નહીં",
          }
        }
      ];


        return new Promise(function(resolve, reject){
            privacy.forEach(async (item, i) => {
              let permission = [];
              if(privacy[i][0]=="friend_request"){
                await privacyType2.forEach(async (type, j) => {
                  let status=0;
                  if(data && data[privacy[i][0]]==type[0]) status=1;
                  if(!data && type[0]=="everyone") status=1;
                  permission.push({privacy_type_name:privacyType2Title[j][type[0]][lang],status});
                });
              }else {
                await privacyType.forEach(async (type, j) => {
                  let status=0;
                  if(data && data[privacy[i][0]]==type[0]) status=1;
                  if(!data && type[0]=="family") status=1;
                  permission.push({privacy_type_name:privacyTypeTitle[j][type[0]][lang],status});
                });
              }
              privacyAndPermission.push({privacy_name:privacy_title[i][0][lang],permission});
              if(i==privacy.length-1){
                resolve(privacyAndPermission);
              }
            })



        })
    }



    const userList = async (req, res, next, transaction) => {
      console.log("UserController=>userList");
        let { search,is_completed_profile_users,page ,limit  } = req.query;
        let {userId,family_tree,adminId} = req.body;
        let user_ids = [];

        console.log("family_tree");
        console.log(family_tree);
        if(family_tree && !adminId){
          let family_member = await FamilyService().fetchMemberByQuery({family_tree,added_by:"manual"}, transaction);
          user_ids = await family_member.length>0?family_member.map(a=>a.registered_id):[];

          const index = user_ids.indexOf(userId);
          if (index > -1) {
            user_ids.splice(index, 1);
          }
        }
        let filters = { userId,search,is_completed_profile_users,user_ids, page, limit };

        let result = await UserService().userList(filters,transaction);
        let total_active_user = await UserService().countActiveUser(transaction);
        let total_inactive_user = await UserService().countDeactiveUser(transaction);
        let total_user = result.count;
        let user = result.rows;
        if(user.length>0) user = await getFamilyTreeDetails(user,transaction);
        req.rData = { total_user,total_active_user,total_inactive_user, page, limit, user };
        req.msg = 'user_list';
        next();

      }

      const getFamilyTreeDetails = (data,transaction) => {
        console.log("UserController=>getFamilyTreeDetails");
            let userData = []
              return new Promise(async function(resolve, reject){
                for (var i = 0; i < data.length; i++) {
                  let { id,name,email,mobile,countryCode ,gender,dob,aniversary,image,device_token,profile_stage,active,notification_permission,language,user_id,family_tree_details } = data[i];
                  let tree_id = family_tree_details?family_tree_details.active_tree:null;
                  let family_tree = null;
                  if(tree_id!=null){
                    let tree_details = await FamilyService().fetchFamilyTree({id:tree_id}, transaction);
                    family_tree = tree_details.name;
                  }
                  userData.push({id,name,email,mobile,countryCode ,gender,dob,aniversary,image,device_token,profile_stage,active,notification_permission,language,user_id,family_tree});
                  if(i==data.length-1)
                  resolve(userData);
                }

              })
          }

    const addFamilyTree = (item,transaction) => {
            return new Promise(async function(resolve, reject){
                let userId = item.id;
                let family_tree_result1 = await FamilyService().addFamilyTree({userId,name:"Family Tree 1"}, transaction);
                let family_tree_result2 = await FamilyService().addFamilyTree({userId,name:"Family Tree 2"}, transaction);
                let family_tree_1 = family_tree_result1.id;
                let family_tree_2 = family_tree_result2.id;
                let member = { userId,family_tree:family_tree_1,registered_id:userId, name:item.name,countryCode:item.countryCode ,mobile:item.mobile ,image:item.image,added_by:"default"};
                let member_result = await FamilyService().addFamilyMember(member, transaction);
                let member2 = { userId,family_tree:family_tree_2,registered_id:userId, name:item.name,countryCode:item.countryCode ,mobile:item.mobile ,image:item.image,added_by:"default"};
                let member_result2 = await FamilyService().addFamilyMember(member2, transaction);

                let tree = {userId,family_tree_1,family_tree_2,active_tree:family_tree_1}
                let user_family_tree_result = await FamilyService().addUsersFamilyTree(tree, transaction);
                let chat_result = await FamilyController().addMemberInDefaultChatGroup(userId,userId,family_tree_1,config.TWILIO_ADMIN_ROLE_SID,transaction);
                let chat_result2 = await FamilyController().addMemberInDefaultChatGroup(userId,userId,family_tree_2,config.TWILIO_ADMIN_ROLE_SID,transaction);
                resolve(true);


            })
        }

    const checkMobile = async (req, res, next, transaction) => {
          console.log("UserController => checkMobile");

          let { userId } = req.body;
          let { countryCode,mobile } = req.query;

          let user_data = await UserService().fetchByMobile(countryCode,mobile, transaction);
          req.rData = { user_data };

          req.msg = 'user_details';
          next();


      }

    const getLogs = async (req, res, next, transaction) => {
        console.log("UserController=>getLogs");
          let {userId} = req.body;
          let {page,limit} = req.query;
          let total_logs = await UserService().countLogs({userId},transaction);
          let logs = await UserService().getLogs({userId},page,limit,transaction);
          let logs_rows = logs.rows;
          req.rData = { page,limit,total_logs,logs:logs_rows };
          req.msg = 'user_logs';
          next();

        }

    const updateDeviceToken = async (req, res, next) => {
          console.log("UserController => updateDeviceToken");
          let { userId,device_token,device_type,language} = req.body;

          let user = {} ;
          if(device_token) user.device_token = device_token ;
          if(device_type) user.device_type = device_type ;
          if(language) user.language = language ;

          let result = await UserService().updateProfile(userId,user);
          user = await UserService().fetch(userId);

          let notification_permission = user.notification_permission;
          device_token = user.device_token
          device_type = user.device_type
          language = user.language
          req.rData = {device_token,device_type,notification_permission,language};
          req.msg = 'token_changed';
          next();


        }

    const getAllFeeds = async (req, res, next, transaction) => {
      console.log("UserController=>getAllFeeds");
        let {userId,family_tree} = req.body;
        let {page,limit,search} = req.query;
        let filters = { search,family_tree, page, limit };

        let feed_list = await FeedService().feedList(filters,transaction);
        feed_list = feed_list.rows;
        if(feed_list.length>0) feed_list = await getAllFeedsData(feed_list,userId,transaction);
        let wish_list = await getAllUserForWish(userId,family_tree,filters,transaction);
        feed_list = await feed_list.concat(wish_list)
        feed_list = await helpers().sortArray(feed_list);
        let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
        if(user_family_tree){
          let family_tree_1 = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.name:null;
          let family_tree_1_id = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.id:null;
          let family_tree_2 = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.name:null;
          let family_tree_2_id = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.id:null;
          user_family_tree = {family_tree_1,family_tree_1_id,family_tree_2,family_tree_2_id,active_tree:user_family_tree.active_tree} ;
        }
        req.rData = { language:req.authUser.language, page, limit, feed_list,user_family_tree };
        req.msg = 'feed_list';
        next();

    }

    const getAllFeedsData = async (data,user_id,transaction) => {
      console.log("UserController=>getAllFeedsData");
          let feedData = []
            for (var item of data) {
                let { id,albumId,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,created_by,createdAt,lastCommentAt } = item;
                like_type = like_type?like_type.split(","):[];
                let query = {userId:user_id,feed_id:id};
                let userLike = await LikeService().fetchByQuery(query,transaction);
                let userComments = await CommentService().fetchByQuery(query,transaction);
                let my_liked_type = userLike?userLike.like_type:'';
                let isLiked = userLike?userLike.isLiked=='1'?true:false:false;
                let isCommented = userComments?true:false;
                if(feed_type=="memory" || feed_type=="home memory"){
                  let tagged_user = await AlbumService().getTagedUser(id,transaction);
                  let files = await AlbumService().getFiles({memory_id:id}, transaction);
                  let album = albumId?await AlbumService().getAlbumName(albumId, transaction):null;
                  let tagged_user_count = tagged_user.count;
                  let tagged_user_rows = tagged_user.rows;
                  let tagged_user_details = await tagged_user_rows?tagged_user_rows.map(a => a.userDetails):[];
                  tagged_user = {count:tagged_user_count,rows:tagged_user_details};
                  feedData.push({id,userId,family_tree,title ,description,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt,lastCommentAt,tagged_user,files,album});
                }else {
                  feedData.push({id,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt,lastCommentAt});
                }
              }
              return feedData;

        }

    const getAllUserForWish =(userId, family_tree,filters,transaction) => {
        console.log('UserController=>getAllUserForWish');
          return new Promise( async function(resolve, reject){
            let family_member = await FamilyService().fetchMemberByQuery({family_tree,added_by:"manual",registered_id:{[Op.ne]: null}}, transaction);
            let user_ids = await family_member.length>0?family_member.map(a=>a.registered_id):[];
            console.log("user_ids");
            console.log(user_ids);
            let year = await getTodayDate('','','1');
            const index = user_ids.indexOf(userId);
            let wished_data = await WishService().getAllWishedData(user_ids,year,filters, transaction);
            if(wished_data.length>0) wished_data = await getAllUsers(wished_data,userId,family_tree,"1", transaction);
            resolve(wished_data);

          })
      }

    const getAllUsers =(data,userId, family_tree,type,transaction) => {
        console.log('WishController=>getAllUsers');
        let user_data = [];
          return new Promise( async function(resolve, reject){

            data.forEach(async (item, i) => {

              let {id,partnerId,type,createdAt,total_like,total_unlike,total_comment,like_type,lastCommentAt} = item;
              let user_details = await UserService().fetch(partnerId, transaction);
              let {name,email,mobile,countryCode,gender,dob,aniversary,image} = user_details;

              let member_details = await FamilyService().fetchSpouse({registered_id:partnerId,status:true,family_tree,added_by:"manual"}, transaction);
              let spouseId = member_details.spouseId;
              let memberId = member_details.id;
              let spouse_query = {spouseId:memberId,status:true,family_tree,added_by:"manual"}
              if(spouseId) spouse_query = {id:spouseId,status:true,family_tree,added_by:"manual"}
              let spouse_details = await FamilyService().fetchSpouse(spouse_query, transaction);
              like_type = like_type?like_type.split(","):[];
              let query = {userId,wish_id:id};
              let userLike = await LikeService().fetchByQuery(query,transaction);
              let userComments = await CommentService().fetchByQuery(query,transaction);

              let my_liked_type = userLike?userLike.like_type:'';

              let isLiked = userLike?userLike.isLiked=='1'?true:false:false;
              let isCommented = userComments?true:false;
              user_data.push({id,feed_type:"wish",userId:partnerId,name,email,mobile,countryCode,gender,dob,aniversary,image,type,spouse_details,total_like,total_unlike,total_comment,like_type,isLiked,isCommented,my_liked_type,wished_data:item,lastCommentAt});
              if(i==data.length-1) resolve(user_data);
            });

          })
      }

    const getTodayDate =(onlyDate,onlyDateMonth,OnlyYear)=>{
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            if(onlyDate!='')
              return yyyy + '-' + mm + '-' + dd;
            if(onlyDateMonth!='')
              return  dd+'-'+mm;
            if(OnlyYear!='')
              return  yyyy;
    }

    const getAllBlockedUsers = async (req, res, next, transaction) => {
      console.log("FriendController => getAllBlockedUsers");

      let { userId,family_tree } = req.body;
      let { search,page,limit } = req.query;
      let query = {}
      if(!search) query = {blockedBy:userId,family_tree};
      else query = {blockedBy:userId,family_tree,'$blockedUserDetails.name$':{[Op.like]:'%'+search+'%'}}
      let blocked_user_list = await FamilyService().fetchBlockedUser(query,page,limit, transaction);
      //if(blocked_user_list.length>0) friends_list = await validateAcceptedFriendsList(userId,friends_list)
      req.rData = { blocked_user_list };
      req.msg = 'blocked_user_list';
      next();


  }


      const activateEmail = async (req, res, next) => {
        console.log("UserController => updateDeviceToken");
        let { userId} = req.body;

        let user = {isEmailVerified:true} ;

        let result = await UserService().updateProfile(userId,user);

        req.msg = 'email_verified';
        next();


      }


    return {
      fetchPrivacyAndPolicy,
      fetchTermAndConditions,
      getAboutApp,
      getHelplineDetails,
      changePassword,
      updateProfile,
      changePrivacyAndPermission,
      getPrivacyAndPermission,
      getFAQs,
      userList,
      checkMobile,
      getLogs,
      updateDeviceToken,
      getAllFeeds,
      getAllBlockedUsers,
      activateEmail
    }
}
