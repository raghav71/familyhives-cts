const { Op } = require("sequelize");
const FriendService = require("../services/FriendService");
const UserService = require("../services/UserService");
const TwilioService = require("../services/TwilioService");
const FamilyService = require("../services/FamilyService");
const helpers = require("../util/helpers");

module.exports = () => {

    const sendFriendRequest = async (req, res, next, transaction) => {
      console.log("FriendController => sendFriendRequest");
      let { friendId,userId,family_tree } = req.body;
      let data = {userId,friendId,family_tree};
      let query = {family_tree,[Op.or]: [{userId,friendId},{userId:friendId,friendId:userId}]};
      let check_result = await FriendService().fetchByQuery(query,null,null, transaction);
      let friend_result = await UserService().fetch(friendId, transaction);

      if(check_result.length==0){
        req.msg = "request_sent";
        let result = await FriendService().sendFriendRequest(data, transaction);
        if(friend_result){
          console.log('friend_result');
          console.log(friend_result.notification_permission);
          if(friend_result.notification_permission=="allow"){
            let title = "friend_request";
            let msg = "request_message"
            //let body = req.authUser.name+" sent you a friend request!";
            //let data = {title,body,type:"friend"}
            let type = "friend";
            let lang = friend_result.language;
            console.log(title);
            let notification_result = helpers().sendNotification(friend_result.device_token,friend_result.device_type,title,msg,req.authUser.name,"friend",null,friendId,friend_result.language)
            //let notification_result = helpers().sendNotification(friend_result.device_token,friend_result.device_type,title,body,data,friendId)
          }
        }
      }else {
        req.msg = "request_already_sent";
        req.rData={check_result}
      }
      next();

    }


    const getRequestList = async (req, res, next, transaction) => {
        console.log("FriendController => getRequestList");

        let { userId,family_tree } = req.body;
        let { search,page,limit } = req.query;
        let query = {}
        if(!search) query = {friendId:userId,status:'0'};
        else query = {friendId:userId,status:'0','$userDetails.name$':{[Op.like]:'%'+search+'%'}};
        let request_list = await FriendService().fetchByQuery(query,page,limit, transaction);
        req.rData = { request_list };

        req.msg = 'request_list';
        next();


    }

    const acceptRejectRequest = async (req, res, next, transaction) => {
        console.log("FriendController=>addFamilyMembers");
          let { userId, request_id,status } = req.body;
          let data = { status};
          let update_result = await FriendService().updateRequest({id:request_id,friendId:userId},data, transaction);
          console.log('update_result');
          console.log(update_result);
          let request_result = await FriendService().fetch(request_id, transaction);
          let friend_result = await UserService().fetch(request_result.userId, transaction);

          if(friend_result){
            console.log('friend_result');
            console.log(friend_result.notification_permission);
            if(friend_result.notification_permission=="allow"){
              let title = status==1?"friend_request_accpted_title":"friend_request_rejected_title";
              let msg = status==1?"friend_request_accpted":"friend_request_accpted";
              let data = {title,body:msg,type:"friend"}

              let notification_result = helpers().sendNotification(friend_result.device_token,friend_result.device_type,title,msg,req.authUser.name,"friend",null,friend_result.id,friend_result.language)
              //let notification_result = helpers().sendNotification(friend_result.device_token,friend_result.device_type,title,msg,data,request_result.userId)
            }
          }
          req.msg = status==1?'request_accepted':'request_rejected';
          next();
    }

    const getFriendsList = async (req, res, next, transaction) => {
          console.log("FriendController=>getFamilyMembers");
            let { userId,mobile,family_tree} = req.body;
            try {
              if(mobile) mobile = JSON.parse(mobile.replace(/\\/g,""));
            } catch (e) {

            }
            let friends_list = null;
            if(mobile.length>0) friends_list = await validateFriendsList(userId,family_tree,mobile,transaction);
            req.msg = "friends_list";
            req.rData = { friends_list };
            next();


          }

    const validateFriendsList = (userId,family_tree,user_data,transaction) => {
      let friendData = [];
      let registeredUserData = [];
      let userData = [];
      return new Promise(async function(resolve, reject){
        for (var i = 0; i < user_data.length; i++) {
          let {mobile,name} = user_data[i];
          if(mobile!=""){
          let check_mobile = await  UserService().fetchByMobileForFriendList(mobile, transaction);
          if(!check_mobile) check_mobile = await  UserService().fetchByOnlyMobile(mobile, transaction);
          let registered_user_id = null;
          if(check_mobile){
            if(check_mobile.id!=userId){
              registered_user_id = check_mobile.id;
              let blocked_status = await  FamilyService().checkBlockedUser({[Op.or]:[{userId,blockedBy:check_mobile.id},{userId:check_mobile.id,blockedBy:userId}],family_tree}, transaction);
              let isBlocked = blocked_status?1:0
              let blockedBy = blocked_status?blocked_status.blockedBy:null;
              let check_friend_status = await  FriendService().checkStatus({userId,friendId:check_mobile.id}, transaction);
              let is_chatting = await TwilioService().fetchIndividualChats({family_tree,[Op.or]: [{userId,partner_id:check_mobile.id},{userId:check_mobile.id,partner_id:userId}]}, transaction);
              let chat_status = is_chatting?true:false;
              let request_status = check_friend_status?check_friend_status.status:null
              if(check_friend_status || is_chatting) friendData.push({user:check_mobile,registered_status:1,request_status:request_status,isBlocked,blockedBy,registered_user_id,chat_status});
              else registeredUserData.push({user:check_mobile,registered_status:1,request_status:null,isBlocked,blockedBy,registered_user_id,chat_status});
            }
          }else {
            userData.push({mobile,name,user:null,registered_status:0,request_status:null,isBlocked:0,blockedBy:null,registered_user_id:null,chat_status:false});

          }
        }
          if(i==user_data.length-1){
            userData = await friendData.concat(registeredUserData.concat(userData))
            resolve(userData);
          }
        }

      })
  }

    const getAcceptedFriendList = async (req, res, next, transaction) => {
      console.log("FriendController => getAcceptedFriendList");

      let { userId,family_tree } = req.body;
      let { search,page,limit } = req.query;
      let query ={};
      if(!search) query = {[Op.or]: {userId,friendId:userId},status:'1'};
      else query = {[Op.or]: [{userId,'$friendDetails.name$':{[Op.like]:'%'+search+'%'}},{friendId:userId,'$userDetails.name$':{[Op.like]:'%'+search+'%'}}],status:'1'}
      let friends_list = await FriendService().fetchByQuery(query,page,limit, transaction);
      if(friends_list.length>0) friends_list = await validateAcceptedFriendsList(userId,friends_list)
      req.rData = { friends_list };
      req.msg = 'friends_list';
      next();


  }

    const validateAcceptedFriendsList = (user_id,user_data) => {
    let userData = [];
        return new Promise(async function(resolve, reject){
          for (var i = 0; i < user_data.length; i++) {
            let {id,userId,friendId,status,isBlocked,blockedBy,friendDetails,userDetails} = user_data[i];

            userDetails = await userId==user_id?friendDetails:userDetails;
            userData.push({id,userId,friendId,status,isBlocked,blockedBy,userDetails});

            if(i==user_data.length-1)
              resolve(userData);
          }

        })
    }

    const getBlockedFriendList = async (req, res, next, transaction) => {
      console.log("FriendController => getBlockedFriendList");

      let { userId,family_tree } = req.body;
      let { search,page,limit } = req.query;
      let query = {}
      if(!search) query = {[Op.or]: {userId,friendId:userId},isBlocked:1,blockedBy:userId};
      else query = {[Op.or]: [{userId,'$friendDetails.name$':{[Op.like]:'%'+search+'%'}},{friendId:userId,'$userDetails.name$':{[Op.like]:'%'+search+'%'}}],isBlocked:1,blockedBy:userId}
      let friends_list = await FriendService().fetchByQuery(query,page,limit, transaction);
      if(friends_list.length>0) friends_list = await validateAcceptedFriendsList(userId,friends_list)
      req.rData = { friends_list };
      req.msg = 'friends_list';
      next();


  }

  return {
      sendFriendRequest,
      getRequestList,
      acceptRejectRequest,
      getFriendsList,
      getAcceptedFriendList,
      getBlockedFriendList
    }
}
