const { Op } = require("sequelize");
const TwilioService = require('../services/TwilioService');
const FamilyService = require('../services/FamilyService');
const FriendService = require("../services/FriendService");
const UserService = require('../services/UserService');
const config = require('../../config/twilio_config.js');

module.exports = () => {

  const generateToken = async (req, res, next) => {

    console.log("TwilioController => generateToken");
    let { userId } = req.body;
    let { device,token_type,room } = req.query;
    let user_name = req.authUser.name;
    let token = await TwilioService().generateToken(userId,device,token_type,room,user_name);
    let virgilToken = await TwilioService().generateVirgilJwt(userId);
    req.rData = { token,virgilToken }
    req.msg = 'token_generated';
    next();
}

  const generateUserTwilioToken = async (req, res, next) => {

    console.log("TwilioController => generateUserTwilioToken");
    let { userId } = req.body;
    let { user_id,device,token_type,room,user_name } = req.query;
    console.log("userId");
    console.log(userId);
    console.log(parseInt(user_id));
    let token = await TwilioService().generateToken(parseInt(user_id),device,token_type,room,user_name);

    req.rData = { token }
    req.msg = 'token_generated';
    next();
  }

  const generateVirgilJwt = async (req, res, next) => {

    console.log("TwilioController => generateVirgilJwt");
    let { user_id } = req.query;
    let virgilToken = await TwilioService().generateVirgilJwt(user_id);
    req.rData = { virgilToken }
    req.msg = 'token_generated';
    next();
  }

  const createGroup = async (req, res, next,transaction) => {
    console.log("TwilioController => createGroup");
    let { userId,group_name,image,members_data,family_tree } = req.body;
    try {
      members_data = JSON.parse(members_data.replace(/\\/g,""))
    } catch (e) {
      console.log("Error"+e);
    }
    let family_tree_data = await FamilyService().fetchFamilyTree({userId}, transaction);
    let group_result = await TwilioService().saveGroup({userId,group_name,image,isDefaultGroup:0,family_tree},transaction);

    let twilio_result = await TwilioService().createGroup(group_result.id,userId);

    let update_result = await TwilioService().updateGroupDetails({id:group_result.id},{group_sid:twilio_result.sid},transaction);
    if(members_data.length>0) members_result = await addParticipants(members_data,group_result.id,twilio_result.sid,transaction);
    let twilio_participants_result = await TwilioService().addParticipants(twilio_result.sid,userId,config.TWILIO_ADMIN_ROLE_SID,transaction);

    let participants_result = await TwilioService().saveParticipants({group_id:group_result.id,member_id:userId,member_sid:twilio_participants_result.sid,role:"admin"},transaction);
    let group_details =  await getGroupData(group_result.id,transaction)

    req.rData = { group_details }
    req.msg = 'group_created';
    next();
}

  const addParticipants = (members_data,group_id,group_sid,transaction) => {

      return new Promise(async function(resolve, reject){

        for (var i = 0; i < members_data.length; i++) {
          let member_id = members_data[i].user_id;

          let twilio_participants_result = await TwilioService().addParticipants(group_sid,member_id,config.TWILIO_USER_ROLE_SID,transaction);
          console.log(twilio_participants_result);
          let participants_result = await TwilioService().saveParticipants({group_id,member_id,member_sid:twilio_participants_result.sid},transaction);
          if(i==members_data.length-1)
            resolve(true);
        }

      })
  }

  const updateGroupImage = async (req, res, next,transaction) => {
    console.log("TwilioController => updateGroupImage");
    let { userId,group_id,image } = req.body;

    let member_details = await TwilioService().getParticipantsByQuery({group_id,member_id:userId},transaction);
    if(member_details.length>0){
    let update_result = await TwilioService().updateGroupDetails({id:group_id},{image},transaction);
    req.msg = 'group_image_updated';
    }else {
      req.msg = 'unauthorized';
    }
    next();
}

  const getGroupList = async (req, res, next,transaction) => {
      console.log("TwilioController => getGroupList");
      let { userId,family_tree } = req.body;
      let { search,page,limit } = req.query;
      let participants_list = await TwilioService().getAllParticipants({member_id:userId},transaction);
      let group_id = await participants_list.rows?participants_list.rows.map(a => a.group_id):[];
      console.log('group_id');
      console.log(group_id);
      let query = {id:{[Op.in]: group_id},isDefaultGroup:0,family_tree}
      if(search) query.group_name={[Op.like]:'%'+search+'%'};
      let group_list = await TwilioService().getGroupList(query,page,limit,transaction);
	  let group_list_all = await TwilioService().getGroupList(queryall,page,limit,transaction);
      let default_group_list = await TwilioService().getGroupList({isDefaultGroup:1,family_tree},null,null,transaction);
      let individual_chat_data = await TwilioService().getAllIndividualChats({[Op.or]: [{userId},{partner_id:userId}],"isFamilyMember": true,family_tree},page,limit,transaction);
      let individual_chat_list = individual_chat_data.rows;
      if(group_list.length>0) group_list = await getAllGroupParticipants(group_list,transaction);
      if(default_group_list.length>0) default_group_list = await getAllGroupParticipants(default_group_list,transaction);
      if(individual_chat_list.length>0) individual_chat_list = await getUserDetails(individual_chat_list,userId,'1',search,transaction)
      let other_chat_list = await group_list.concat(individual_chat_list);
      req.rData = { group_list_all: group_list_all, default_group_list:default_group_list[0], other_chat_list }
      req.msg = 'group_list';

      next();
  }

  const getAllGroupParticipants = (groups,transaction) => {
      let data = [];
          return new Promise(async function(resolve, reject){
            for (var i = 0; i < groups.length; i++) {
              let {id,group_sid,group_name,family_tree,image} = groups[i];
              let participants_list = await TwilioService().getAllParticipants({group_id:id},transaction);
              let total = participants_list.count;
              let participants = participants_list.rows;
              if(participants.length>0) participants = await getMembersDetails(participants,transaction);
              data.push({id,group_sid,group_name,family_tree,image,group_details:{id,group_sid,group_name,family_tree,image},chat_type:"group_chat",participants});
              if(i==groups.length-1)
                resolve(data);
            }

          })
      }

  const getGroupDetails = async (req, res, next,transaction) => {
      console.log("TwilioController => getGroupDetails");
      let group_details =  await getGroupData(group_id,transaction)
      req.rData = {  group_details }
      req.msg = 'group_details';

      next();
  }

  const getGroupData = async (group_id,transaction) => {
      console.log("TwilioController => getGroupData");

      let group_data = await TwilioService().getGroupDetails({id:group_id},transaction);
      let participants_list = await TwilioService().getAllParticipants({group_id},transaction);
      let total = participants_list.count;
      let participants = participants_list.rows;
      if(participants.length>0) participants = await getMembersDetails(participants,transaction)
      let {id,group_sid,group_name,image}=group_data;
      let group_details =  {id,group_sid,group_name,image,participants};
      return group_details;
  }

  const getAllParticipants = async (req, res, next,transaction) => {
      console.log("TwilioController => getAllParticipants");
      let { group_id,group_sid } = req.query;
      let query = {}
      if(group_sid) query.group_sid = group_sid;
      if(group_id) query.group_id = group_id;
      if(group_id || group_sid){
        let group_details = await TwilioService().getGroupDetails(query,transaction);
        let participants_list = await TwilioService().getAllParticipants({group_id:group_details.id},transaction);
        let total = participants_list.count;
        let participants = participants_list.rows;
        req.rData = {  group_id,group_sid,total,participants }
        req.msg = 'participants_list';
      }else {
        req.rCod
        req.msg = 'group_data_missing';
      }
      next();
  }

  const getMembersDetails = (participants,transaction) => {
    let userData = [];
        return new Promise(async function(resolve, reject){
          for (var i = 0; i < participants.length; i++) {
            let {id,group_id,member_sid,member_id,status,role} = participants[i];
            let participants_details = null;
            //if(role=="member") participants_details = await FamilyService().fetchFamilyMember(member_id,transaction);
            if(true) participants_details = await UserService().fetch(member_id,transaction);
            userData.push({id,group_id,member_sid,status,role,participants_details});
            if(i==participants.length-1)
              resolve(userData);
          }

        })
    }

  const addIndividualMember = async (req, res, next,transaction) => {
      console.log("TwilioController => addIndividualMember");
      let { userId,family_tree,partner_id,chat_sid,isFamilyMember } = req.body;
      let data = { userId,partner_id,chat_sid,isFamilyMember,family_tree };
      let type = isFamilyMember=='true'?1:2;
      let exist_chat_data = await TwilioService().getAllIndividualChats({isFamilyMember,[Op.or]: [{userId,partner_id},{userId:partner_id,partner_id:userId}]},null,null,transaction);
      let exist_chat_list = exist_chat_data.rows;
      console.log('exist_chat_list');
      console.log(exist_chat_list);
      if(exist_chat_list.length==0){
        let result = await TwilioService().addIndividualMember(data,transaction);
        let query = {id:result.id}
        let individual_chat_data = await TwilioService().getAllIndividualChats(query,null,null,transaction);
        let individual_chat_list = individual_chat_data.rows;
        if(individual_chat_list.length>0) {
          individual_chat_list = await getUserDetails(individual_chat_list,userId,type,null,transaction)
          participants_details = await individual_chat_list[0].participants_details
          req.rData = { id:result.id,chat_sid,isFamilyMember,participants_details}
        }else {
          req.rData = null
        }
        req.msg = 'chat_saved';
      }else {
        exist_chat_list = await getUserDetails(exist_chat_list,userId,type,null,transaction)
        participants_details = await exist_chat_list[0].participants_details
        req.rData = { id:exist_chat_list[0].id,chat_sid,isFamilyMember,participants_details}
        req.msg = 'chat_exist';
      }
      next();
  }

  const getAllIndividualChats = async (req, res, next,transaction) => {
      console.log("TwilioController => getAllIndividualChats");
      let { userId,family_tree } = req.body;
      let { type,page,limit,search } = req.query;
      let query = {[Op.or]: [{userId},{partner_id:userId}]};
      query.isFamilyMember = type==1?true:false;
      if(type==1) query.family_tree = family_tree;
      let individual_chat_data = await TwilioService().getAllIndividualChats(query,page,limit,transaction);
      let individual_chat_list = individual_chat_data.rows;
      if(individual_chat_list.length>0) individual_chat_list = await getUserDetails(individual_chat_list,userId,type,search,transaction)
      req.rData = {  individual_chat_list }
      req.msg = 'individual_chat_list';

      next();
  }

  const getUserDetails = (participants,user_id,type,search,transaction) => {
      let userData = [];
          return new Promise(async function(resolve, reject){

            for (var i = 0; i < participants.length; i++) {
              let {id,userId,partner_id,chat_sid,isFamilyMember,family_tree,isBlocked,blockedBy} = participants[i];
              let main_user = await userId==user_id?partner_id:userId;
              let user_query = {id:main_user};
              if(search) user_query.name={[Op.like]:'%'+search+'%'};
              let participants_details = await UserService().fetchByQuery(user_query,transaction);
              if(search==null || participants_details!=null)
              userData.push({id,userId,chat_sid,isFamilyMember,family_tree,isBlocked,blockedBy,chat_type:"individual_chat",participants_details});
              if(i==participants.length-1)
                resolve(userData);
            }

          })
      }

      const removeParticipants = async (req, res, next,transaction) => {
        console.log("TwilioController => removeParticipants");
        let { userId,group_sid,member_sid,member_id } = req.body;
        let group_details = await TwilioService().getGroupDetails({group_sid},transaction);
        let result = await TwilioService().removeParticipants(group_sid,member_sid,transaction);
        let result2 = await TwilioService().removeGroupMember({group_id:group_details.id,member_id,member_sid},transaction);
        req.msg = 'participant_removed';
        next();
    }

    const blockParticipants = async (req, res, next,transaction) => {
      console.log("TwilioController => blockParticipants");
      let { userId,member_id } = req.body;
      let result2 = await TwilioService().updateParticipants(member_id,{status:"block"},transaction);
      let participants_details = await TwilioService().fetchParticipants(member_id,transaction);
      req.rData = {participants_details}
      req.msg = 'participant_blocked';
      next();
  }

  const blockUnblockParticipants = async (req, res, next,transaction) => {
    console.log("TwilioController => blockUnblockParticipants");
    let { userId,isBlocked,partner_id,family_tree } = req.body;
    let block_data =await (isBlocked==1)?{ isBlocked,blockedBy:userId}:{ isBlocked,blockedBy:null}
    let friend_query = {[Op.or]:[{userId,friendId:partner_id},{userId:partner_id,friendId:userId}]};
    let chat_query = {[Op.or]:[{userId,partner_id},{userId:partner_id,partner_id:userId}]};
    let family_query = {registered_id:partner_id,family_tree};
    let block_query = {userId:partner_id,blockedBy:userId,family_tree}
    let exist = await TwilioService().fetchIndividualChats(chat_query,transaction);
    let friends_exist = await FriendService().fetchByQuery(friend_query,null,null, transaction);

    //if(exist || friends_exist.length==0){
      if(exist.isBlocked==0 && isBlocked==1){
        let chat_block_result = await TwilioService().updateIndividualMember(chat_query,block_data,transaction);
        let friend_block_result = await FriendService().updateRequest(friend_query,block_data, transaction);
        let family_block_result = await FamilyService().updateFamilyMemberProfile(family_query,block_data, transaction);
        let user_block_result = await FamilyService().addBlockedUser(block_query, transaction);
        req.msg = 'participant_blocked';
      }
      else {
        if(exist.blockedBy==userId){
          let chat_block_result = await TwilioService().updateIndividualMember(chat_query,block_data,transaction);
          let friend_block_result = await FriendService().updateRequest(friend_query,block_data, transaction);
          let family_block_result = await FamilyService().updateFamilyMemberProfile(family_query,block_data, transaction);
          let user_unblock_result = await FamilyService().removeBlockedUser(block_query, transaction);
           req.msg = 'participant_unblocked';
        }else {
          req.msg = 'unauthorized';

        }
      }
      let participants_details = await TwilioService().fetchIndividualChats(chat_query,transaction);
      req.rData = {participants_details}


    next();
  }

  const clearChatHistory = async (req, res, next,transaction) => {
    console.log("TwilioController => clearChatHistory");
    let { userId,group_sid,messages_sid } = req.body;
    try {
      if(messages_sid) messages_sid = JSON.parse(messages_sid.replace(/\\/g,""));

    } catch (e) {

    }
    let result = await removeGroupMessages(group_sid,messages_sid,transaction);
    req.msg = 'chat_cleared';
    next();
}

const removeGroupMessages = (group_sid,messages_sid,transaction) => {
      return new Promise(async function(resolve, reject){
        for (var i = 0; i < messages_sid.length; i++) {
          let message_sid = messages_sid[i];
          let clear_result = await TwilioService().clearChatHistory(group_sid,message_sid,transaction);

          if(i==messages_sid.length-1)
            resolve(true);
        }

      })
  }

  const removeChannel = async (req, res, next,transaction) => {
    console.log("TwilioController => removeParticipants");
    let { userId,channel_sid } = req.body;
    let result = await TwilioService().removeChannel(channel_sid,transaction);
    req.msg = 'channel_removed';
    next();
}
return {
  generateToken,
  generateUserTwilioToken,
  generateVirgilJwt,
  createGroup,
  updateGroupImage,
  getGroupList,
  getGroupDetails,
  getAllParticipants,
  addIndividualMember,
  getAllIndividualChats,
  removeParticipants,
  blockParticipants,
  blockUnblockParticipants,
  clearChatHistory,
  removeChannel
}
}
